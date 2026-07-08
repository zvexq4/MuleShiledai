from fastapi import APIRouter
from services.risk_engine import load_transactions

router = APIRouter()


@router.get("/transactions/{account_id}")
def get_transactions(account_id: str):
    transactions = load_transactions("../datasets/sample_transactions.json")

    account_transactions = [
        tx for tx in transactions if tx["account_id"] == account_id
    ]

    return {
        "account_id": account_id,
        "transactions": account_transactions
    }