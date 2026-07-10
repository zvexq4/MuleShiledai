from datetime import datetime, timezone
from uuid import uuid4

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from services.data_provider import (
    get_transactions,
    save_transactions,
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
    }

    transactions.append(new_transaction)
    save_transactions(transactions)

    return {
        "message": "Transaction created successfully",
        "transaction": new_transaction,
    }