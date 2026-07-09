import json
from datetime import datetime

from fastapi import APIRouter
from pydantic import BaseModel

from services.data_provider import get_transactions

router = APIRouter()


class TransactionCreate(BaseModel):
    account_id: str
    amount: int
    type: str
    sender_id: str
    receiver_id: str
    device_id: str
    location: str


@router.get("/transactions/{account_id}")
def get_transactions_by_account(account_id: str):
    transactions = get_transactions()

    account_transactions = [
        tx for tx in transactions if tx["account_id"] == account_id
    ]

    return {
        "account_id": account_id,
        "transactions": account_transactions
    }


@router.post("/transactions")
def add_transaction(transaction: TransactionCreate):
    transactions = get_transactions()

    new_transaction = {
        "transaction_id": f"TX{len(transactions) + 1:03d}",
        "account_id": transaction.account_id,
        "amount": transaction.amount,
        "type": transaction.type,
        "sender_id": transaction.sender_id,
        "receiver_id": transaction.receiver_id,
        "timestamp": datetime.now().isoformat(timespec="seconds"),
        "device_id": transaction.device_id,
        "location": transaction.location
    }

    transactions.append(new_transaction)

    with open("../datasets/sample_transactions.json", "w", encoding="utf-8") as file:
        json.dump(transactions, file, indent=2)

    return {
        "message": "Transaction added successfully",
        "transaction": new_transaction
    }