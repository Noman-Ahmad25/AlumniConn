import hashlib
from typing import List, Dict, Any

# Load the model lazily to avoid startup overhead if not used immediately
_model = None

def get_embedding_model():
    global _model

    if _model is None:
        from sentence_transformers import SentenceTransformer
        _model = SentenceTransformer("all-MiniLM-L6-v2")

    return _model

def generate_semantic_text(profile: Any) -> str:
    """
    Generates a single string representing the semantic profile of a user.
    """
    parts = []
    if profile.bio:
        parts.append(f"Bio: {profile.bio}")
    if profile.job_title:
        parts.append(f"Title: {profile.job_title}")
    if profile.job_industry:
        parts.append(f"Industry: {profile.job_industry}")
    if profile.job_description:
        parts.append(f"Experience: {profile.job_description}")
    if profile.skills:
        parts.append(f"Skills: {', '.join(profile.skills)}")
    if profile.interests:
        parts.append(f"Interests: {', '.join(profile.interests)}")
        
    return " ".join(parts)

def compute_semantic_hash(semantic_text: str) -> str:
    """
    Computes a fast hash of the semantic text to determine if embeddings need updating.
    """
    return hashlib.sha256(semantic_text.encode('utf-8')).hexdigest()

def get_embedding(text: str) -> List[float]:
    """
    Generates a vector embedding for the given text.
    """
    if not text.strip():
        return [0.0] * 384 # Fallback for empty profiles (MiniLM uses 384 dimensions)
        
    model = get_embedding_model()
    # Returns a numpy array, convert to list of floats for pgvector
    embedding = model.encode(text)
    return embedding.tolist()
