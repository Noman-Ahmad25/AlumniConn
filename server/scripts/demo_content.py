"""Rich synthetic datasets for the AlumniConn portfolio showcase.
Contains realistic multi-tenant data with deep human timelines, technical discussions,
career advice, referral opportunities, and threaded conversations.
"""

# =====================================================================
# 1. SECONDARY COLLEGES & WORKFLOWS
# =====================================================================

SECONDARY_COLLEGES = [
    {
        "name": "Apex Institute of Technology",
        "slug": "apex-institute",
        "domain": "apextech.edu",
        "location": "Whitefield, Bengaluru, Karnataka",
        "established_year": 2008,
        "description": "Autonomous engineering institute in Bengaluru's tech corridor specializing in Artificial Intelligence, Cloud Infrastructure, and Fintech Systems.",
        "is_approved": True,
        "is_active": True,
        "branding": {
            "primary_color": "#0d9488",
            "secondary_color": "#14b8a6",
            "accent_color": "#f59e0b",
            "background_color": "#f0fdfa",
            "welcome_message": "Welcome to Apex Institute of Technology Alumni Portal",
            "motto": "Engineering the Digital Frontier",
        },
        "admin": {
            "username": "admin_apex",
            "email": "dean.alumni@apextech.edu",
            "full_name": "Dr. Kavitha Raman",
            "job_title": "Dean of Industry Outreach & Alumni Affairs",
            "job_industry": "Higher Education",
            "location": "Bengaluru, Karnataka",
            "bio": "Overseeing 15,000+ alumni working across Bengaluru's leading technology firms.",
        },
        "users": [
            {
                "username": "siddharth_apex_fintech",
                "email": "siddharth.m@alumni.apextech.edu",
                "full_name": "Siddharth Menon",
                "role": "alumni",
                "grad_year": 2019,
                "major": "Computer Science and Engineering",
                "company": "OmniPay Network",
                "job_title": "Senior Payment Systems Architect",
                "job_industry": "Financial Technology",
                "job_description": "Designing high-availability payment gateway settlement engines handling millions of transactions daily.",
                "location": "Bengaluru, Karnataka",
                "skills": ["Go", "Kafka", "PostgreSQL", "Distributed Systems", "Kubernetes"],
                "interests": ["Fintech Architecture", "System Resiliency", "High Throughput"],
                "bio": "Building payment infrastructure at OmniPay Network. Passionate about fault-tolerant transaction pipelines.",
            },
            {
                "username": "meera_apex_data",
                "email": "meera.krishnan@alumni.apextech.edu",
                "full_name": "Meera Krishnan",
                "role": "alumni",
                "grad_year": 2021,
                "major": "Information Science",
                "company": "HyperLogix Delivery",
                "job_title": "Data Platform Engineer",
                "job_industry": "E-Commerce & Logistics",
                "job_description": "Building real-time stream processing infrastructure for ETA predictions using Apache Flink.",
                "location": "Bengaluru, Karnataka",
                "skills": ["Apache Flink", "Spark", "Python", "Kafka", "Data Engineering"],
                "interests": ["Stream Processing", "Distributed Storage", "Lakehouses"],
                "bio": "Data platform engineer at HyperLogix Delivery. Apex Institute 2021 batch.",
            },
            {
                "username": "arjun_apex_student",
                "email": "arjun.nair@student.apextech.edu",
                "full_name": "Arjun Nair",
                "role": "student",
                "grad_year": 2026,
                "major": "Artificial Intelligence & Machine Learning",
                "location": "Bengaluru, Karnataka",
                "skills": ["Python", "PyTorch", "FastAPI", "React", "Vector DBs"],
                "interests": ["RAG Pipelines", "Autonomous Agents", "Open Source"],
                "bio": "Pre-final year AIML undergraduate at Apex Institute. Building LLM-powered developer tools.",
            },
            {
                "username": "tanvi_apex_student",
                "email": "tanvi.sharma@student.apextech.edu",
                "full_name": "Tanvi Sharma",
                "role": "student",
                "grad_year": 2025,
                "major": "Computer Science and Engineering",
                "location": "Bengaluru, Karnataka",
                "skills": ["JavaScript", "TypeScript", "Node.js", "Docker", "Next.js"],
                "interests": ["Full Stack Engineering", "Cloud Native", "Hackathons"],
                "bio": "Final year CSE undergraduate at Apex. Incoming summer software intern.",
            },
        ],
        "posts": [
            {
                "author_username": "siddharth_apex_fintech",
                "content": "🚀 We're expanding the Core Payments platform team at OmniPay Network! Looking for engineers with strong fundamentals in Go, distributed data stores, and event-driven architectures. If you're an Apex alumnus or final year student with hands-on systems experience, DM me for direct referral! #Hiring #Fintech #ApexAlumni",
                "is_opportunity": True,
                "days_ago": 6,
                "comments": [
                    {
                        "author_username": "arjun_apex_student",
                        "content": "Hi Siddharth sir! I recently built an idempotent payment webhook processor in Go for our capstone. Would love to send over my resume!",
                        "hours_after": 2,
                    },
                    {
                        "author_username": "siddharth_apex_fintech",
                        "content": "Sounds great Arjun. Shoot me a message with your GitHub repo link and resume.",
                        "hours_after": 5,
                    },
                ],
            },
            {
                "author_username": "meera_apex_data",
                "content": "Deep dive on Apache Flink checkpointing mechanisms: How we eliminated checkpoint timeouts during high order bursts at HyperLogix by tuning buffer debloating and unaligned checkpoints. Happy to share my presentation slides with anyone interested in stream processing!",
                "is_opportunity": False,
                "days_ago": 12,
                "comments": [],
            },
        ],
    },
    {
        "name": "Crestview University of Engineering",
        "slug": "crestview-university",
        "domain": "crestview.edu",
        "location": "Kothrud, Pune, Maharashtra",
        "established_year": 1995,
        "description": "Premier technical university in western India recognized for automotive, robotics, IoT, and embedded systems engineering.",
        "is_approved": True,
        "is_active": True,
        "branding": {
            "primary_color": "#7c3aed",
            "secondary_color": "#8b5cf6",
            "accent_color": "#ec4899",
            "background_color": "#faf5ff",
            "welcome_message": "Welcome to Crestview University Alumni Network",
            "motto": "Innovation Through Precision Engineering",
        },
        "admin": {
            "username": "admin_crestview",
            "email": "dean.alumni@crestview.edu",
            "full_name": "Prof. Amitabh Joshi",
            "job_title": "Dean of Alumni Relations & Corporate Connect",
            "job_industry": "Higher Education",
            "location": "Pune, Maharashtra",
            "bio": "Leading alumni engagement and industrial partnerships at Crestview University.",
        },
        "users": [
            {
                "username": "pooja_crestview_embedded",
                "email": "pooja.deshmukh@alumni.crestview.edu",
                "full_name": "Pooja Deshmukh",
                "role": "alumni",
                "grad_year": 2018,
                "major": "Electronics & Telecommunication",
                "company": "Apex Mobility Labs",
                "job_title": "Principal Battery Management Systems Engineer",
                "job_industry": "Automotive Engineering",
                "job_description": "Architecting CAN-bus firmware and state-of-charge estimator algorithms for electric vehicle platforms.",
                "location": "Pune, Maharashtra",
                "skills": ["Embedded C", "AUTOSAR", "CAN Protocol", "MATLAB", "RTOS"],
                "interests": ["Electric Vehicles", "Embedded Systems", "Hardware Security"],
                "bio": "Building next-generation EV powertrains at Apex Mobility Labs. Crestview E&TC alumna.",
            },
            {
                "username": "rohit_crestview_student",
                "email": "rohit.kulkarni@student.crestview.edu",
                "full_name": "Rohit Kulkarni",
                "role": "student",
                "grad_year": 2026,
                "major": "Robotics & Automation",
                "location": "Pune, Maharashtra",
                "skills": ["ROS2", "Python", "C++", "Gazebo", "SLAM"],
                "interests": ["Autonomous Mobile Robots", "Computer Vision", "Industrial Automation"],
                "bio": "Robotics undergrad at Crestview. Capstone lead for autonomous warehouse AGV.",
            },
        ],
        "posts": [
            {
                "author_username": "pooja_crestview_embedded",
                "content": "Excited to share that our team at Apex Mobility Labs completed hardware-in-the-loop (HIL) validation for the new fast-charging firmware! For juniors interested in automotive software: do not neglect RTOS fundamentals, memory protection units, and MISRA C standards. They are the backbone of safety-critical engineering.",
                "is_opportunity": False,
                "days_ago": 8,
                "comments": [
                    {
                        "author_username": "rohit_crestview_student",
                        "content": "Thank you for the guidance ma'am! Are there specific simulation tools you recommend for learning AUTOSAR before graduating?",
                        "hours_after": 4,
                    }
                ],
            }
        ],
    },
    {
        "name": "Solaris Technical Institute",
        "slug": "solaris-tech",
        "domain": "solaris.edu",
        "location": "HITEC City, Hyderabad, Telangana",
        "established_year": 2012,
        "description": "Private polytechnic engineering institute.",
        "is_approved": True,
        "is_active": False,  # Deactivated college to showcase Super Admin inactive filtering and toggle
        "branding": {
            "primary_color": "#475569",
            "secondary_color": "#64748b",
            "accent_color": "#94a3b8",
            "background_color": "#f8fafc",
            "welcome_message": "Solaris Technical Institute (Archived)",
            "motto": "Knowledge and Industry",
        },
        "admin": {
            "username": "admin_solaris",
            "email": "admin@solaris.edu",
            "full_name": "Dr. Venkat Reddy",
            "job_title": "Campus Administrator",
            "job_industry": "Higher Education",
            "location": "Hyderabad, Telangana",
            "bio": "Administrator at Solaris Technical Institute.",
        },
        "users": [
            {
                "username": "solaris_alumni_1",
                "email": "alumni1@solaris.edu",
                "full_name": "Suresh Babu",
                "role": "alumni",
                "grad_year": 2017,
                "major": "Computer Engineering",
                "company": "Enterprise Global Tech",
                "job_title": "Software Consultant",
                "job_industry": "Information Technology",
                "location": "Hyderabad, Telangana",
                "skills": ["Java", "Oracle SQL", "Spring Boot"],
                "interests": ["Enterprise Apps", "Database Tuning"],
                "bio": "Alumnus of Solaris Technical Institute.",
            }
        ],
        "posts": [],
    },
]

