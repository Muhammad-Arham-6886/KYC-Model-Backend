from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import risk

app = FastAPI(
    title="KYC Risk Assessment API",
    description="API for evaluating transaction fraud risk using a Random Forest Model.",
    version="1.0.0"
)

# Configure CORS for frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Allows all origins for development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount the risk API router under /api/risk prefix
app.include_router(risk.router, prefix="/api/risk", tags=["Risk Assessment"])

@app.get("/")
def root():
    return {"message": "KYC Risk Assessment API is running. Send POST requests to /api/risk/score."}
