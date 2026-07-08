from fastapi import APIRouter
from services.risk_engine import calculate_risk, load_transactions

router = APIRouter()


@router.get("/accounts")
def get_accounts():
    transactions = load_transactions("../datasets/sample_transactions.json")

    account_ids = sorted(set(tx["account_id"] for tx in transactions))

    accounts = []
    for account_id in account_ids:
        risk = calculate_risk(account_id, transactions)

        accounts.append({
            "account_id": account_id,
            "risk_score": risk["risk_score"],
            "risk_level": risk["risk_level"]
        })

    return {
        "accounts": accounts
    }