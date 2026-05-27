from pydantic import BaseModel
from typing import Optional

class TransactionRequest(BaseModel):
    # Numeric features
    Transaction_Amount: Optional[float] = None
    Account_Balance: Optional[float] = None
    IP_Address_Flag: Optional[float] = None
    Daily_Transaction_Count: Optional[float] = None
    Avg_Transaction_Amount_7d: Optional[float] = None
    Failed_Transaction_Count_7d: Optional[float] = None
    Card_Age: Optional[float] = None
    Transaction_Distance: Optional[float] = None
    Is_Weekend: Optional[float] = None
    Age: Optional[float] = None
    Monthly_Income_PKR: Optional[float] = None
    Account_Age_Years: Optional[float] = None
    Transaction_Hour: Optional[float] = None
    Amount_to_Balance_Ratio: Optional[float] = None
    
    # Categorical features
    Transaction_Type: Optional[str] = None
    Device_Type: Optional[str] = None
    Bank_Name: Optional[str] = None
    Merchant_Category: Optional[str] = None
    Card_Type: Optional[str] = None
    Authentication_Method: Optional[str] = None
    Gender: Optional[str] = None
    City: Optional[str] = None
    Profession: Optional[str] = None
    Account_Type: Optional[str] = None
    
    # Raw feature for engineering
    Timestamp: Optional[str] = None

    Customer_Name: Optional[str] = None

    # Compliance Simulation Flags
    Is_Cash_Structuring: Optional[bool] = None
    Deviation_Score: Optional[float] = None
    Is_Hub_Portfolio: Optional[bool] = None
    Is_Layering_Loop: Optional[bool] = None
    Foreign_KYC_Mismatch: Optional[bool] = None
    Property_Doc_Missing: Optional[bool] = None

class RiskResponse(BaseModel):
    risk_score: float
    risk_level: str
    flags: Optional[list[str]] = None
