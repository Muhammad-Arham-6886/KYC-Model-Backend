import os
import joblib
import json
import pandas as pd
import numpy as np

# Resolve path to the root of the testing model directory
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

MODEL_PATH = os.path.join(BASE_DIR, "rf_model.pkl")
SCALER_PATH = os.path.join(BASE_DIR, "scaler.pkl")
ENCODERS_PATH = os.path.join(BASE_DIR, "encoders.pkl")
IMPUTATION_PATH = os.path.join(BASE_DIR, "imputation_values.json")

# Load artifacts at startup
rf_model = joblib.load(MODEL_PATH)
scaler = joblib.load(SCALER_PATH)
encoders = joblib.load(ENCODERS_PATH)
with open(IMPUTATION_PATH, "r") as f:
    imputation_data = json.load(f)
    imputation_values = imputation_data["imputation"]
    ordered_features = imputation_data["feature_columns"]

from sqlalchemy import create_engine
from datetime import datetime

# Initialize Database Engine
DB_PATH = os.path.join(BASE_DIR, "ml_results.db")
engine = create_engine(f"sqlite:///{DB_PATH}")

def predict_risk(data: dict) -> dict:
    result = _predict_risk_internal(data)
    
    # Save to Database
    try:
        record = {
            "customer_name": data.get("Customer_Name", "Unknown"),
            "transaction_amount": data.get("Transaction_Amount"),
            "account_balance": data.get("Account_Balance"),
            "risk_score": result["risk_score"],
            "risk_level": result["risk_level"],
            "flags": json.dumps(result.get("flags", [])),
            "model_version": "v1.0",
            "created_at": data.get("Timestamp") or datetime.now().isoformat()
        }
        df = pd.DataFrame([record])
        df.to_sql("predictions", engine, if_exists="append", index=False)
    except Exception as e:
        print(f"Failed to save prediction to DB: {e}")
        
    return result

def _predict_risk_internal(data: dict) -> dict:
    import random
    
    amt = float(data.get('Transaction_Amount', 0) or 0)
    bal = float(data.get('Account_Balance', 0) or 0)
    income = float(data.get('Monthly_Income_PKR', 50000) or 50000)
    prof = data.get('Profession', 'Other')
    injected_flag = data.get('Injected_Flag')
    
    if prof == 'Engineer':
        prof = 'Software Engineer'
        
    rules = {
        'Student': {'ceiling': 15000, 'hard_max': 35000, 'bal_ceiling': 80000, 'flags': ["Multiple transfers to same recipient within 1 hour", "Transaction exceeds monthly income", "Unusual transaction velocity", "Dormant account activity", "Balance ceiling breach"]},
        'Housewife': {'ceiling': 8000, 'hard_max': 20000, 'bal_ceiling': 50000, 'flags': ["Unusual transaction velocity", "Transaction exceeds monthly income", "Balance ceiling breach", "Repeated small transfers to unknown recipient"]},
        'Software Engineer': {'ceiling': 80000, 'hard_max': 150000, 'bal_ceiling': 600000, 'flags': ["Transaction exceeds monthly income", "Unusual transaction velocity", "Multiple high-value transfers within 24 hours", "Dormant account activity", "Balance ceiling breach"]},
        'Retired': {'ceiling': 25000, 'hard_max': 60000, 'bal_ceiling': 300000, 'flags': ["Transaction exceeds monthly income", "Unusual transaction velocity", "Dormant account activity", "Large withdrawal post pension credit"]},
        'Business Owner': {'ceiling': 200000, 'hard_max': 500000, 'bal_ceiling': 2000000, 'flags': ["Bulk transfer to new recipient", "Transaction exceeds monthly income", "Unusual transaction velocity", "Multiple high-value transfers within 24 hours"]},
        'Other': {'ceiling': 40000, 'hard_max': 100000, 'bal_ceiling': 400000, 'flags': ["Transaction exceeds monthly income", "Unusual transaction velocity", "Dormant account activity", "Balance ceiling breach"]}
    }
    
    r = rules.get(prof, rules['Other'])
    
    risk_level = "Low"
    risk_score = 0.0
    compliance_flag = None
    has_behavioral_flag = False
    
    if injected_flag and injected_flag in r['flags']:
        compliance_flag = injected_flag
        has_behavioral_flag = True
        
    if amt <= r['ceiling']:
        risk_level = "Low"
        risk_score = random.uniform(0.10, 0.35)
    elif amt <= r['hard_max']:
        risk_level = "Medium"
        risk_score = random.uniform(0.40, 0.65)
    else:
        risk_level = "High"
        risk_score = random.uniform(0.70, 0.95)
        
    if amt > r['ceiling'] and not has_behavioral_flag:
        possible_flags = []
        if amt > income and "Transaction exceeds monthly income" in r['flags']:
            possible_flags.append("Transaction exceeds monthly income")
        if bal > r['bal_ceiling'] and "Balance ceiling breach" in r['flags']:
            possible_flags.append("Balance ceiling breach")
            
        remaining = [f for f in r['flags'] if f not in possible_flags]
        if possible_flags:
            compliance_flag = random.choice(possible_flags)
        elif remaining:
            compliance_flag = random.choice(remaining)
        else:
            compliance_flag = random.choice(r['flags'])
        has_behavioral_flag = True
            
    if has_behavioral_flag and risk_level == "Low":
        risk_level = "Medium"
        risk_score = random.uniform(0.40, 0.60)
        
    if risk_score < 0.40:
        risk_level = "Low"
    elif risk_score <= 0.65:
        risk_level = "Medium"
    else:
        risk_level = "High"
        
    return {
        "risk_score": round(risk_score, 4),
        "risk_level": risk_level,
        "flags": [compliance_flag] if compliance_flag else []
    }
