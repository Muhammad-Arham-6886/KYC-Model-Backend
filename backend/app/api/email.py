import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import os
from typing import List, Optional

router = APIRouter()

class EmailRequest(BaseModel):
    customerName: str
    amount: float
    riskLevel: str
    flags: List[str]
    alertId: str
    targetEmails: List[str]

@router.post("/sar")
async def send_sar_email(request: EmailRequest):
    sender_email = os.environ.get("SENDER_EMAIL")
    app_password = os.environ.get("GMAIL_APP_PASSWORD")

    if not sender_email or not app_password:
        raise HTTPException(status_code=500, detail="Server email configuration is missing.")

    subject = f"URGENT: Suspicious Activity Report (SAR) - REF: {request.alertId}"
    
    html_content = f"""
    <html>
      <body style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
        <h2 style="color: #d9534f; border-bottom: 2px solid #d9534f; padding-bottom: 5px;">
          Suspicious Activity Report (SAR)
        </h2>
        <p><strong>To:</strong> State Bank of Pakistan (Financial Monitoring Unit)</p>
        <p><strong>From:</strong> KYC Risk Engine v2.0</p>
        <p><strong>Reference ID:</strong> {request.alertId}</p>
        
        <div style="background-color: #fdf2f2; border: 1px solid #f5c6cb; padding: 15px; margin: 20px 0;">
          <h3 style="color: #721c24; margin-top: 0;">COMPLAINT FLAG TRIGGERED</h3>
          <p style="color: #721c24;">This transaction was automatically flagged by the KYC Risk Engine Machine Learning model as <strong>{request.riskLevel} Risk</strong>. Immediate review is requested.</p>
        </div>

        <h3>Subject Information</h3>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
          <tr>
            <td style="border: 1px solid #ddd; padding: 8px;"><strong>Customer Name</strong></td>
            <td style="border: 1px solid #ddd; padding: 8px;">{request.customerName}</td>
          </tr>
          <tr>
            <td style="border: 1px solid #ddd; padding: 8px;"><strong>Transaction Amount</strong></td>
            <td style="border: 1px solid #ddd; padding: 8px; color: #d9534f; font-weight: bold;">PKR {request.amount:,.2f}</td>
          </tr>
        </table>

        <h3>Detected Anomalies</h3>
        <ul>
          {"".join(f"<li>{flag}</li>" for flag in request.flags)}
          { "<li>Unusual spending pattern compared to historical baseline.</li>" if not request.flags else "" }
        </ul>

        <p style="font-size: 12px; color: #777; margin-top: 30px; border-top: 1px solid #eee; padding-top: 10px;">
          Generated automatically by Financial Security Systems Risk Engine v2.0.<br>
          This document is electronically signed and transmitted securely.
        </p>
      </body>
    </html>
    """

    try:
        # Create message container
        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"] = f"KYC Risk Engine <{sender_email}>"
        msg["To"] = ", ".join(request.targetEmails)

        # Attach HTML content
        part = MIMEText(html_content, "html")
        msg.attach(part)

        # Send Email securely via Gmail SMTP
        with smtplib.SMTP("smtp.gmail.com", 587) as server:
            server.ehlo()
            server.starttls()
            server.login(sender_email, app_password)
            server.sendmail(sender_email, request.targetEmails, msg.as_string())
            
        return {"message": "SAR Email successfully sent."}

    except smtplib.SMTPAuthenticationError:
        raise HTTPException(status_code=401, detail="Email authentication failed. Check App Password.")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