# =====================================================================
# 2. COLLEGE REQUESTS (LIFECYCLE AUDIT & SUPER ADMIN MANAGEMENT)
# =====================================================================

COLLEGE_REQUESTS_DATA = [
    {
        "name": "Meridian State University",
        "domain": "meridianstate.edu",
        "location": "Austin, Texas, USA",
        "established_year": 1978,
        "description": "Comprehensive public research university serving 32,000 students across engineering, biomedical sciences, and public policy.",
        "admin_name": "Dr. Aris Thorne",
        "admin_email": "alumni.dean@meridianstate.edu",
        "status": "PENDING",
        "email_verified": True,
    },
    {
        "name": "Vanguard Online Tutorial Academy",
        "domain": "vanguardtutorial.fake",
        "location": "Unverified Location",
        "established_year": 2024,
        "description": "Unregistered commercial tutorial business attempting to register as an accredited university.",
        "admin_name": "Commercial Marketing Rep",
        "admin_email": "sales@vanguardtutorial.fake",
        "status": "REJECTED",
        "email_verified": True,
        "rejection_reason": "Institutional accreditation and university domain ownership could not be validated by platform compliance.",
    },
    {
        "name": "Veritas Institute of Technology",
        "domain": "veritas.edu",
        "location": "Coimbatore, Tamil Nadu",
        "established_year": 1984,
        "description": "Premier technical institution with 40,000+ alumni community globally and multidisciplinary research centres.",
        "admin_name": "Dr. K. S. Parthasarathy",
        "admin_email": "alumni.dean@veritas.edu",
        "status": "PENDING",
        "email_verified": True,
    },
    {
        "name": "Millennium Institute of Technology",
        "domain": "millennium.edu",
        "location": "Mysuru, Karnataka",
        "established_year": 1957,
        "description": "Historic constituent engineering institute known for industry partnerships and alumni entrepreneurship.",
        "admin_name": "Prof. Sudheer Shenoy",
        "admin_email": "alumni.relations@millennium.edu",
        "status": "PENDING",
        "email_verified": True,
    },
]

# =====================================================================
# 3. ADDITIONAL NITK STUDENTS (BALANCING THE COMMUNITY)
# =====================================================================

ADDITIONAL_NITK_STUDENTS = [
    {
        "username": "aditi_verma",
        "email": "aditi.verma@student.northbridge.edu",
        "full_name": "Aditi Verma",
        "major": "Mechanical Engineering",
        "grad_year": 2025,
        "skills": ["CAD/CAM", "MATLAB", "Finite Element Analysis", "Python", "Ansys"],
        "interests": ["Automotive Engineering", "Aerodynamics", "Electric Vehicles"],
        "alumni_status": "PENDING",
        "bio": "Final year Mechanical Engineering student at Northbridge. Lead for Northbridge Racing Team chassis design. Preparing for automotive R&D roles.",
    },
    {
        "username": "karan_patel",
        "email": "karan.patel@student.northbridge.edu",
        "full_name": "Karan Patel",
        "major": "Information Technology",
        "grad_year": 2026,
        "skills": ["TypeScript", "React", "Node.js", "GraphQL", "TailwindCSS", "PostgreSQL"],
        "interests": ["Web Performance", "Full Stack Development", "UI Architecture", "Hackathons"],
        "alumni_status": "NOT_REQUESTED",
        "bio": "Pre-final year IT student at Northbridge. Web enthusiast, open-source contributor, and web dev lead for annual cultural festival.",
    },
    {
        "username": "priya_nair",
        "email": "priya.nair@student.northbridge.edu",
        "full_name": "Priya Nair",
        "major": "Electrical and Electronics Engineering",
        "grad_year": 2025,
        "skills": ["VLSI Design", "Verilog", "Embedded C", "FPGA", "Cadence Virtuoso"],
        "interests": ["Semiconductor Design", "Digital Systems", "IoT", "Higher Studies"],
        "alumni_status": "NOT_REQUESTED",
        "bio": "Senior EEE undergraduate at Northbridge. Exploring analog and digital chip design. Aiming for MS in VLSI.",
    },
    {
        "username": "varun_singh",
        "email": "varun.singh@student.northbridge.edu",
        "full_name": "Varun Singh",
        "major": "Chemical Engineering",
        "grad_year": 2027,
        "skills": ["Process Simulation", "Aspen Plus", "Python", "Fluid Mechanics", "Data Analysis"],
        "interests": ["Green Hydrogen", "Carbon Capture", "Clean Energy", "Renewable Tech"],
        "alumni_status": "NOT_REQUESTED",
        "bio": "Second year Chemical Engineering student at Northbridge. Passionate about sustainable process engineering and clean tech innovation.",
    },
    {
        "username": "tanya_desai",
        "email": "tanya.desai@student.northbridge.edu",
        "full_name": "Tanya Desai",
        "major": "Computer Science and Engineering",
        "grad_year": 2026,
        "skills": ["Python", "PyTorch", "HuggingFace", "C++", "FastAPI"],
        "interests": ["Computer Vision", "Multimodal AI", "Machine Learning Research"],
        "alumni_status": "NOT_REQUESTED",
        "bio": "B.Tech CSE junior at Northbridge. Undergraduate researcher working on multimodal image segmentation models.",
    },
    {
        "username": "harsh_gupta",
        "email": "harsh.gupta@student.northbridge.edu",
        "full_name": "Harsh Gupta",
        "major": "Civil Engineering",
        "grad_year": 2025,
        "skills": ["AutoCAD", "Revit", "STAAD Pro", "GIS Mapping", "Project Management"],
        "interests": ["Smart City Infrastructure", "Earthquake Engineering", "Sustainable Materials"],
        "alumni_status": "NOT_REQUESTED",
        "bio": "Final year Civil Engineering undergraduate at Northbridge. Passionate about resilient structural design and urban transit systems.",
    },
    {
        "username": "divya_menon",
        "email": "divya.menon@student.northbridge.edu",
        "full_name": "Divya Menon",
        "major": "Information Technology",
        "grad_year": 2026,
        "skills": ["Go", "Kubernetes", "Linux", "Terraform", "Prometheus", "Docker"],
        "interests": ["Site Reliability Engineering", "DevOps", "Cloud Security", "Distributed Tracing"],
        "alumni_status": "NOT_REQUESTED",
        "bio": "Junior IT student fascinated by reliable infrastructure and platform engineering. Active member of Northbridge Linux Users Group.",
    },
    {
        "username": "rishabh_shukla",
        "email": "rishabh.shukla@student.northbridge.edu",
        "full_name": "Rishabh Shukla",
        "major": "Mining Engineering",
        "grad_year": 2025,
        "skills": ["Geotechnical Modeling", "Python", "GIS", "Mine Safety", "Drone Surveying"],
        "interests": ["Automation in Mining", "Mineral Economics", "Environmental Remediation"],
        "alumni_status": "PENDING",
        "bio": "Final year Mining Engineering student at Northbridge. Researching autonomous haulage systems and spatial GIS analysis.",
    },
]

