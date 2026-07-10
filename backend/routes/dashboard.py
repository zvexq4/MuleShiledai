from fastapi import APIRouter

from services.data_provider import get_transactions, get_users
from services.risk_engine import calculate_risk

router = APIRouter()


@router.get("/dashboard")
def get_dashboard():
    users = get_users()
    transactions = get_transactions()

    safe_accounts = 0
    suspicious_accounts = 0
    critical_accounts = 0

    for user in users:
        account_id = user["account_id"]

        account_transactions = [
            tx
            for tx in transactions
            if tx.get("account_id") == account_id
            or tx.get("sender_id") == account_id
            or tx.get("receiver_id") == account_id
        ]

        risk = calculate_risk(account_id, account_transactions)
        risk_level = risk["risk_level"]

        if risk_level == "critical":
            critical_accounts += 1
        elif risk_level == "suspicious":
            suspicious_accounts += 1
        else:
            safe_accounts += 1

    return {
        "total_accounts": len(users),
        "safe_accounts": safe_accounts,
        "suspicious_accounts": suspicious_accounts,
        "critical_accounts": critical_accounts,
        "total_transactions": len(transactions),
    }