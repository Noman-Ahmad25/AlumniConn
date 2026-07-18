from sqlalchemy.orm import Session, selectinload
from sqlalchemy import text, and_, or_, select
from typing import List, Tuple

from src.database.session import SessionLocal
from src.models.user import User, UserRole
from src.models.profile import Profile
from src.models.connection import Connection, ConnectionStatus
from src.schemas.recommendation import RecommendationResponse
from src.utils.embedding import generate_semantic_text, compute_semantic_hash, get_embedding
from src.utils.event_bus import event_bus
from src.models.notification import NotificationType

def calculate_rule_based_score(current_profile: Profile, candidate_profile: Profile) -> float:
    """Calculates a rule-based matching score between 0.0 and 1.0"""
    score = 0.0
    
    # Skills match (Jaccard similarity approximation)
    if current_profile.skills and candidate_profile.skills:
        cur_skills = set([s.lower() for s in current_profile.skills])
        cand_skills = set([s.lower() for s in candidate_profile.skills])
        if cur_skills and cand_skills:
            intersection = len(cur_skills.intersection(cand_skills))
            union = len(cur_skills.union(cand_skills))
            score += (intersection / union) * 0.5
            
    # Interests match
    if current_profile.interests and candidate_profile.interests:
        cur_interests = set([i.lower() for i in current_profile.interests])
        cand_interests = set([i.lower() for i in candidate_profile.interests])
        if cur_interests and cand_interests:
            intersection = len(cur_interests.intersection(cand_interests))
            union = len(cur_interests.union(cand_interests))
            score += (intersection / union) * 0.2
            
    # Major/Department
    if current_profile.major and candidate_profile.major and current_profile.major.lower() == candidate_profile.major.lower():
        score += 0.1
        
    # Industry
    if current_profile.job_industry and candidate_profile.job_industry and current_profile.job_industry.lower() == candidate_profile.job_industry.lower():
        score += 0.1
        
    # Graduation year proximity
    if current_profile.grad_year and candidate_profile.grad_year:
        diff = abs(current_profile.grad_year - candidate_profile.grad_year)
        import math
        # Gaussian decay: e^(-diff^2 / 8). Yields ~1.0 at 0, 0.88 at 1, 0.6 at 2, 0.32 at 3
        decay = math.exp(-(diff ** 2) / 8.0)
        score += (0.1 * decay)
            
    return score

def generate_explanation(current_profile: Profile, candidate_profile: Profile, semantic_score: float, rule_score: float) -> str:
    """Generates a deterministic explanation based on the highest overlapping factors."""
    explanations = []
    
    # Major check
    if current_profile.major and candidate_profile.major and current_profile.major.lower() == candidate_profile.major.lower():
        explanations.append(f"Both studied {current_profile.major}")
        
    # Skills check
    if current_profile.skills and candidate_profile.skills:
        cur_skills = set([s.lower() for s in current_profile.skills])
        cand_skills = set([s.lower() for s in candidate_profile.skills])
        overlap = cur_skills.intersection(cand_skills)
        if len(overlap) > 0:
            top_skill = list(overlap)[0].title()
            if len(overlap) > 1:
                explanations.append(f"Share multiple skills including {top_skill}")
            else:
                explanations.append(f"Both skilled in {top_skill}")
                
    # Industry check
    if not explanations and current_profile.job_industry and candidate_profile.job_industry and current_profile.job_industry.lower() == candidate_profile.job_industry.lower():
        explanations.append(f"Both work in {current_profile.job_industry}")
        
    # Fallback to semantic similarity
    if not explanations:
        if semantic_score > 0.7:
            explanations.append("Highly similar professional background")
        else:
            explanations.append("Similar career interests")
            
    return " and ".join(explanations)

