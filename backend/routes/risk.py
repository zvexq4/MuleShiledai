from fastapi import APIRouter, HTTPException

from services.data_provider import get_transactions
from services.risk_engine import calculate_risk


router = APIRouter()


def get_account_transactions(
    account_id: str,
    transactions: list[dict],
) -> list[dict]:
    return [
        transaction
        for transaction in transactions
        if transaction.get("account_id") == account_id
        or transaction.get("sender_id") == account_id
        or transaction.get("receiver_id") == account_id
    ]


@router.get("/risk/{account_id}")
def get_risk(account_id: str):
    transactions = get_transactions()

    account_transactions = get_account_transactions(
        account_id,
        transactions,
    )

    if not account_transactions:
        raise HTTPException(
            status_code=404,
            detail=f"No transactions found for account {account_id}",
        )

    return calculate_risk(account_id, account_transactions)