# =====================================================================
# 4. RICH NITK POSTS (NATURAL TIMELINE, DEPTH, CONVERSATIONS)
# =====================================================================

NITK_POSTS_DATA = [
    # --- P0: High Priority Persona Anchor Posts ---
    {
        "author": "demo_alumni",
        "is_opportunity": True,
        "days_ago": 3,
        "category": "Referral & Mentorship",
        "content": """🚀 Excited to share that CloudScale Technologies is actively hiring for Cloud and AI Engineering roles across our Bengaluru, Hyderabad, and Pune offices!

We are looking for both fresh campus graduates (2025/2026 batches) for Software Engineer - 1 roles, as well as experienced alumni (2-6 years) for Cloud Solutions and GenAI platform teams.

Key tech stack requirements:
• Core Systems: C++, Go, Python, or Java with rock-solid algorithmic and distributed systems fundamentals
• Cloud Infrastructure: Azure / AWS, Kubernetes, Microservices architecture, gRPC
• AI & Data: PyTorch, Azure OpenAI Service, LangChain / Semantic Kernel, Vector Search architectures

If you are a student preparing for campus recruitment or an alumnus looking for a career transition, feel free to send me a direct connection request here on AlumniConn. Please include your target role, updated resume link, and a brief summary of your top 2 technical projects.

Happy to provide referrals, review resumes, and run mock technical interviews for my fellow Northbridge students and alumni! Let's elevate each other. 🎓 #Hiring #CampusReferral #CloudScaleTech #NorthbridgeAlumni #CloudEngineering""",
    },
    {
        "author": "demo_student",
        "is_opportunity": False,
        "days_ago": 5,
        "category": "Project Showcase",
        "content": """Thrilled to announce that our final year capstone project is officially open-sourced! 🎉

We built 'ChronoCache': a high-throughput, horizontally partitioned distributed in-memory cache written in Go, implementing the Raft consensus algorithm for metadata coordination and consistent hashing with virtual nodes for dynamic node balancing.

Key performance milestones we achieved in our benchmarks:
• 185,000 operations/second sub-millisecond p99 latency across a 5-node cluster
• Zero-data-loss failover during node termination under active write traffic
• Integrated pluggable cache eviction policies (LRU, TinyLFU, and FIFO) with memory limits enforced via cgroups

A huge shoutout to our alumni mentors Rahul Sharma and Ananya Sen for their invaluable architectural feedback during our initial design reviews last month—especially around avoiding hot partition skew and optimizing Go GC pauses.

The GitHub repository and technical design documentation are linked in my profile. Would love feedback, code reviews, and suggestions from systems engineers in our alumni community! #DistributedSystems #Golang #OpenSource #NorthbridgeTech #FinalYearProject""",
    },
    {
        "author": "admin_nitk",
        "is_opportunity": False,
        "days_ago": 7,
        "category": "Institutional Announcement",
        "content": """📢 Official Announcement: Northbridge Global Alumni Conclave 2026

Dear Students, Faculty, and Alumni,

We are delighted to announce that the Annual Northbridge Global Alumni Conclave will be hosted on campus from December 18-20, 2026. This year's central theme is 'Decarbonization, AI Sovereignty, and Next-Generation Infrastructure: The Role of Premier Technical Institutes.'

Highlights of the 3-day Conclave:
1. Keynote addresses by distinguished alumni heading global technology enterprises and public sector leaders
2. The Student-Alumni Innovation Expo showcasing over 40 final-year capstone prototypes and campus startups
3. Dedicated Mentorship Roundtables across 8 specialized domains (Fintech, Semiconductors, AI/ML, Clean Energy, Aerospace, Public Administration, Higher Studies, and Venture Capital)
4. Golden and Silver Jubilee batch reunions celebrating the batches of 1976 and 2001

We encourage all alumni travelling to Northbridge to confirm their attendance early through our university portal. Let us celebrate our heritage and inspire the next generation of engineers!

With warm regards,
Prof. R. K. Bhattacharya
Dean of Alumni Relations & Outreach, Northbridge Institute of Technology""",
    },
    # --- P1: Deep Systems & Engineering Discussions ---
    {
        "author": "rahul_sharma_backend",
        "is_opportunity": False,
        "days_ago": 9,
        "category": "System Architecture",
        "content": """Reflections on scaling Postgres connection pools beyond 20,000 concurrent clients:

At HyperLogix, during major dinner and festival peak windows, backend services experience massive burst traffic that can easily exhaust database connection limits. Here is how we restructured our connection topology to maintain under 5ms query execution times:

1. Dedicated PgBouncer instances running in transaction-pooling mode alongside our service pods. Session pooling was quickly saturating max_connections and causing thread-contention on the primary Postgres server.
2. Read-traffic offloading: All analytical, order tracking history, and restaurant catalog reads were strictly isolated to streaming read-replicas with hot-standby feedback enabled to prevent query cancellation from replication conflicts.
3. Query budget timeouts: Hard statement_timeout (250ms for OLTP paths) configured both at the proxy layer and Postgres user roles, preventing long-running table locks from snowballing into cascading gateway timeouts.
4. Client-side circuit breakers using adaptive concurrency limits rather than static queue depths. When replica lag spikes above 5 seconds, services gracefully degrade to cached Redis snapshots.

Curious to hear how other teams in the alumni network handle connection lifecycle management and replica lag during 10x traffic spikes!""",
    },
    {
        "author": "vikram_rao_cloud",
        "is_opportunity": False,
        "days_ago": 11,
        "category": "Cloud Computing",
        "content": """The biggest shift in cloud infrastructure over the past three years hasn't just been Kubernetes or Serverless—it's the transition from generic compute instances to domain-specific acceleration and hardware offloading (like AWS Nitro and custom DPUs).

When we offload networking packet routing, EBS encryption, and security isolation from the main CPU onto dedicated hardware cards:
• Virtually 100% of host CPU cores and memory are available for customer workloads.
• Jitter in network packet delivery drops by over 80%, which is monumental for distributed storage replication where tail latency dominates.
• Zero-downtime live migration of large instances during host maintenance becomes seamless without application degradation.

For undergraduates wondering what systems knowledge is most timeless: master operating systems fundamentals, memory hierarchies (L1/L2 caches vs NUMA nodes), and network socket internals. Cloud abstractions come and go, but the physics of computer architecture remains immutable.""",
    },
    {
        "author": "preeti_sundar_devops",
        "is_opportunity": True,
        "days_ago": 13,
        "category": "Career & Hiring",
        "content": """Hiring Alert: Platform & SRE Engineers at FlashDrop Logistics (Bengaluru)! ⚡

Our Core Platform team is looking for talented Site Reliability and DevOps Engineers who love tackling chaotic distributed systems challenges at breakneck delivery speeds.

What you'll work on:
• Multi-region Kubernetes cluster lifecycle automation with ArgoCD and Crossplane
• Observability pipelines processing 10+ TBs of logs and telemetry daily using Vector, ClickHouse, and Grafana
• Service mesh traffic shaping, blue-green deployment strategies, and chaos engineering experiments with Litmus

If you are an alumnus with 1-4 years of experience or a 2025 graduate who has built non-trivial infrastructure projects, ping me with your resume. Northbridge folks will get fast-tracked interviews! #FlashDropLogistics #DevOps #SRE #Hiring #CloudNative""",
    },
    {
        "author": "ruchi_jain_fe",
        "is_opportunity": False,
        "days_ago": 15,
        "category": "Web Architecture",
        "content": """Why micro-frontends might be the wrong choice for 95% of web teams:

Over the past year at BharatMart, we evaluated transitioning several consumer web checkout modules into independent Webpack Module Federation micro-frontends. While the theoretical promise of independent deployability sounds enticing to engineering leaders, the hidden engineering tax is immense:

1. Runtime bundle duplication: Even with shared module configurations, users often end up downloading multiple versions of React, styling runtimes, or shared utility libraries.
2. Inconsistent state synchronization: Passing shared authentication tokens, cart states, and modal overlays across isolated micro-apps introduces brittle custom event buses.
3. Nightmare testing workflows: End-to-end integration tests require complex multi-repository staging environments that slow down PR velocity.

Instead, a well-structured modular Monorepo with strict lint boundaries (like Nx or Turborepo) and shared TypeScript design systems provides 90% of the team autonomy benefits without punishing the user's mobile data connection with 4MB of bloated JavaScript. Choose architectural complexity only when organizational team boundaries strictly demand it!""",
    },
    # --- P2: Career Transitions, Mentorship & Student Guidance ---
    {
        "author": "aarav_mehta_ai",
        "is_opportunity": False,
        "days_ago": 17,
        "category": "AI Research & Industry",
        "content": """Moving from training toy ML models in Jupyter Notebooks to serving production LLM endpoints: What I learned the hard way.

When students ask me how to prepare for Machine Learning Engineer roles in 2026, my advice has shifted dramatically. Building an accurate PyTorch model is only 20% of the battle. The remaining 80% is production systems engineering:

• Dynamic batching and KV-cache memory management (using vLLM, TensorRT-LLM, or TGI) to prevent GPU out-of-memory crashes under concurrent user requests.
• Continuous model evaluation: Setting up automated pipelines to detect hallucination drift, semantic similarity degradation, and prompt injection attacks before deploying updates.
• Cost-performance tradeoffs: Knowing when a fine-tuned 8B parameter SLM (like Llama-3 or Mistral) running on consumer GPUs outperforms an expensive frontier API call.

To the juniors preparing capstones: focus on deployment, latency profiling, and latency SLAs alongside your validation loss curves. That is what distinguishes top candidates during technical screens.""",
    },
    {
        "author": "aditi_verma",
        "is_opportunity": False,
        "days_ago": 18,
        "category": "Campus Experience",
        "content": """Northbridge Racing Team is ready for the national Formula Student competition next month in Coimbatore! 🏎️💨

Our team spent the last 8 months designing, simulating, and fabricating our new electric formula racecar:
• Custom tubular spaceframe chassis with 22% improved torsional rigidity over last year's model
• Lightweight carbon-fiber aerodynamic package delivering 45kg of downforce at 60 km/h
• 72V lithium iron phosphate battery pack with custom temperature telemetry monitoring

Huge thanks to alumni in the automotive industry who gave us design critique sessions over video calls on weekends. Seeing the vehicle pass technical inspection today on the campus testing strip made every sleepless night in the workshop completely worth it!""",
    },
    {
        "author": "karan_patel",
        "is_opportunity": False,
        "days_ago": 20,
        "category": "Web Development",
        "content": """Question for senior frontend engineers in the network:

When building data-intensive analytics dashboards with hundreds of real-time mutating rows (like live market tickers or inventory trackers), what is your preferred approach for preventing unnecessary DOM re-renders in React 19?

We've been testing TanStack Virtual alongside Zustand slice selectors, but occasionally see frame drops when concurrent updates arrive via WebSockets. Would love to know if people have shifted toward signals (like Preact Signals) or prefer decoupling rendering into HTML5 Canvas / WebGL for ultra-dense visualizations. Appreciate any insights!""",
    },
    {
        "author": "rohit_verma_fintech",
        "is_opportunity": False,
        "days_ago": 22,
        "category": "Fintech & Systems",
        "content": """Designing idempotent APIs for banking and payments: A practical checklist.

In distributed financial systems, network timeouts are ambiguous—a client request might have failed before reaching the server, or the server processed the transaction and the acknowledgement was lost on the wire.

Here is the exact pattern we enforce across all ledger APIs:
1. Client generates a deterministic UUIDv4 Idempotency-Key per unique user intent.
2. In the API gateway or middleware, acquire an atomic distributed lock in Redis for that key with a 120-second TTL.
3. If the key exists in our PostgreSQL transaction log: return the exact cached HTTP response payload immediately with an 'X-Cache-Lookup: HIT' header.
4. If it is a new transaction: execute business logic inside a strict READ COMMITTED or SERIALIZABLE database transaction, write both the ledger entry and the idempotency record atomically, then release the Redis lock.
5. In case of unexpected server crashes: handle inflight lock expirations gracefully without creating duplicate debit debits.

Simple, rock-solid, and prevents multi-million dollar reconciliation headaches!""",
    },
    {
        "author": "meera_nair_security",
        "is_opportunity": False,
        "days_ago": 24,
        "category": "Cybersecurity",
        "content": """Security PSA for student developers publishing hackathon repositories on GitHub:

Over the past month, automated scanning bots have indexed dozens of public repositories containing hardcoded AWS access keys, Gemini API keys, and database connection strings.

Remember:
• Never commit `.env` files to git. Always add `.env`, `.env.local`, and credential files to your global `.gitignore`.
• Use tools like `git-secrets`, `trufflehog`, or pre-commit hooks to automatically prevent secrets from entering your git commit history.
• If you accidentally commit a secret, DO NOT just delete it in a new commit! The secret remains visible in your git commit history forever. Rotate the credential in your cloud console immediately and rewrite git history using `git filter-repo`.

Stay safe and build securely from day one! 🛡️""",
    },
    {
        "author": "deepak_varma_data",
        "is_opportunity": True,
        "days_ago": 26,
        "category": "Data Science & Referral",
        "content": """We are hiring Applied Machine Learning Engineers at Cortex Analytics (Bengaluru & Gurugram)!

Seeking engineers with 2+ years of experience working on tabular modeling, time-series forecasting, and causal inference. If you have solid Python skills, experience with scikit-learn, XGBoost, MLflow, and strong mathematical foundations in statistics and linear algebra, drop me a message.

Always excited to refer qualified Northbridge graduates! Feel free to connect and send over your resume. #DataScience #MachineLearning #CortexAnalytics #Referral""",
    },
    {
        "author": "nishant_goel_bain",
        "is_opportunity": False,
        "days_ago": 28,
        "category": "Product Management",
        "content": """Five lessons transitioning from Software Engineer to Product Manager at an early-stage startup:

1. Code elegance does not matter if you are building the wrong feature. The best engineering architecture in the world cannot save a product that users do not want.
2. User interviews > Internal assumptions. Spend at least 5 hours every week talking directly to real users instead of debating hypothetical edge cases in conference rooms.
3. Learn to love metrics: Conversion funnels, customer acquisition costs, churn retention cohorts, and Net Promoter Scores must become second nature.
4. Clear writing is your superpower. A concise, unambiguous 1-page PRD (Product Requirement Document) saves hundreds of engineering hours.
5. Say 'no' to 9 out of 10 good ideas so your team has the bandwidth to execute the 1 truly game-changing feature exceptionally well.

Happy to chat with any students or alumni considering a transition into tech product management!""",
    },
    {
        "author": "arun_mishra_java",
        "is_opportunity": False,
        "days_ago": 30,
        "category": "Semiconductors",
        "content": """A proud moment for India's semiconductor ecosystem:

With multiple commercial semiconductor fabrication and ATMP facilities breaking ground in Gujarat and Assam, the demand for trained VLSI, physical design, and verification engineers is set to skyrocket over the next 5 years.

To our E&C and EEE students at Northbridge:
• Master SystemVerilog and UVM (Universal Verification Methodology)—verification roles outnumber front-end RTL design roles 3 to 1 in the industry.
• Get comfortable with Linux command lines, Perl/Python scripting, and TCL scripts for EDA synthesis automation.
• Take courses in computer architecture, static timing analysis (STA), and low-power design methodologies (UPF).

Our alumni working across leading semiconductor and microelectronics firms are organizing an online VLSI mentorship weekend next month. Stay tuned for details!""",
    },
    {
        "author": "priya_nair",
        "is_opportunity": False,
        "days_ago": 32,
        "category": "Student Journey",
        "content": """Completed our 6-week summer research internship at Indian Institute of Science (IISc), Bengaluru on Neuromorphic Computing architectures! 🧠⚡

We investigated spiking neural network (SNN) hardware implementations on Xilinx UltraScale+ FPGAs, comparing energy consumption against standard GPU inference for real-time edge keyword spotting.

Special thanks to our Northbridge professors and alumni in academia for writing recommendation letters and guiding our literature review. There is nothing more thrilling than seeing simulated theoretical equations come alive on real silicon!""",
    },
    {
        "author": "varun_singh",
        "is_opportunity": False,
        "days_ago": 35,
        "category": "Sustainability & Clean Tech",
        "content": """Fascinating seminar today at the Northbridge Chemical Engineering department on 'Electrochemical Carbon Capture and Utilization in Industrial Smelters'.

It is inspiring to see how traditional chemical engineering mass transfer and thermodynamics principles are intersecting with renewable solar/wind power to produce green methanol and ethylene from captured flue gases.

Are there alumni working in climate-tech or industrial green hydrogen who would be open to delivering a guest lecture for the student chemical engineering association? Please reach out!""",
    },
    {
        "author": "shalini_hrbp",
        "is_opportunity": False,
        "days_ago": 38,
        "category": "Recruiting & Campus Hiring",
        "content": """Recruiter perspective: What actually makes a fresh graduate resume stand out in a stack of 1,000+ applicants?

As someone who has led university recruiting drives at tier-1 tech firms for over 9 years, here is what top hiring managers look for:

1. Impact-oriented bullet points: Don't just list 'Built a weather app'. Write 'Engineered a weather forecast app utilizing OpenWeather API, Redis caching, and Web Workers, reducing latency by 45% for 1,200 active users.'
2. Active GitHub / Technical Footprint: High quality code, clean documentation, meaningful commit messages, and live deployed demo links beat 20 bullet points of generic buzzwords every single time.
3. Consistency over quantity: 2 well-architected, deeply understood projects will get you hired faster than 8 superficial clones copied from YouTube tutorials.
4. Communication and humility: Interviewers are hiring a teammate they will work with 40 hours a week. Be curious, admit when you don't know an answer, and walk through your problem-solving thought process transparently.

Wishing all the 2026 batch candidates all the best for the upcoming placement season! 🌟""",
    },
    {
        "author": "demo_student",
        "is_opportunity": False,
        "days_ago": 41,
        "category": "Campus Life",
        "content": """Nothing beats evening walks along the coastal shoreline after a marathon week of mid-term examinations. 🌅

From watching the iconic lighthouse blink in the evening sky to having hot filter coffee and buns with hostel mates at midnight—four years at Northbridge truly fly by faster than you can ever imagine.

Cherish every single day of college life, everyone! The friendships and late-night whiteboard debugging sessions are memories you will carry forever. #NorthbridgeDiaries #NorthbridgeMemories #CampusVibes #CoastalCampus""",
    },
]

