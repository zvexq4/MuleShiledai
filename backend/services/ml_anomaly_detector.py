from math import log1p
from typing import Any

import numpy as np
from sklearn.ensemble import IsolationForest


FEATURE_NAMES = [
    "incoming_transaction_count",
    "outgoing_transaction_count",
    "unique_senders",
    "unique_targets",
    "rapid_transfer_count",
    "wallet_transfer_count",
    "total_incoming",
    "total_outgoing",
    "outgoing_ratio",
]


def safe_number(value: Any) -> float:
    try:
        number = float(value)

        if not np.isfinite(number):
            return 0.0

        return max(number, 0.0)
    except (TypeError, ValueError):
        return 0.0


def build_feature_vector(wallet: dict) -> list[float]:
    metrics = wallet.get("metrics", {})

    values = [
        safe_number(metrics.get(feature_name, 0))
        for feature_name in FEATURE_NAMES
    ]

    # İşlem sayıları ve tutarlar çok geniş aralıklarda olduğu için
    # log dönüşümü uyguluyoruz.
    return [
        log1p(value)
        for value in values
    ]


def build_feature_matrix(
    wallets: list[dict],
) -> np.ndarray:
    return np.array(
        [
            build_feature_vector(wallet)
            for wallet in wallets
        ],
        dtype=float,
    )


def percentile_scores(
    raw_anomaly_values: np.ndarray,
) -> np.ndarray:
    """
    Cüzdanların diğer cüzdanlara göre anomali yüzdeliğini üretir.

    Bu skor dolandırıcılık olasılığı değildir.
    """
    total = len(raw_anomaly_values)

    if total <= 1:
        return np.zeros(total, dtype=float)

    order = np.argsort(raw_anomaly_values)
    ranks = np.empty(total, dtype=float)
    ranks[order] = np.arange(total)

    return np.round(
        ranks / (total - 1) * 100,
        2,
    )


def detect_anomalies(
    wallets: list[dict],
    contamination: float = 0.02,
) -> list[dict]:
    if not wallets:
        return []

    if not 0 < contamination <= 0.5:
        raise ValueError(
            "Contamination must be greater than 0 "
            "and at most 0.5."
        )

    if len(wallets) < 10:
        return [
            {
                "wallet_id": (
                    wallet.get("wallet_id")
                    or wallet.get("account_id")
                ),
                "ml_anomaly_score": 0,
                "is_ml_anomaly": False,
                "ml_decision_score": 0.0,
            }
            for wallet in wallets
        ]

    feature_matrix = build_feature_matrix(wallets)

    model = IsolationForest(
        n_estimators=300,
        contamination=contamination,
        random_state=42,
        n_jobs=-1,
    )

    predictions = model.fit_predict(feature_matrix)

    # IsolationForest score_samples:
    # daha düşük değer = daha anormal.
    raw_scores = model.score_samples(feature_matrix)

    # Düşük raw score'u yüksek anomali değerine çeviriyoruz.
    anomaly_values = -raw_scores
    normalized_scores = percentile_scores(
        anomaly_values
    )

    results = []

    for index, wallet in enumerate(wallets):
        wallet_id = (
            wallet.get("wallet_id")
            or wallet.get("account_id")
        )

        results.append(
            {
                "wallet_id": wallet_id,
                "ml_anomaly_score": float(
  				  normalized_scores[index]
				),
                "is_ml_anomaly": (
                    int(predictions[index]) == -1
                ),
                "ml_decision_score": round(
                    float(
                        model.decision_function(
                            feature_matrix[index].reshape(
                                1,
                                -1,
                            )
                        )[0]
                    ),
                    6,
                ),
            }
        )

    return sorted(
        results,
        key=lambda result: result[
            "ml_anomaly_score"
        ],
        reverse=True,
    )


def enrich_wallets_with_ml(
    wallets: list[dict],
    contamination: float = 0.02,
) -> list[dict]:
    ml_results = detect_anomalies(
        wallets,
        contamination,
    )

    ml_by_wallet = {
        result["wallet_id"]: result
        for result in ml_results
    }

    enriched_wallets = []

    for wallet in wallets:
        wallet_id = (
            wallet.get("wallet_id")
            or wallet.get("account_id")
        )

        ml_result = ml_by_wallet.get(
            wallet_id,
            {
                "ml_anomaly_score": 0,
                "is_ml_anomaly": False,
                "ml_decision_score": 0.0,
            },
        )

        enriched_wallets.append(
            {
                **wallet,
                **ml_result,
            }
        )

    return sorted(
        enriched_wallets,
        key=lambda wallet: (
            wallet.get("ml_anomaly_score", 0),
            wallet.get("risk_score", 0),
        ),
        reverse=True,
    )
def calculate_hybrid_score(
    rule_score: int,
    ml_anomaly_score: float,
    is_ml_anomaly: bool,
) -> int:
    if is_ml_anomaly:
        ml_component = ml_anomaly_score
    else:
        ml_component = ml_anomaly_score * 0.25

    hybrid_score = (
        rule_score * 0.60
        + ml_component * 0.40
    )

    return min(round(hybrid_score), 100)


def get_hybrid_risk_level(score: int) -> str:
    if score >= 60:
        return "critical"

    if score >= 35:
        return "suspicious"

    if score >= 20:
        return "watchlist"

    return "safe"


def enrich_wallets_with_hybrid_score(
    wallets: list[dict],
    contamination: float = 0.02,
) -> list[dict]:
    ml_wallets = enrich_wallets_with_ml(
        wallets,
        contamination,
    )

    results = []

    for wallet in ml_wallets:
        rule_score = int(
            wallet.get("risk_score", 0)
        )

        ml_score = float(
            wallet.get("ml_anomaly_score", 0)
        )

        is_ml_anomaly = bool(
            wallet.get("is_ml_anomaly", False)
        )

        hybrid_score = calculate_hybrid_score(
            rule_score,
            ml_score,
            is_ml_anomaly,
        )

        results.append(
            {
                **wallet,
                "rule_risk_score": rule_score,
                "hybrid_risk_score": hybrid_score,
                "hybrid_risk_level": (
                    get_hybrid_risk_level(
                        hybrid_score
                    )
                ),
            }
        )

    return sorted(
        results,
        key=lambda wallet: (
            wallet["hybrid_risk_score"],
            wallet["ml_anomaly_score"],
        ),
        reverse=True,
    )