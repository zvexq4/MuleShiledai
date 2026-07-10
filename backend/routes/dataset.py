from collections import Counter

from fastapi import APIRouter, HTTPException

from services.excel_data_provider import normalize_transactions


router = APIRouter(
    prefix="/dataset",
    tags=["Hackathon Dataset"],
)


@router.get("/summary")
def get_dataset_summary():
    try:
        transactions = normalize_transactions()
    except (FileNotFoundError, ValueError) as error:
        raise HTTPException(
            status_code=500,
            detail=str(error),
        ) from error

    type_counts = Counter(
        transaction["transaction_type"]
        for transaction in transactions
    )

    direction_counts = Counter(
        transaction["direction"]
        for transaction in transactions
    )

    total_amount = sum(
        transaction["amount"]
        for transaction in transactions
    )

    unique_wallets = {
        value
        for transaction in transactions
        for value, value_type in (
            (transaction["source"], transaction["source_type"]),
            (transaction["target"], transaction["target_type"]),
        )
        if value and value_type == "wallet"
    }

    unique_ibans = {
        value
        for transaction in transactions
        for value, value_type in (
            (transaction["source"], transaction["source_type"]),
            (transaction["target"], transaction["target_type"]),
        )
        if value and value_type == "iban"
    }

    return {
        "source": "hackathon-data-trx.xlsx",
        "total_transactions": len(transactions),
        "total_amount": round(total_amount, 2),
        "unique_wallets": len(unique_wallets),
        "unique_ibans": len(unique_ibans),
        "transaction_types": dict(type_counts),
        "directions": dict(direction_counts),
        "sample": transactions[:5],
    }


@router.get("/transactions")
def get_dataset_transactions(
    limit: int = 100,
    offset: int = 0,
):
    if limit < 1 or limit > 1000:
        raise HTTPException(
            status_code=400,
            detail="Limit must be between 1 and 1000.",
        )

    if offset < 0:
        raise HTTPException(
            status_code=400,
            detail="Offset cannot be negative.",
        )

    transactions = normalize_transactions()

    return {
        "total": len(transactions),
        "limit": limit,
        "offset": offset,
        "transactions": transactions[offset : offset + limit],
    }