from collections import Counter

from fastapi import APIRouter, HTTPException

from services.ml_anomaly_detector import (
    enrich_wallets_with_hybrid_score,
    enrich_wallets_with_ml,
)
from services.analysis_cache import (
    DEFAULT_CONTAMINATION,
    get_cached_hybrid_wallets,
    get_cached_rule_wallets,
    get_cached_transactions,
    get_cached_wallet_map,
)


router = APIRouter(
    prefix="/dataset",
    tags=["Hackathon Dataset"],
)

DEFAULT_CONTAMINATION = 0.02


def validate_limit(
    limit: int,
    maximum: int = 500,
) -> None:
    if limit < 1 or limit > maximum:
        raise HTTPException(
            status_code=400,
            detail=f"Limit must be between 1 and {maximum}.",
        )


def validate_contamination(
    contamination: float,
) -> None:
    if contamination <= 0 or contamination > 0.5:
        raise HTTPException(
            status_code=400,
            detail=(
                "Contamination must be greater than 0 "
                "and at most 0.5."
            ),
        )

def frontend_wallet(wallet: dict) -> dict:
    return {
        **wallet,
        "risk_score": wallet["hybrid_risk_score"],
        "risk_level": wallet["hybrid_risk_level"],
    }


@router.get("/summary")
def get_dataset_summary():
    transactions = get_cached_transactions()

    type_counts = Counter(
        transaction["transaction_type"]
        for transaction in transactions
    )

    direction_counts = Counter(
        transaction["direction"]
        for transaction in transactions
    )

    total_amount = sum(
        float(transaction.get("amount", 0))
        for transaction in transactions
    )

    unique_wallets = {
        value
        for transaction in transactions
        for value, value_type in (
            (
                transaction.get("source"),
                transaction.get("source_type"),
            ),
            (
                transaction.get("target"),
                transaction.get("target_type"),
            ),
        )
        if value and value_type == "wallet"
    }

    unique_ibans = {
        value
        for transaction in transactions
        for value, value_type in (
            (
                transaction.get("source"),
                transaction.get("source_type"),
            ),
            (
                transaction.get("target"),
                transaction.get("target_type"),
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
    validate_limit(limit, maximum=1000)

    if offset < 0:
        raise HTTPException(
            status_code=400,
            detail="Offset cannot be negative.",
        )

    transactions = get_cached_transactions()

    return {
        "total": len(transactions),
        "limit": limit,
        "offset": offset,
        "transactions": transactions[
            offset : offset + limit
        ],
    }


@router.get("/risk-accounts")
def get_rule_risk_accounts(
    limit: int = 50,
    min_score: int = 20,
):
    validate_limit(limit)

    if min_score < 0 or min_score > 100:
        raise HTTPException(
            status_code=400,
            detail="Minimum score must be between 0 and 100.",
        )

    try:
        wallets = get_cached_rule_wallets()
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
        "model": "Explainable Rule Engine",
        "total_analyzed_wallets": len(wallets),
        "matching_wallets": len(filtered_wallets),
        "minimum_score": min_score,
        "wallets": filtered_wallets[:limit],
    }


@router.get("/risk-distribution")
def get_rule_risk_distribution():
    try:
        wallets = get_cached_rule_wallets()
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
            "model": "Explainable Rule Engine",
            "total_wallets": 0,
            "safe": {
                "count": 0,
                "percentage": 0,
            },
            "suspicious": {
                "count": 0,
                "percentage": 0,
            },
            "critical": {
                "count": 0,
                "percentage": 0,
            },
            "average_score": 0,
            "median_score": 0,
            "percentiles": {},
            "top_10_wallets": [],
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
        sum(scores) / total_wallets,
        2,
    )

    middle = total_wallets // 2

    if total_wallets % 2 == 0:
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
        "model": "Explainable Rule Engine",
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


@router.get("/ml-anomalies")
def get_ml_anomalies(
    limit: int = 50,
    contamination: float = DEFAULT_CONTAMINATION,
):
    validate_limit(limit)
    validate_contamination(contamination)

    try:
        rule_wallets = get_cached_rule_wallets()

        wallets = enrich_wallets_with_ml(
            rule_wallets,
            contamination=contamination,
        )
    except (FileNotFoundError, ValueError) as error:
        raise HTTPException(
            status_code=500,
            detail=str(error),
        ) from error

    anomaly_count = sum(
        1
        for wallet in wallets
        if wallet["is_ml_anomaly"]
    )

    return {
        "model": "IsolationForest",
        "model_type": "unsupervised anomaly detection",
        "contamination": contamination,
        "total_wallets": len(wallets),
        "ml_anomaly_count": anomaly_count,
        "wallets": wallets[:limit],
    }


@router.get("/hybrid-risk")
def get_hybrid_risk(
    limit: int = 100,
    contamination: float = DEFAULT_CONTAMINATION,
):
    validate_limit(limit)
    validate_contamination(contamination)

    try:
        wallets = get_cached_hybrid_wallets(
            contamination,
        )
    except (FileNotFoundError, ValueError) as error:
        raise HTTPException(
            status_code=500,
            detail=str(error),
        ) from error

    distribution = {
        "safe": 0,
        "watchlist": 0,
        "suspicious": 0,
        "critical": 0,
    }

    for wallet in wallets:
        level = wallet["hybrid_risk_level"]
        distribution[level] += 1

    return {
        "model": "Hybrid Explainable AI",
        "rule_weight": 0.60,
        "ml_weight": 0.40,
        "contamination": contamination,
        "total_wallets": len(wallets),
        "distribution": distribution,
        "wallets": [
            frontend_wallet(wallet)
            for wallet in wallets[:limit]
        ],
    }


@router.get("/dashboard")
def get_hackathon_dashboard(
    limit: int = 250,
):
    validate_limit(limit)

    transactions = get_cached_transactions()

    try:
        wallets = get_cached_hybrid_wallets(
            DEFAULT_CONTAMINATION,
        )
    except (FileNotFoundError, ValueError) as error:
        raise HTTPException(
            status_code=500,
            detail=str(error),
        ) from error

    distribution = {
        "safe": 0,
        "watchlist": 0,
        "suspicious": 0,
        "critical": 0,
    }

    for wallet in wallets:
        level = wallet["hybrid_risk_level"]
        distribution[level] += 1

    return {
        "source": "hackathon",
        "model": "Hybrid Explainable AI",
        "rule_weight": 0.60,
        "ml_weight": 0.40,
        "summary": {
            "total_wallets": len(wallets),
            "safe_wallets": distribution["safe"],
            "watchlist_wallets": (
                distribution["watchlist"]
            ),
            "suspicious_wallets": (
                distribution["suspicious"]
            ),
            "critical_wallets": (
                distribution["critical"]
            ),
            "total_transactions": len(transactions),
        },
        "wallets": [
            frontend_wallet(wallet)
            for wallet in wallets[:limit]
        ],
    }


@router.get("/wallet/{wallet_id}/transactions")
def get_wallet_transactions(
    wallet_id: str,
    limit: int = 500,
):
    validate_limit(limit, maximum=2000)

    transactions = get_cached_transactions()

    wallet_transactions = [
        transaction
        for transaction in transactions
        if (
            transaction.get("source") == wallet_id
            or transaction.get("target") == wallet_id
        )
    ]

    wallet_transactions.sort(
        key=lambda transaction: (
            transaction.get("timestamp") or ""
        ),
        reverse=True,
    )

    return {
        "wallet_id": wallet_id,
        "total": len(wallet_transactions),
        "transactions": wallet_transactions[:limit],
    }


@router.get("/wallet/{wallet_id}")
def get_wallet_risk(wallet_id: str):
    try:
        wallet_map = get_cached_wallet_map(
            DEFAULT_CONTAMINATION
        )
    except (FileNotFoundError, ValueError) as error:
        raise HTTPException(
            status_code=500,
            detail=str(error),
        ) from error

    result = wallet_map.get(wallet_id)

    if not result:
        raise HTTPException(
            status_code=404,
            detail=f"Wallet not found: {wallet_id}",
        )

    return frontend_wallet(result)

    result = next(
        (
            wallet
            for wallet in wallets
            if wallet["wallet_id"] == wallet_id
        ),
        None,
    )

    if not result:
        raise HTTPException(
            status_code=404,
            detail=f"Wallet not found: {wallet_id}",
        )

    return frontend_wallet(result)