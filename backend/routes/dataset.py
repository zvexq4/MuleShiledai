from collections import Counter

from fastapi import APIRouter, HTTPException

from services.excel_data_provider import normalize_transactions
from services.risk_engine import (
    analyze_all_wallets,
    get_wallet_analysis,
)


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
            (
                transaction["source"],
                transaction["source_type"],
            ),
            (
                transaction["target"],
                transaction["target_type"],
            ),
        )
        if value and value_type == "wallet"
    }

    unique_ibans = {
        value
        for transaction in transactions
        for value, value_type in (
            (
                transaction["source"],
                transaction["source_type"],
            ),
            (
                transaction["target"],
                transaction["target_type"],
            ),
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

    try:
        transactions = normalize_transactions()
    except (FileNotFoundError, ValueError) as error:
        raise HTTPException(
            status_code=500,
            detail=str(error),
        ) from error

    return {
        "total": len(transactions),
        "limit": limit,
        "offset": offset,
        "transactions": transactions[offset : offset + limit],
    }


@router.get("/risk-accounts")
def get_risk_accounts(
    limit: int = 50,
    min_score: int = 20,
):
    if limit < 1 or limit > 500:
        raise HTTPException(
            status_code=400,
            detail="Limit must be between 1 and 500.",
        )

    if min_score < 0 or min_score > 100:
        raise HTTPException(
            status_code=400,
            detail="Minimum score must be between 0 and 100.",
        )

    try:
        transactions = normalize_transactions()
        wallets = analyze_all_wallets(transactions)
    except (FileNotFoundError, ValueError) as error:
        raise HTTPException(
            status_code=500,
            detail=str(error),
        ) from error

    filtered_wallets = [
        wallet
        for wallet in wallets
        if wallet["risk_score"] >= min_score
    ]

    return {
        "total_analyzed_wallets": len(wallets),
        "matching_wallets": len(filtered_wallets),
        "minimum_score": min_score,
        "wallets": filtered_wallets[:limit],
    }


@router.get("/wallet/{wallet_id}")
def get_wallet_risk(wallet_id: str):
    try:
        transactions = normalize_transactions()

        result = get_wallet_analysis(
            wallet_id,
            transactions,
        )
    except (FileNotFoundError, ValueError) as error:
        raise HTTPException(
            status_code=500,
            detail=str(error),
        ) from error

    if not result:
        raise HTTPException(
            status_code=404,
            detail=f"Wallet not found: {wallet_id}",
        )

    return result
@router.get("/risk-distribution")
def get_risk_distribution():
    try:
        transactions = normalize_transactions()
        wallets = analyze_all_wallets(transactions)
    except (FileNotFoundError, ValueError) as error:
        raise HTTPException(
            status_code=500,
            detail=str(error),
        ) from error

    scores = sorted(
        wallet["risk_score"]
        for wallet in wallets
    )

    total_wallets = len(wallets)

    if total_wallets == 0:
        return {
            "total_wallets": 0,
            "safe": 0,
            "suspicious": 0,
            "critical": 0,
            "average_score": 0,
            "median_score": 0,
            "percentiles": {},
        }

    safe_wallets = [
        wallet
        for wallet in wallets
        if wallet["risk_level"] == "safe"
    ]

    suspicious_wallets = [
        wallet
        for wallet in wallets
        if wallet["risk_level"] == "suspicious"
    ]

    critical_wallets = [
        wallet
        for wallet in wallets
        if wallet["risk_level"] == "critical"
    ]

    def percentile(percent: float) -> int:
        index = round(
            (len(scores) - 1) * percent
        )

        return scores[index]

    average_score = round(
        sum(scores) / len(scores),
        2,
    )

    middle = len(scores) // 2

    if len(scores) % 2 == 0:
        median_score = round(
            (
                scores[middle - 1]
                + scores[middle]
            )
            / 2,
            2,
        )
    else:
        median_score = scores[middle]

    return {
        "total_wallets": total_wallets,
        "safe": {
            "count": len(safe_wallets),
            "percentage": round(
                len(safe_wallets)
                / total_wallets
                * 100,
                2,
            ),
        },
        "suspicious": {
            "count": len(suspicious_wallets),
            "percentage": round(
                len(suspicious_wallets)
                / total_wallets
                * 100,
                2,
            ),
        },
        "critical": {
            "count": len(critical_wallets),
            "percentage": round(
                len(critical_wallets)
                / total_wallets
                * 100,
                2,
            ),
        },
        "average_score": average_score,
        "median_score": median_score,
        "minimum_score": scores[0],
        "maximum_score": scores[-1],
        "percentiles": {
            "p50": percentile(0.50),
            "p75": percentile(0.75),
            "p90": percentile(0.90),
            "p95": percentile(0.95),
            "p99": percentile(0.99),
        },
        "top_10_wallets": wallets[:10],
    }
@router.get("/dashboard")
def get_hackathon_dashboard():
    try:
        transactions = normalize_transactions()
        wallets = analyze_all_wallets(transactions)
    except (FileNotFoundError, ValueError) as error:
        raise HTTPException(
            status_code=500,
            detail=str(error),
        ) from error

    safe_count = sum(
        1 for wallet in wallets
        if wallet["risk_level"] == "safe"
    )

    suspicious_count = sum(
        1 for wallet in wallets
        if wallet["risk_level"] == "suspicious"
    )

    critical_count = sum(
        1 for wallet in wallets
        if wallet["risk_level"] == "critical"
    )

    return {
        "source": "hackathon",
        "summary": {
            "total_wallets": len(wallets),
            "safe_wallets": safe_count,
            "suspicious_wallets": suspicious_count,
            "critical_wallets": critical_count,
            "total_transactions": len(transactions),
        },
        "wallets": wallets[:100],
    }
@router.get("/wallet/{wallet_id}/transactions")
def get_wallet_transactions(
    wallet_id: str,
    limit: int = 500,
):
    if limit < 1 or limit > 2000:
        raise HTTPException(
            status_code=400,
            detail="Limit must be between 1 and 2000.",
        )

    try:
        transactions = normalize_transactions()
    except (FileNotFoundError, ValueError) as error:
        raise HTTPException(
            status_code=500,
            detail=str(error),
        ) from error

    wallet_transactions = [
        transaction
        for transaction in transactions
        if transaction.get("source") == wallet_id
        or transaction.get("target") == wallet_id
    ]

    wallet_transactions.sort(
        key=lambda transaction: transaction.get("timestamp") or "",
        reverse=True,
    )

    return {
        "wallet_id": wallet_id,
        "total": len(wallet_transactions),
        "transactions": wallet_transactions[:limit],
    }