import requests
import json

url = "https://muhammad-arham-777-kyc-model-backend.hf.space/api/risk/score"
payload = {
    "Customer_Name": "Test User",
    "Age": 25,
    "Occupation": "Engineer",
    "Bank_Name": "TestBank",
    "Account_Balance": 1000,
    "Transaction_Amount": 50000,
    "Transaction_Duration": 5,
    "Is_KYC_Verified": False
}

response = requests.post(url, json=payload)
print(f"Status: {response.status_code}")
try:
    print(response.json())
except:
    print(response.text)
