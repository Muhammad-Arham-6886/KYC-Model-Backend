import sys
import os

sys.path.insert(0, r"c:\My Files\University\Final Year Project\backend\base-testing model\backend")
from app.ml.predictors import predict_risk

data = {
    "Transaction_Amount": 5000,
    "Account_Balance": 100000,
    "Transaction_Type": "POS",
    "Device_Type": "Mobile",
    "Bank_Name": "MCB",
    "Is_Weekend": 0
}

result = predict_risk(data)
print(result)
