from fastapi import APIRouter
from services.risk_engine import calculate_risk, load_transactions

router = APIRouter()


@router.get("/dashboard")
def get_dashboard():
    transactions = load_transactions("../datasets/sample_transactions.json")
    account_ids = sorted(set(tx["account_id"] for tx in transactions))

    safe_count = 0
    suspicious_count = 0
    critical_count = 0

    for account_id in account_ids:
        risk = calculate_risk(account_id, transactions)

        if risk["risk_level"] == "safe":
            safe_count += 1
        elif risk["risk_level"] == "suspicious":
            suspicious_count += 1
        elif risk["risk_level"] == "critical":
            critical_count += 1

    return {
        "total_accounts": len(account_ids),
        "safe_accounts": safe_count,
        "suspicious_accounts": suspicious_count,
        "critical_accounts": critical_count,
        "total_transactions": len(transactions)
    }