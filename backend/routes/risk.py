from fastapi import APIRouter
from services.risk_engine import calculate_risk, load_transactions

router = APIRouter()


@router.get("/risk/{account_id}")
def get_risk(account_id: str):
    transactions = load_transactions("../datasets/sample_transactions.json")
    result = calculate_risk(account_id, transactions)

    return result