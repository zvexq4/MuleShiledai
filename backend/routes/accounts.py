from fastapi import APIRouter

from services.data_provider import get_transactions, get_users
from services.risk_engine import calculate_risk

router = APIRouter()


@router.get("/accounts")
def get_accounts():
    transactions = get_transactions()
    users = get_users()

    accounts = []
    for user in users:
        risk = calculate_risk(user["account_id"], transactions)

        accounts.append({
            "account_id": user["account_id"],
            "name": user["name"],
            "city": user["city"],
            "age": user["age"],
            "risk_score": risk["risk_score"],
            "risk_level": risk["risk_level"]
        })

    return {"accounts": accounts}