def get_recommendations(db: Session, current_user: User, cursor: float, limit: int, role_filter: str = None) -> Tuple[List[RecommendationResponse], float]:
    """
    Fetches the top recommendations using hybrid search: PgVector + Rule-based scoring.
    """
    # 1. Candidate Filtering (SQL Level)
    # We must fetch the current user's embedding
    current_profile = db.query(Profile).filter(Profile.user_id == current_user.id).first()
    
    # If the user has no profile or embedding, we fallback to just rule-based or recent active
    if not current_profile or not current_profile.embedding:
        return [], None
        
    # 1. Candidate Filtering (SQL Level)
    # Using NOT EXISTS for connection filtering to avoid sequence scans on large arrays
    has_connection = db.query(Connection).filter(
        or_(
            and_(Connection.sender_id == current_user.id, Connection.receiver_id == User.id),
            and_(Connection.receiver_id == current_user.id, Connection.sender_id == User.id)
        ),
        Connection.status.in_([ConnectionStatus.PENDING, ConnectionStatus.ACCEPTED])
    ).exists()

    # 2. Vector Similarity Search for Bounded Pool
    distance_col = Profile.embedding.cosine_distance(current_profile.embedding).label('distance')
    query = db.query(User, Profile, distance_col).join(Profile).filter(
        User.is_active == True,
        User.college_id == current_user.college_id,
        User.id != current_user.id,
        ~has_connection,
        Profile.embedding.is_not(None)
    )

    if role_filter == "mentors":
        query = query.filter(User.role.in_([UserRole.ALUMNI, UserRole.ADMIN, UserRole.SUPER_ADMIN]))
    elif role_filter == "alumni":
        query = query.filter(User.role == UserRole.ALUMNI)

    # We'll fetch a bounded pool of 100 to do in-memory ranking
    pool_query = query.order_by(distance_col).limit(100)
    candidate_records = pool_query.all()

    # 3. Hybrid Ranking (In-Memory)
    scored_candidates = []
    
    SEMANTIC_WEIGHT = 0.5
    RULE_WEIGHT = 0.5

    for candidate_user, cand_profile, distance in candidate_records:
        # Distance is cosine distance. Similarity is 1 - distance
        semantic_score = 1.0 - float(distance) if distance is not None else 0.0
        rule_score = calculate_rule_based_score(current_profile, cand_profile)
        
        # 4. Final Match Score
        match_score = (semantic_score * SEMANTIC_WEIGHT) + (rule_score * RULE_WEIGHT)
        
        explanation = generate_explanation(current_profile, cand_profile, semantic_score, rule_score)
        
        scored_candidates.append((match_score, candidate_user, explanation))
        
    # Sort descending by match_score
    scored_candidates.sort(key=lambda x: x[0], reverse=True)
    
    # Apply cursor pagination
    if cursor is not None:
        scored_candidates = [x for x in scored_candidates if x[0] < cursor]
        
    page_items = scored_candidates[:limit]
    next_cursor = page_items[-1][0] if len(page_items) == limit and len(scored_candidates) > limit else None
    
    # Map to schemas
    response_items = []
    for score, user, expl in page_items:
        response_items.append(
            RecommendationResponse(
                id=user.profile.id,
                user_id=user.id,
                connection_status="none",
                full_name=user.profile.full_name,
                profile_picture=user.profile.profile_picture,
                bio=user.profile.bio,
                company=user.profile.company,
                job_title=user.profile.job_title,
                job_industry=user.profile.job_industry,
                job_description=user.profile.job_description,
                location=user.profile.location,
                skills=user.profile.skills,
                interests=user.profile.interests,
                grad_year=user.profile.grad_year,
                major=user.profile.major,
                username=user.username,
                match_score=round(score, 3),
                explanation=expl
            )
        )
        
    return response_items, next_cursor

def trigger_embedding_generation(user_id: int) -> None:
    """
    Background task to generate and update profile embedding.

    IMPORTANT: This function opens its own database session. It must only receive
    scalar arguments (user_id: int) — never a request-scoped Session, which will
    be closed before this task executes.
    """
    db = SessionLocal()
    try:
        profile = db.query(Profile).filter(Profile.user_id == user_id).first()
        if not profile:
            return

        semantic_text = generate_semantic_text(profile)
        new_hash = compute_semantic_hash(semantic_text)

        if profile.semantic_hash != new_hash:
            embedding = get_embedding(semantic_text)
            profile.semantic_hash = new_hash
            profile.embedding = embedding
            db.commit()

            event_bus.publish(NotificationType.RECOMMENDATIONS_AVAILABLE.value, {
                "recipient_id": user_id,
                "notification_type": NotificationType.RECOMMENDATIONS_AVAILABLE,
                "title": "New Recommendations",
                "message": "Your profile has been updated and new alumni recommendations are available.",
                "actor_id": None,
                "metadata_": {"recommendation_batch_id": new_hash}
            })
    finally:
        db.close()