# =====================================================================
# 5. MEANINGFUL COMMENTS (AUTHENTIC BACK-AND-FORTH DISCUSSIONS)
# =====================================================================

NITK_COMMENTS_MAP = {
    # Comments for Post 0 (demo_alumni's CloudScale hiring post)
    0: [
        {
            "author": "demo_student",
            "hours_after": 2,
            "content": "Hi Ananya ma'am! Thank you so much for sharing this. I have been focusing on distributed systems and Go/Python for our final year project, and just sent you a connection request. Would love your feedback on my resume for the Cloud Engineering SE-1 role!",
        },
        {
            "author": "demo_alumni",
            "hours_after": 4,
            "content": "Saw your connection request and accepted, Rohan! Your ChronoCache project looks very impressive. Let's connect over direct messages and I'll review your CV tonight.",
        },
        {
            "author": "aditi_verma",
            "hours_after": 6,
            "content": "Are there roles for mechanical/mechatronics graduates in CloudScale's hardware and cloud datacenter infrastructure teams as well?",
        },
        {
            "author": "demo_alumni",
            "hours_after": 8,
            "content": "Yes Aditi! CloudScale Infrastructure has dedicated Cloud Hardware and Datacenter Engineering teams in Hyderabad and Taiwan working on thermal cooling, server rack mechanical design, and power delivery. Send over your resume as well!",
        },
        {
            "author": "rahul_sharma_backend",
            "hours_after": 10,
            "content": "Great initiative Ananya. CloudScale's cloud infrastructure teams in Bengaluru are world-class. Can vouch for the engineering culture!",
        },
    ],
    # Comments for Post 1 (demo_student's ChronoCache project)
    1: [
        {
            "author": "rahul_sharma_backend",
            "hours_after": 1,
            "content": "Phenomenal work Rohan and team! Hitting 185k ops/sec with sub-millisecond p99 on Go is no small feat. How did you handle GC pause latency during high write allocations? Did you use an off-heap memory arena or a sync.Pool strategy?",
        },
        {
            "author": "demo_student",
            "hours_after": 3,
            "content": "Thank you Rahul sir! We heavily utilized `sync.Pool` for byte buffer recycling to avoid dynamic heap allocations on the hot path, and structured our cache keys as fixed-size byte arrays. That single change cut GC pause times from 18ms down to under 1.2ms!",
        },
        {
            "author": "vikram_rao_cloud",
            "hours_after": 5,
            "content": "Excellent architectural maturity. If you haven't already, try running Jepsen partition tests against your Raft implementation to verify split-brain safety under network partitions. Would love to feature this in our campus tech spotlight!",
        },
        {
            "author": "demo_alumni",
            "hours_after": 7,
            "content": "So proud to see this! This is exactly the kind of production-grade project that makes engineering recruiters sit up and take notice.",
        },
    ],
    # Comments for Post 2 (admin_nitk's Global Alumni Conclave post)
    2: [
        {
            "author": "demo_alumni",
            "hours_after": 3,
            "content": "Looking forward to attending in person, Professor! I will be participating in the AI & Cloud Mentorship Roundtable on Day 2.",
        },
        {
            "author": "rahul_sharma_backend",
            "hours_after": 5,
            "content": "Count me in! Already booking my flights to Northbridge. Looking forward to reconnecting with batchmates and meeting the current students.",
        },
        {
            "author": "admin_nitk",
            "hours_after": 7,
            "content": "Delighted to have you both back on campus, Ananya and Rahul. The students will benefit immensely from your industry experiences.",
        },
    ],
    # Comments for Post 3 (rahul_sharma_backend Postgres connection scaling)
    3: [
        {
            "author": "vikram_rao_cloud",
            "hours_after": 2,
            "content": "Spot on regarding transaction pooling mode. One additional technique we use at AWS: aggressive client-side connection warming and jittered backoffs so that if PgBouncer restarts, thousands of pods don't initiate a 'thundering herd' TCP storm against the database.",
        },
        {
            "author": "rahul_sharma_backend",
            "hours_after": 4,
            "content": "100% Vikram. We learned that the hard way during a New Year's Eve traffic spike two years ago! Exponential jittered backoff is mandatory.",
        },
        {
            "author": "demo_student",
            "hours_after": 6,
            "content": "Bookmarked this! We faced connection exhaustion in our initial staging tests and were confused why Postgres CPU spiked with idle connections. This explains it clearly.",
        },
    ],
    # Comments for Post 4 (vikram_rao_cloud Cloud hardware acceleration)
    4: [
        {
            "author": "ruchi_jain_fe",
            "hours_after": 3,
            "content": "Even on the frontend and edge routing layer, DPU hardware offloading has made edge SSL handshake termination practically instantaneous for our users.",
        },
        {
            "author": "arun_mishra_java",
            "hours_after": 6,
            "content": "Hardware and software codesign is truly the holy grail of modern computing. Great synthesis of the underlying systems physics, Vikram.",
        },
    ],
    # Comments for Post 5 (preeti_sundar_devops hiring at FlashDrop)
    5: [
        {
            "author": "divya_menon",
            "hours_after": 2,
            "content": "Hi Sneha ma'am! I have been building multi-cluster GitOps setups with ArgoCD and Crossplane for our college labs. Sent you a connection request and my resume!",
        },
        {
            "author": "preeti_sundar_devops",
            "hours_after": 4,
            "content": "Awesome Divya, I see your request! Will review your GitHub repos and ping our recruiting coordinator.",
        },
    ],
    # Comments for Post 6 (ruchi_jain_fe micro-frontend critique)
    6: [
        {
            "author": "karan_patel",
            "hours_after": 2,
            "content": "This is such a refreshing and honest take. We were debating micro-frontends for our college festival portal but realized a simple Turborepo monorepo with strict package boundaries solved all our collaboration issues with zero runtime overhead.",
        },
        {
            "author": "ruchi_jain_fe",
            "hours_after": 5,
            "content": "You made the right call, Karan! Keep it simple until you genuinely have hundreds of engineers working across completely disparate codebases.",
        },
    ],
}

