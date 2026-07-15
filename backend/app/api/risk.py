from fastapi import APIRouter
from app.schemas import TransactionRequest, RiskResponse
from app.ml.predictors import predict_risk, engine
from sqlalchemy import text
import pandas as pd

router = APIRouter()

# Ensure the is_reviewed column exists for backward compatibility with older SQLite databases
try:
    with engine.begin() as conn:
        conn.execute(text("ALTER TABLE predictions ADD COLUMN is_reviewed INTEGER DEFAULT 0"))
except Exception:
    pass # Column already exists or table does not exist yet

@router.post("/score", response_model=RiskResponse)
async def risk_score(request: TransactionRequest):
    # Convert incoming payload to dictionary
    data = request.dict(exclude_unset=True)
    
    # Generate prediction from ML pipeline
    result = predict_risk(data)
    
    return RiskResponse(**result)

@router.get("/history")
async def get_history():
    try:
        # Fetch up to 5000 predictions from the database
        df = pd.read_sql("SELECT * FROM predictions ORDER BY created_at DESC LIMIT 5000", engine)
        return df.to_dict(orient="records")
    except Exception as e:
        print(f"Error fetching history: {e}")
        return []

@router.delete("/history/all")
async def delete_all_history():
    try:
        with engine.begin() as conn:
            conn.execute(text("DELETE FROM predictions"))
        return {"message": "All database history deleted"}
    except Exception as e:
        print(f"Error deleting history: {e}")
        return {"error": str(e)}

@router.delete("/history/customer/{customer_name}")
async def delete_customer_history(customer_name: str):
    try:
        with engine.begin() as conn:
            conn.execute(text("DELETE FROM predictions WHERE customer_name = :c"), {"c": customer_name})
        return {"message": f"History for {customer_name} deleted"}
    except Exception as e:
        print(f"Error deleting customer history: {e}")
        return {"error": str(e)}

@router.delete("/history/transaction/{created_at}")
async def delete_transaction(created_at: str):
    try:
        with engine.begin() as conn:
            conn.execute(text("DELETE FROM predictions WHERE created_at = :ca"), {"ca": created_at})
        return {"message": "Transaction deleted"}
    except Exception as e:
        print(f"Error deleting transaction: {e}")
        return {"error": str(e)}

@router.put("/history/review/{created_at}")
async def review_transaction(created_at: str):
    try:
        with engine.begin() as conn:
            conn.execute(text("UPDATE predictions SET is_reviewed = 1 WHERE created_at = :ca"), {"ca": created_at})
        return {"message": "Transaction marked as reviewed"}
    except Exception as e:
        print(f"Error reviewing transaction: {e}")
        # Return 500 so the frontend knows it failed
        from fastapi import HTTPException
        raise HTTPException(status_code=500, detail=str(e))
