from fastapi import APIRouter
from app.schemas import TransactionRequest, RiskResponse
from app.ml.predictors import predict_risk

router = APIRouter()

@router.post("/score", response_model=RiskResponse)
async def risk_score(request: TransactionRequest):
    # Convert incoming payload to dictionary
    data = request.dict(exclude_unset=True)
    
    # Generate prediction from ML pipeline
    result = predict_risk(data)
    
    return RiskResponse(**result)