# =====================================================================
# 6. THREADED CONVERSATIONS & MESSAGES (REALISTIC CHAT LOGS)
# =====================================================================

NITK_CONVERSATIONS_DATA = [
    # Conversation 1: demo_student <-> demo_alumni (Deep Mentorship & Referral)
    {
        "user1": "demo_student",
        "user2": "demo_alumni",
        "days_ago": 3,
        "messages": [
            {
                "sender": "demo_student",
                "offset_minutes": 0,
                "content": "Hi Ananya ma'am! Thank you so much for accepting my connection request. I saw your post regarding the Cloud and AI engineering openings at CloudScale Technologies.",
            },
            {
                "sender": "demo_alumni",
                "offset_minutes": 15,
                "content": "Hey Rohan! Happy to connect. I took a brief look at your profile and saw your ChronoCache distributed systems project—very impressive technical depth for an undergraduate.",
            },
            {
                "sender": "demo_student",
                "offset_minutes": 22,
                "content": "Thank you! We put a lot of work into the Raft consensus engine and memory management. Here is my resume link: https://alumniconn.demo/resumes/rohan_mehta.pdf. I'm primarily targeting the Software Engineer - 1 Cloud Platform role.",
            },
            {
                "sender": "demo_alumni",
                "offset_minutes": 38,
                "content": "Your resume looks very clean. Good structure and quantifiable impact. For the CloudScale technical loop, make sure you are thoroughly prepared for:\n1. Concurrency and goroutine synchronization / thread-safety\n2. Distributed systems tradeoffs (CAP theorem, leader election, log replication)\n3. LeetCode medium/hard tree and graph traversal problems",
            },
            {
                "sender": "demo_student",
                "offset_minutes": 45,
                "content": "That is super helpful guidance! I will do a targeted revision of concurrency primitives and Raft edge cases. Should I apply through the careers portal first or do you submit a direct employee referral?",
            },
            {
                "sender": "demo_alumni",
                "offset_minutes": 55,
                "content": "Do NOT apply directly through the portal yet. I will submit an internal employee referral using your email today. Once you receive the automated confirmation email, complete the requisition questionnaire and ping me back.",
            },
            {
                "sender": "demo_student",
                "offset_minutes": 60,
                "content": "Understood! Thank you so much for taking the time to guide me. Means the world to us students.",
            },
            {
                "sender": "demo_alumni",
                "offset_minutes": 68,
                "content": "Always glad to give back to Northbridge! Best of luck with your preparation, and feel free to reach out if you want to run a quick 30-minute mock interview before your round.",
            },
        ],
    },
    # Conversation 2: demo_student <-> rahul_sharma_backend (Architecture Review)
    {
        "user1": "demo_student",
        "user2": "rahul_sharma_backend",
        "days_ago": 4,
        "messages": [
            {
                "sender": "demo_student",
                "offset_minutes": 0,
                "content": "Hi Rahul sir! Thanks for your comments on our project post. Quick question: when implementing consistent hashing with virtual nodes, what ratio of virtual to physical nodes gave you the most uniform distribution in production?",
            },
            {
                "sender": "rahul_sharma_backend",
                "offset_minutes": 25,
                "content": "Hey Rohan! Typically between 150 to 256 virtual nodes per physical node gives you a standard deviation of less than 3-5% in key distribution. Going higher than 256 usually yields diminishing returns and inflates binary search lookup times on the hash ring.",
            },
            {
                "sender": "demo_student",
                "offset_minutes": 32,
                "content": "That makes total sense. We were currently using 64, which still left slight skew under 100k keys. We'll increase to 180 and benchmark the difference. Really appreciate the tip!",
            },
            {
                "sender": "rahul_sharma_backend",
                "offset_minutes": 45,
                "content": "Anytime! Let me know how the numbers look once you run the updated benchmark suite.",
            },
        ],
    },
    # Conversation 3: demo_alumni <-> admin_nitk (Conclave Planning)
    {
        "user1": "demo_alumni",
        "user2": "admin_nitk",
        "days_ago": 6,
        "messages": [
            {
                "sender": "demo_alumni",
                "offset_minutes": 0,
                "content": "Respected Professor Bhattacharya, greetings! I saw the announcement regarding the Global Alumni Conclave 2026. I would love to conduct a hands-on workshop on 'Building Production Generative AI Applications on Cloud Infrastructure' for the CSE and IT students.",
            },
            {
                "sender": "admin_nitk",
                "offset_minutes": 40,
                "content": "Dear Ananya, wonderful to hear from you. That workshop topic is exceptionally timely and aligns directly with our conclave theme. We would be honored to include your 2-hour session in the main auditorium schedule on Day 2.",
            },
            {
                "sender": "demo_alumni",
                "offset_minutes": 50,
                "content": "Wonderful! I will prepare hands-on code labs with cloud sandbox credits for up to 100 attending students. I will email the detailed session syllabus to your office by next week.",
            },
            {
                "sender": "admin_nitk",
                "offset_minutes": 65,
                "content": "Thank you for your generous dedication to your alma mater, Ananya. My office will coordinate the logistics and lab facilities.",
            },
        ],
    },
    # Conversation 4: demo_alumni <-> vikram_rao_cloud (Industry Tech Catchup)
    {
        "user1": "demo_alumni",
        "user2": "vikram_rao_cloud",
        "days_ago": 10,
        "messages": [
            {
                "sender": "demo_alumni",
                "offset_minutes": 0,
                "content": "Hey Vikram! Loved your post on Nitro hardware offloading. Are you attending re:Invent or KubeCon this year?",
            },
            {
                "sender": "vikram_rao_cloud",
                "offset_minutes": 30,
                "content": "Hey Ananya! Yes, I will be speaking at KubeCon India in Hyderabad next month on low-latency storage topologies. Are you coming down for it?",
            },
            {
                "sender": "demo_alumni",
                "offset_minutes": 42,
                "content": "Yes! Our CloudScale team has a booth there as well. Let's definitely catch up over lunch and reminisce about our Northbridge days.",
            },
            {
                "sender": "vikram_rao_cloud",
                "offset_minutes": 55,
                "content": "Sounds like a plan! Let's sync up closer to the conference dates.",
            },
        ],
    },

    # Conversation 5: demo_student <-> karan_patel (Frontend Benchmark Dashboard)
    {
        "user1": "demo_student",
        "user2": "karan_patel",
        "days_ago": 4,
        "messages": [
            {
                "sender": "demo_student",
                "offset_minutes": 0,
                "content": "Hey Karan! We are building a live monitoring web dashboard for ChronoCache benchmark metrics. Would you be interested in helping design the React/Tailwind frontend?",
            },
            {
                "sender": "karan_patel",
                "offset_minutes": 15,
                "content": "Hey Rohan! Absolutely. Are you exposing metrics via Prometheus or raw WebSocket streams?",
            },
            {
                "sender": "demo_student",
                "offset_minutes": 25,
                "content": "We have a WebSocket endpoint streaming cache ops/sec, p99 latency, and partition memory usage every 500ms.",
            },
            {
                "sender": "karan_patel",
                "offset_minutes": 35,
                "content": "Awesome. I can build a real-time charting dashboard using Tremor and lightweight SVG charts. Let's hack on it this weekend in the library!",
            },
        ],
    },
    # Conversation 6: demo_student <-> preeti_sundar_devops (Docker & Container Footprint)
    {
        "user1": "demo_student",
        "user2": "preeti_sundar_devops",
        "days_ago": 5,
        "messages": [
            {
                "sender": "demo_student",
                "offset_minutes": 0,
                "content": "Hi Sneha ma'am! Quick question regarding containerizing Go binaries: Our initial Docker image was around 450MB with the build toolchain. How do you structure production Dockerfiles at FlashDrop?",
            },
            {
                "sender": "preeti_sundar_devops",
                "offset_minutes": 20,
                "content": "Hey Rohan! Never ship the Go compiler in your runtime image. Use a multi-stage Dockerfile: build your statically linked binary () in a golang:alpine builder stage, then copy ONLY the compiled binary into a  or  base image.",
            },
            {
                "sender": "demo_student",
                "offset_minutes": 30,
                "content": "Just tried the multi-stage build with distroless—our image shrunk from 450MB down to 18MB! Deployments are lightning fast now.",
            },
            {
                "sender": "preeti_sundar_devops",
                "offset_minutes": 42,
                "content": "Huge win! Plus, having zero shell or extra package managers in distroless practically eliminates container vulnerability CVEs during security scans.",
            },
            {
                "sender": "demo_student",
                "offset_minutes": 50,
                "content": "That's amazing. Thank you so much for the expert tip!",
            },
        ],
    },
    # Conversation 7: aditi_verma <-> demo_alumni (Datacenter Hardware Guidance)
    {
        "user1": "aditi_verma",
        "user2": "demo_alumni",
        "days_ago": 2,
        "messages": [
            {
                "sender": "aditi_verma",
                "offset_minutes": 0,
                "content": "Hi Ananya ma'am! Thank you for mentioning CloudScale's Cloud Hardware teams. As a Mechanical student specializing in thermal simulation and CAD, how should I tailor my profile for datacenter engineering?",
            },
            {
                "sender": "demo_alumni",
                "offset_minutes": 35,
                "content": "Hi Aditi! Cloud datacenter teams look closely at: 1. Liquid cooling and immersion cooling CFD simulations for high-density GPU racks. 2. Structural vibrational analysis for server trays during seismic events. 3. Scripting ability in Python for automated telemetry collection.",
            },
            {
                "sender": "aditi_verma",
                "offset_minutes": 45,
                "content": "That aligns perfectly with my Formula Student battery thermal simulation project! I will highlight our thermal dissipation equations and Python scripts.",
            },
            {
                "sender": "demo_alumni",
                "offset_minutes": 58,
                "content": "Excellent. Once your updated CV is ready, send it over and I will connect you with our Datacenter Engineering recruiting manager in Hyderabad.",
            },
            {
                "sender": "aditi_verma",
                "offset_minutes": 65,
                "content": "Thank you so much! Will have it ready by tomorrow morning.",
            },
        ],
    },
    # Conversation 8: priya_nair <-> arun_mishra_java (VLSI Semiconductor Career)
    {
        "user1": "priya_nair",
        "user2": "arun_mishra_java",
        "days_ago": 7,
        "messages": [
            {
                "sender": "priya_nair",
                "offset_minutes": 0,
                "content": "Respected Harish sir, I read your post about the semiconductor boom in India. I'm a final year EEE student interested in digital design verification.",
            },
            {
                "sender": "arun_mishra_java",
                "offset_minutes": 25,
                "content": "Hello Priya! Digital verification is a fantastic domain. Are you familiar with SystemVerilog assertions and UVM testbenches?",
            },
            {
                "sender": "priya_nair",
                "offset_minutes": 35,
                "content": "Yes sir! We implemented a UVM verification environment for an AXI4-Lite bus controller in our college VLSI lab using open-source tools.",
            },
            {
                "sender": "arun_mishra_java",
                "offset_minutes": 50,
                "content": "That is exceptional for an undergraduate. Most freshers struggle with UVM phases and sequence drivers. Send your resume to my email—I'd be glad to refer you to SiliconScale Semiconductor.",
            },
            {
                "sender": "priya_nair",
                "offset_minutes": 58,
                "content": "Thank you so much sir! Sending it right away.",
            },
            {
                "sender": "arun_mishra_java",
                "offset_minutes": 70,
                "content": "Received. Will submit the referral and follow up with HR.",
            },
        ],
    },
    # Conversation 9: divya_menon <-> preeti_sundar_devops (GitOps Workflows)
    {
        "user1": "divya_menon",
        "user2": "preeti_sundar_devops",
        "days_ago": 6,
        "messages": [
            {
                "sender": "divya_menon",
                "offset_minutes": 0,
                "content": "Hi Sneha ma'am! I sent across my resume for the FlashDrop DevOps intern role. Really excited about the GitOps stack you mentioned.",
            },
            {
                "sender": "preeti_sundar_devops",
                "offset_minutes": 30,
                "content": "Hey Divya! Reviewed your GitHub repo for the college lab Kubernetes cluster. Clean Helm charts and well-structured repository layout!",
            },
            {
                "sender": "divya_menon",
                "offset_minutes": 40,
                "content": "Thank you! We tried to make everything self-healing with ArgoCD sync hooks.",
            },
            {
                "sender": "preeti_sundar_devops",
                "offset_minutes": 55,
                "content": "Our engineering manager was impressed. You should receive a screening call invitation from our recruiter by tomorrow!",
            },
        ],
    },
    # Conversation 10: tanya_desai <-> aarav_mehta_ai (Model Quantization Research)
    {
        "user1": "tanya_desai",
        "user2": "aarav_mehta_ai",
        "days_ago": 8,
        "messages": [
            {
                "sender": "tanya_desai",
                "offset_minutes": 0,
                "content": "Hi Arun sir! Saw your post regarding serving SLMs on edge GPUs. I am researching AWQ 4-bit quantization for vision-language models for my B.Tech capstone.",
            },
            {
                "sender": "aarav_mehta_ai",
                "offset_minutes": 40,
                "content": "Hi Tanya! AWQ is brilliant because it protects salient weight channels from precision loss. Are you using Hugging Face AutoAWQ or TensorRT-LLM?",
            },
            {
                "sender": "tanya_desai",
                "offset_minutes": 52,
                "content": "We've been using AutoAWQ on an RTX 4090 workstation in the department lab, targeting under 12GB VRAM allocation.",
            },
            {
                "sender": "aarav_mehta_ai",
                "offset_minutes": 70,
                "content": "Solid approach. Keep a close eye on perplexity degradation on the MMLU benchmark. Happy to review your pre-print before you submit to IEEE.",
            },
            {
                "sender": "tanya_desai",
                "offset_minutes": 80,
                "content": "That would be incredible! Thank you so much for the mentorship.",
            },
        ],
    },
    # Conversation 11: varun_singh <-> admin_nitk (Clean Tech Guest Lecture)
    {
        "user1": "varun_singh",
        "user2": "admin_nitk",
        "days_ago": 11,
        "messages": [
            {
                "sender": "varun_singh",
                "offset_minutes": 0,
                "content": "Respected Professor Bhattacharya, the Student Chemical Engineering Association is organizing a symposium on Industrial Green Hydrogen. Could the alumni office connect us with alumni in clean tech?",
            },
            {
                "sender": "admin_nitk",
                "offset_minutes": 45,
                "content": "Dear Varun, excellent initiative. We have alumni leading green hydrogen projects at Larsen & Toubro and Reliance Clean Energy. I will introduce you via email.",
            },
            {
                "sender": "varun_singh",
                "offset_minutes": 55,
                "content": "Thank you Professor! We will draft the formal invitation letter today.",
            },
            {
                "sender": "admin_nitk",
                "offset_minutes": 75,
                "content": "Keep up the enthusiastic work. My office is always ready to support student technical initiatives.",
            },
        ],
    },
    # Conversation 12: karan_patel <-> ruchi_jain_fe (React Virtualization)
    {
        "user1": "karan_patel",
        "user2": "ruchi_jain_fe",
        "days_ago": 9,
        "messages": [
            {
                "sender": "karan_patel",
                "offset_minutes": 0,
                "content": "Hi Priya ma'am! Regarding your post on frontend architecture: when virtualizing large tables, did you run into issues with variable row heights causing scroll jumping?",
            },
            {
                "sender": "ruchi_jain_fe",
                "offset_minutes": 30,
                "content": "Hey Karan! Yes, dynamic row heights are the classic virtual list pain point. In TanStack Virtual, you must supply an accurate  and ensure dynamic row measurements cache their DOM offsets.",
            },
            {
                "sender": "karan_patel",
                "offset_minutes": 45,
                "content": "We implemented a ResizeObserver hook to cache calculated row heights and it completely eliminated the scroll jitter!",
            },
            {
                "sender": "ruchi_jain_fe",
                "offset_minutes": 60,
                "content": "Well done! That's production-grade frontend engineering right there.",
            },
        ],
    },
    # Conversation 13: demo_alumni <-> nishant_goel_bain (AI Product Strategy)
    {
        "user1": "demo_alumni",
        "user2": "nishant_goel_bain",
        "days_ago": 12,
        "messages": [
            {
                "sender": "demo_alumni",
                "offset_minutes": 0,
                "content": "Hey Swati! Loved your five lessons on PM transition. How do you handle non-deterministic LLM output SLAs in your product specifications?",
            },
            {
                "sender": "nishant_goel_bain",
                "offset_minutes": 35,
                "content": "Hey Ananya! Great question. We define structured JSON schemas with constrained decoding, plus strict fallback UX states when confidence drops below 0.85.",
            },
            {
                "sender": "demo_alumni",
                "offset_minutes": 50,
                "content": "Constrained decoding via JSON schema grammar is definitely the cleanest pattern. Let's catch up over coffee at the conclave!",
            },
            {
                "sender": "nishant_goel_bain",
                "offset_minutes": 65,
                "content": "Looking forward to it! See you at Northbridge.",
            },
        ],
    },
    # Conversation 14: rahul_sharma_backend <-> vikram_rao_cloud (Tiered Storage)
    {
        "user1": "rahul_sharma_backend",
        "user2": "vikram_rao_cloud",
        "days_ago": 14,
        "messages": [
            {
                "sender": "rahul_sharma_backend",
                "offset_minutes": 0,
                "content": "Hey Vikram, are you seeing customers adopt tiered storage for Kafka where historic log segments get offloaded to S3?",
            },
            {
                "sender": "vikram_rao_cloud",
                "offset_minutes": 28,
                "content": "Yes, absolutely! Tiered storage cuts EBS provisioned storage costs by up to 60% because brokers only need local NVMe drives for the active write head (last 4 hours of logs).",
            },
            {
                "sender": "rahul_sharma_backend",
                "offset_minutes": 40,
                "content": "That's huge for our order audit topic retention. We're planning a POC next quarter.",
            },
            {
                "sender": "vikram_rao_cloud",
                "offset_minutes": 55,
                "content": "Let me know if you run into any replication lag issues on the tiered fetch path, happy to share our sizing calculators.",
            },
        ],
    },
    # Conversation 15: deepak_varma_data <-> aarav_mehta_ai (vLLM Serving)
    {
        "user1": "deepak_varma_data",
        "user2": "aarav_mehta_ai",
        "days_ago": 15,
        "messages": [
            {
                "sender": "deepak_varma_data",
                "offset_minutes": 0,
                "content": "Arun, quick question: In vLLM, how much GPU memory do you reserve for KV cache when serving 70B parameter models under tensor parallelism 4?",
            },
            {
                "sender": "aarav_mehta_ai",
                "offset_minutes": 25,
                "content": "We set  and reserve ~30% of total VRAM strictly for PagedAttention KV blocks. With chunked prefill enabled, it prevents out-of-memory spikes during concurrent multi-turn chats.",
            },
            {
                "sender": "deepak_varma_data",
                "offset_minutes": 40,
                "content": "Chunked prefill was the missing link for us! Throughput increased by 2.2x. Thanks a lot!",
            },
            {
                "sender": "aarav_mehta_ai",
                "offset_minutes": 50,
                "content": "Glad it helped! PagedAttention was truly a game changer for serving throughput.",
            },
        ],
    },
    # Conversation 16: harsh_gupta <-> admin_nitk (Civil Department Innovation Lab)
    {
        "user1": "harsh_gupta",
        "user2": "admin_nitk",
        "days_ago": 16,
        "messages": [
            {
                "sender": "harsh_gupta",
                "offset_minutes": 0,
                "content": "Respected Professor, the Civil Engineering student chapter has prepared a proposal for setting up a Smart Infrastructure & GIS modeling lab.",
            },
            {
                "sender": "admin_nitk",
                "offset_minutes": 30,
                "content": "Dear Harsh, send the equipment list and budget estimate to the alumni office. We have several civil alumni from the 1990 batch who expressed interest in sponsoring lab modernizations.",
            },
            {
                "sender": "harsh_gupta",
                "offset_minutes": 45,
                "content": "Thank you Professor! We will submit the complete dossier by Friday.",
            },
            {
                "sender": "admin_nitk",
                "offset_minutes": 60,
                "content": "Very well. Let us ensure the current batch has access to the best contemporary software.",
            },
        ],
    },
    # Conversation 17: rishabh_shukla <-> admin_nitk (Mining Automation Conclave)
    {
        "user1": "rishabh_shukla",
        "user2": "admin_nitk",
        "days_ago": 18,
        "messages": [
            {
                "sender": "rishabh_shukla",
                "offset_minutes": 0,
                "content": "Professor Bhattacharya, will there be a dedicated session on sustainable mining and autonomous haulage at the upcoming Conclave?",
            },
            {
                "sender": "admin_nitk",
                "offset_minutes": 35,
                "content": "Yes Rishabh, we have confirmed speakers from Rio Tinto and Coal India who are alumni of our Mining department speaking on Day 2 morning.",
            },
            {
                "sender": "rishabh_shukla",
                "offset_minutes": 45,
                "content": "That is fantastic news. All final year mining students are eager to attend.",
            },
            {
                "sender": "admin_nitk",
                "offset_minutes": 60,
                "content": "Excellent. Please coordinate the student seating and question registration with the department secretary.",
            },
        ],
    },
    # Conversation 18: aditi_verma <-> demo_student (Telemetry Integration)
    {
        "user1": "aditi_verma",
        "user2": "demo_student",
        "days_ago": 19,
        "messages": [
            {
                "sender": "aditi_verma",
                "offset_minutes": 0,
                "content": "Hey Rohan! For the formula student racecar telemetry, could we use ChronoCache to buffer CAN-bus sensor metrics before writing to disk?",
            },
            {
                "sender": "demo_student",
                "offset_minutes": 20,
                "content": "Hey Aditi! Absolutely. ChronoCache handles 180k ops/sec easily, and CAN-bus writes are typically only a few thousand samples/sec. We can set up a local in-memory instance on the onboard Raspberry Pi.",
            },
            {
                "sender": "aditi_verma",
                "offset_minutes": 35,
                "content": "That would solve our telemetry write-stall issues completely! Let's integrate it this Thursday in the workshop.",
            },
            {
                "sender": "demo_student",
                "offset_minutes": 45,
                "content": "Sounds great! I'll bring the Go binaries and test scripts.",
            },
        ],
    },
    # Conversation 19: shalini_hrbp <-> admin_nitk (Placement Drive Coordination)
    {
        "user1": "shalini_hrbp",
        "user2": "admin_nitk",
        "days_ago": 22,
        "messages": [
            {
                "sender": "shalini_hrbp",
                "offset_minutes": 0,
                "content": "Greetings Professor Bhattacharya! Our recruitment committee has finalized the calendar for the Phase-1 campus placement drives.",
            },
            {
                "sender": "admin_nitk",
                "offset_minutes": 30,
                "content": "Dear Kavita, thank you for your ongoing partnership. The students have been preparing rigorously with mock interviews conducted by alumni.",
            },
            {
                "sender": "shalini_hrbp",
                "offset_minutes": 45,
                "content": "We noticed the high technical caliber, especially in distributed systems and cloud projects this year. Looking forward to Day 1 interviews!",
            },
            {
                "sender": "admin_nitk",
                "offset_minutes": 60,
                "content": "Thank you Kavita. Our placement cell will ensure seamless interview room and networking facilities.",
            },
        ],
    },
    # Conversation 20: demo_alumni <-> preeti_sundar_devops (Observability Patterns)
    {
        "user1": "demo_alumni",
        "user2": "preeti_sundar_devops",
        "days_ago": 25,
        "messages": [
            {
                "sender": "demo_alumni",
                "offset_minutes": 0,
                "content": "Hey Sneha! How are you managing OpenTelemetry trace sampling rates during multi-tenant spikes at FlashDrop?",
            },
            {
                "sender": "preeti_sundar_devops",
                "offset_minutes": 25,
                "content": "Hey Ananya! We use tail-based sampling in the OpenTelemetry Collector: we sample 100% of error traces (HTTP 5xx / exceptions) and high-latency paths (>500ms), and sample only 1% of successful fast requests.",
            },
            {
                "sender": "demo_alumni",
                "offset_minutes": 40,
                "content": "Tail-based sampling in the collector is brilliant. Keeps storage costs predictable without missing critical production anomalies.",
            },
            {
                "sender": "preeti_sundar_devops",
                "offset_minutes": 55,
                "content": "Exactly. Saved us tens of thousands on cloud log ingestion bills!",
            },
        ],
    },
]
