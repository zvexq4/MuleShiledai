from functools import lru_cache

from services.excel_data_provider import normalize_transactions
from services.ml_anomaly_detector import (
    enrich_wallets_with_hybrid_score,
)
from services.risk_engine import analyze_all_wallets


DEFAULT_CONTAMINATION = 0.02


@lru_cache(maxsize=1)
def get_cached_transactions() -> list[dict]:
    """
    Excel dosyasını yalnızca ilk çağrıda okur.
    Sonraki çağrılarda RAM'deki işlem listesini döndürür.
    """
    return normalize_transactions()


@lru_cache(maxsize=1)
def get_cached_rule_wallets() -> list[dict]:
    """
    Kural tabanlı analizi yalnızca bir kez çalıştırır.
    """
    transactions = get_cached_transactions()

    return analyze_all_wallets(transactions)


@lru_cache(maxsize=8)
def get_cached_hybrid_wallets(
    contamination: float = DEFAULT_CONTAMINATION,
) -> list[dict]:
    """
    Isolation Forest ve hibrit risk skorunu yalnızca
    her contamination değeri için bir kez hesaplar.
    """
    rule_wallets = get_cached_rule_wallets()

    return enrich_wallets_with_hybrid_score(
        rule_wallets,
        contamination=contamination,
    )


@lru_cache(maxsize=8)
def get_cached_wallet_map(
    contamination: float = DEFAULT_CONTAMINATION,
) -> dict[str, dict]:
    """
    Wallet detay aramalarını O(1) hale getirir.
    Bütün listeyi her istekte dolaşmak zorunda kalmayız.
    """
    wallets = get_cached_hybrid_wallets(contamination)

    return {
        wallet["wallet_id"]: wallet
        for wallet in wallets
    }


def warm_analysis_cache() -> None:
    """
    Backend açılırken cache'i önceden hazırlar.
    Böylece ilk frontend isteği beklemez.
    """
    get_cached_transactions()
    get_cached_rule_wallets()
    get_cached_hybrid_wallets(DEFAULT_CONTAMINATION)
    get_cached_wallet_map(DEFAULT_CONTAMINATION)


def clear_analysis_cache() -> None:
    """
    Excel veya model değiştiğinde cache'i temizlemek için kullanılır.
    """
    get_cached_wallet_map.cache_clear()
    get_cached_hybrid_wallets.cache_clear()
    get_cached_rule_wallets.cache_clear()
    get_cached_transactions.cache_clear()