from datetime import datetime, timezone
from uuid import uuid4

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from services.data_provider import (
    get_transactions,
    save_transactions,
)
from services.analysis_cache import (
    clear_analysis_cache,
    warm_analysis_cache,
)


router = APIRouter()


class TransactionCreate(BaseModel):
    account_id: str
    amount: float = Field(gt=0)
    type: str
    sender_id: str
    receiver_id: str
    device_id: str
    location: str = "Unknown"


@router.get("/transactions/{account_id}")
def get_account_transactions(account_id: str):
    transactions = get_transactions()

    account_transactions = [
        transaction
        for transaction in transactions
        if transaction.get("account_id") == account_id
        or transaction.get("sender_id") == account_id
        or transaction.get("receiver_id") == account_id
    ]

    return {
        "account_id": account_id,
        "total": len(account_transactions),
        "transactions": account_transactions,
    }


@router.post("/transactions", status_code=201)
def create_transaction(payload: TransactionCreate):
    transactions = get_transactions()

    duplicate = next(
        (
            transaction
            for transaction in transactions
            if transaction.get("simulation") is True
            and transaction.get("account_id") == payload.account_id
            and float(transaction.get("amount", 0)) == payload.amount
            and transaction.get("type") == payload.type
            and transaction.get("sender_id") == payload.sender_id
            and transaction.get("receiver_id") == payload.receiver_id
            and transaction.get("device_id") == payload.device_id
        ),
        None,
    )

    if duplicate:
        raise HTTPException(
            status_code=409,
            detail=(
                "The same simulator transaction already exists: "
                f"{duplicate.get('transaction_id')}"
            ),
        )

    previous_transactions = list(transactions)

    new_transaction = {
        "transaction_id": f"TX-{uuid4().hex[:10].upper()}",
        "account_id": payload.account_id,
        "amount": payload.amount,
        "type": payload.type,
        "sender_id": payload.sender_id,
        "receiver_id": payload.receiver_id,
        "device_id": payload.device_id,
        "location": payload.location,
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "simulation": True,
    }

    transactions.append(new_transaction)

    try:
        save_transactions(transactions)
        clear_analysis_cache()
        warm_analysis_cache()
    except Exception as error:
        try:
            save_transactions(previous_transactions)
            clear_analysis_cache()
            warm_analysis_cache()
        except Exception as rollback_error:
            raise HTTPException(
                status_code=500,
                detail=(
                    "Analysis rebuild failed and the previous cache "
                    f"could not be restored: {rollback_error}"
                ),
            ) from rollback_error

        raise HTTPException(
            status_code=500,
            detail=(
                "Analysis rebuild failed. The simulator transaction "
                f"was rolled back: {error}"
            ),
        ) from error

    return {
        "message": "Transaction created successfully",
        "transaction": new_transaction,
    }
