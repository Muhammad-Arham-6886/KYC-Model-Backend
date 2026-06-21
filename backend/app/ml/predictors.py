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
    # Hard Business Rules & State Bank Compliance Rules
    amt = data.get('Transaction_Amount')
    bal = data.get('Account_Balance')
    
    # 1. Impossible Transaction
    if amt is not None and bal is not None and float(amt) > float(bal):
        return {
            "risk_score": 0.99,
            "risk_level": "Blocked (Insufficient Funds)",
            "flags": ["Block transaction before ML"]
        }
        
    # 2. Property Document Missing
    if data.get('Property_Doc_Missing'):
        return {
            "risk_score": 0.98,
            "risk_level": "High (Account Hold)",
            "flags": ["Property excuse repeated, documents missing"]
        }
        
    # 3. Layering Loop Detected
    if data.get('Is_Layering_Loop'):
        return {
            "risk_score": 0.95,
            "risk_level": "High (STR Review)",
            "flags": ["Money layering loop detected"]
        }
        
    # 4. Hub Portfolio
    if data.get('Is_Hub_Portfolio'):
        return {
            "risk_score": 0.95,
            "risk_level": "High (High-Risk Alert)",
            "flags": ["Personal account used as payment gateway"]
        }
        
    # 5. Foreign KYC Mismatch
    if data.get('Foreign_KYC_Mismatch'):
        return {
            "risk_score": 0.90,
            "risk_level": "High (EDD/STR Review)",
            "flags": ["Foreign transfer mismatch"]
        }
        
    # 6. Cash Structuring
    if data.get('Is_Cash_Structuring'):
        return {
            "risk_score": 0.85,
            "risk_level": "High (STR Review)",
            "flags": ["Multiple cash transactions slightly below threshold"]
        }

    # 7. Cash Transaction Limit
    if amt is not None and float(amt) >= 2000000:
        return {
            "risk_score": 0.79,
            "risk_level": "Medium (CTR Review)",
            "flags": ["Cash transaction limit reached"]
        }
        
    # 8. Deviation Score Breached
    dev_score = data.get('Deviation_Score')
    if dev_score is not None and float(dev_score) > 100:
        return {
            "risk_score": 0.75,
            "risk_level": "Medium (Abnormal Activity)",
            "flags": ["Customer activity exceeds deviation score"]
        }

    df = pd.DataFrame([data])
    
    # 1. Feature Engineering
    if 'Timestamp' in df.columns and pd.notnull(df['Timestamp'].iloc[0]):
        try:
            df['Timestamp'] = pd.to_datetime(df['Timestamp'])
            df['Transaction_Hour'] = df['Timestamp'].dt.hour
        except:
            pass # Fall back to imputation if format is invalid
            
    if 'Transaction_Amount' in df.columns and 'Account_Balance' in df.columns:
        amt = df['Transaction_Amount'].iloc[0]
        bal = df['Account_Balance'].iloc[0]
        if pd.notnull(amt) and pd.notnull(bal):
            df['Amount_to_Balance_Ratio'] = amt / (bal + 1e-5)
            
    # 2. Imputation (Fill missing values with median/mode)
    for col, modal_val in imputation_values["numeric"].items():
        if col not in df.columns or pd.isnull(df[col].iloc[0]):
            df[col] = modal_val
            
    for col, mode_val in imputation_values["categorical"].items():
        if col not in df.columns or pd.isnull(df[col].iloc[0]):
            df[col] = mode_val
            
    # 3. Encoding (Label Encoders)
    for col, le in encoders.items():
        if col in df.columns:
            val = str(df[col].iloc[0])
            # Handle unseen labels
            if val in le.classes_:
                df[col] = le.transform([val])
            else:
                mode_val = str(imputation_values["categorical"][col])
                if mode_val in le.classes_:
                    df[col] = le.transform([mode_val])
                else:
                    df[col] = 0
                    
    # 4. Ordering Features
    X = df[ordered_features]
    
    # 5. Scaling
    X_scaled = scaler.transform(X)
    
    # 6. Predict
    prob = rf_model.predict_proba(X_scaled)[0, 1]
    
    # Thresholding logic updated to include Medium
    if prob >= 0.80:
        level = "High"
    elif prob >= 0.25:
        level = "Medium"
    else:
        level = "Low"
    
    return {
        "risk_score": float(prob),
        "risk_level": level
    }
