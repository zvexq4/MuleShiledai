from collections import defaultdict
from datetime import datetime, timedelta
from typing import Any


RAPID_TRANSFER_WINDOW = timedelta(minutes=60)


def get_risk_level(score: int) -> str:
    if score >= 60:
        return "critical"

    if score >= 30:
        return "suspicious"

    return "safe"


def parse_timestamp(value: str | None) -> datetime | None:
    if not value:
        return None

    try:
        return datetime.fromisoformat(value)
    except (ValueError, TypeError):
        return None


def score_multiple_senders(unique_senders: int) -> int:
    if unique_senders >= 50:
        return 25

    if unique_senders >= 25:
        return 20

    if unique_senders >= 10:
        return 10

    if unique_senders >= 5:
        return 5

    return 0


def score_rapid_transfers(rapid_transfer_count: int) -> int:
    if rapid_transfer_count >= 20:
        return 30

    if rapid_transfer_count >= 10:
        return 25

    if rapid_transfer_count >= 3:
        return 20

    if rapid_transfer_count >= 1:
        return 10

    return 0


def score_fan_out(unique_targets: int) -> int:
    if unique_targets >= 500:
        return 25

    if unique_targets >= 100:
        return 20

    if unique_targets >= 25:
        return 10

    if unique_targets >= 10:
        return 5

    return 0


def score_wallet_chain(wallet_transfer_count: int) -> int:
    if wallet_transfer_count >= 20:
        return 15

    if wallet_transfer_count >= 10:
        return 10

    if wallet_transfer_count >= 3:
        return 5

    return 0


def score_flow_imbalance(
    total_incoming: float,
    total_outgoing: float,
    outgoing_transaction_count: int,
) -> int:
    if total_incoming <= 0 or outgoing_transaction_count < 3:
        return 0

    ratio = total_outgoing / total_incoming

    if ratio >= 10:
        return 10

    if ratio >= 5:
        return 8

    if ratio >= 2:
        return 5

    if ratio >= 1.2:
        return 3

    return 0


def normalize_demo_transaction(transaction: dict) -> dict:
    transaction_type = transaction.get("type")
    account_id = transaction.get("account_id")
    sender_id = transaction.get("sender_id")
    receiver_id = transaction.get("receiver_id")

    if transaction_type == "incoming":
        source = sender_id
        target = account_id or receiver_id
        source_type = "external"
        target_type = "wallet"
        direction = "incoming"

    elif transaction_type == "outgoing":
        source = account_id or sender_id
        target = receiver_id
        source_type = "wallet"
        target_type = "external"
        direction = "outgoing"

    else:
        source = sender_id
        target = receiver_id
        source_type = "wallet"
        target_type = "wallet"
        direction = "wallet_transfer"

    return {
        "transaction_id": transaction.get("transaction_id"),
        "source": source,
        "target": target,
        "source_type": source_type,
        "target_type": target_type,
        "direction": direction,
        "amount": float(transaction.get("amount", 0)),
        "timestamp": transaction.get("timestamp"),
        "device_id": transaction.get("device_id"),
    }


def normalize_transactions(transactions: list[dict]) -> list[dict]:
    normalized: list[dict] = []

    for transaction in transactions:
        # Excel provider işlemleri zaten ortak formata dönüştürüyor.
        if (
            "direction" in transaction
            and "source" in transaction
            and "target" in transaction
        ):
            normalized.append(transaction)
        else:
            normalized.append(
                normalize_demo_transaction(transaction)
            )

    return normalized


def build_wallet_activity(
    transactions: list[dict],
) -> dict[str, dict[str, Any]]:
    normalized_transactions = normalize_transactions(transactions)

    wallets: dict[str, dict[str, Any]] = defaultdict(
        lambda: {
            "incoming_transactions": [],
            "outgoing_transactions": [],
            "wallet_transfers_in": [],
            "wallet_transfers_out": [],
            "incoming_senders": set(),
            "outgoing_targets": set(),
            "devices": set(),
            "total_incoming": 0.0,
            "total_outgoing": 0.0,
        }
    )

    for transaction in normalized_transactions:
        direction = transaction.get("direction")
        source = transaction.get("source")
        target = transaction.get("target")
        amount = float(transaction.get("amount", 0))
        device_id = transaction.get("device_id")

        if direction == "incoming" and target:
            wallets[target]["incoming_transactions"].append(transaction)
            wallets[target]["total_incoming"] += amount

            if source:
                wallets[target]["incoming_senders"].add(source)

            if device_id:
                wallets[target]["devices"].add(device_id)

        elif direction == "outgoing" and source:
            wallets[source]["outgoing_transactions"].append(transaction)
            wallets[source]["total_outgoing"] += amount

            if target:
                wallets[source]["outgoing_targets"].add(target)

            if device_id:
                wallets[source]["devices"].add(device_id)

        elif direction == "wallet_transfer":
            if source:
                wallets[source]["wallet_transfers_out"].append(transaction)
                wallets[source]["total_outgoing"] += amount

                if target:
                    wallets[source]["outgoing_targets"].add(target)

                if device_id:
                    wallets[source]["devices"].add(device_id)

            if target:
                wallets[target]["wallet_transfers_in"].append(transaction)
                wallets[target]["total_incoming"] += amount

                if source:
                    wallets[target]["incoming_senders"].add(source)

                if device_id:
                    wallets[target]["devices"].add(device_id)

    return wallets


def count_rapid_transfers(
    incoming_transactions: list[dict],
    outgoing_transactions: list[dict],
) -> int:
    incoming_events: list[dict] = []

    for transaction in incoming_transactions:
        timestamp = parse_timestamp(
            transaction.get("timestamp")
        )

        if not timestamp:
            continue

        amount = float(transaction.get("amount", 0))

        if amount <= 0:
            continue

        incoming_events.append(
            {
                "timestamp": timestamp,
                "remaining_amount": amount,
            }
        )

    outgoing_events: list[dict] = []

    for transaction in outgoing_transactions:
        timestamp = parse_timestamp(
            transaction.get("timestamp")
        )

        if not timestamp:
            continue

        amount = float(transaction.get("amount", 0))

        if amount <= 0:
            continue

        outgoing_events.append(
            {
                "timestamp": timestamp,
                "amount": amount,
            }
        )

    incoming_events.sort(
        key=lambda event: event["timestamp"]
    )
    outgoing_events.sort(
        key=lambda event: event["timestamp"]
    )

    rapid_transfer_count = 0

    for outgoing in outgoing_events:
        outgoing_amount = outgoing["amount"]
        window_start = (
            outgoing["timestamp"]
            - RAPID_TRANSFER_WINDOW
        )

        eligible_incoming = [
            incoming
            for incoming in incoming_events
            if (
                window_start
                <= incoming["timestamp"]
                <= outgoing["timestamp"]
                and incoming["remaining_amount"] > 0
            )
        ]

        available_amount = sum(
            incoming["remaining_amount"]
            for incoming in eligible_incoming
        )

        # Yakın zamandaki girişler, çıkış tutarının en az
        # yarısını açıklıyorsa hızlı transfer sinyali sayılır.
        if available_amount < outgoing_amount * 0.5:
            continue

        rapid_transfer_count += 1

        remaining_outgoing = min(
            outgoing_amount,
            available_amount,
        )

        for incoming in eligible_incoming:
            if remaining_outgoing <= 0:
                break

            consumed_amount = min(
                incoming["remaining_amount"],
                remaining_outgoing,
            )

            incoming["remaining_amount"] -= consumed_amount
            remaining_outgoing -= consumed_amount

    return rapid_transfer_count


def analyze_wallet(
    wallet_id: str,
    activity: dict[str, Any],
) -> dict[str, Any]:
    incoming_transactions = (
        activity["incoming_transactions"]
        + activity["wallet_transfers_in"]
    )

    outgoing_transactions = (
        activity["outgoing_transactions"]
        + activity["wallet_transfers_out"]
    )

    unique_senders = len(activity["incoming_senders"])
    unique_targets = len(activity["outgoing_targets"])

    rapid_transfer_count = count_rapid_transfers(
        incoming_transactions,
        outgoing_transactions,
    )

    wallet_transfer_count = (
        len(activity["wallet_transfers_in"])
        + len(activity["wallet_transfers_out"])
    )

    total_incoming = round(
        activity["total_incoming"],
        2,
    )

    total_outgoing = round(
        activity["total_outgoing"],
        2,
    )

    outgoing_transaction_count = len(
        outgoing_transactions
    )

    breakdown = {
        "multiple_senders": score_multiple_senders(
            unique_senders
        ),
        "rapid_transfer": score_rapid_transfers(
            rapid_transfer_count
        ),
        "fan_out": score_fan_out(
            unique_targets
        ),
        "wallet_chain": score_wallet_chain(
            wallet_transfer_count
        ),
        "flow_imbalance": score_flow_imbalance(
            total_incoming,
            total_outgoing,
            outgoing_transaction_count,
        ),
        "new_device": (
            20
            if "NEW_DEVICE" in activity["devices"]
            else 0
        ),
    }

    reasons: list[str] = []

    if breakdown["multiple_senders"] > 0:
        reasons.append(
            f"Funds received from {unique_senders} unique sources"
        )

    if breakdown["rapid_transfer"] > 0:
        reasons.append(
            f"{rapid_transfer_count} amount-matched "
            "rapid transfers detected"
        )

    if breakdown["fan_out"] > 0:
        reasons.append(
            f"Funds distributed to {unique_targets} unique targets"
        )

    if breakdown["wallet_chain"] > 0:
        reasons.append(
            f"{wallet_transfer_count} wallet-to-wallet "
            "transfers detected"
        )

    if breakdown["flow_imbalance"] > 0:
        reasons.append(
            "Outgoing volume is significantly higher "
            "than observed incoming volume"
        )

    if breakdown["new_device"] > 0:
        reasons.append(
            "New device activity detected"
        )

    risk_score = min(
        sum(breakdown.values()),
        100,
    )

    outgoing_ratio = (
        round(total_outgoing / total_incoming, 2)
        if total_incoming > 0
        else None
    )

    return {
        "wallet_id": wallet_id,
        "account_id": wallet_id,
        "risk_score": risk_score,
        "risk_level": get_risk_level(risk_score),
        "risk_breakdown": breakdown,
        "reasons": reasons,
        "metrics": {
            "incoming_transaction_count": len(
                incoming_transactions
            ),
            "outgoing_transaction_count": len(
                outgoing_transactions
            ),
            "unique_senders": unique_senders,
            "unique_targets": unique_targets,
            "rapid_transfer_count": rapid_transfer_count,
            "wallet_transfer_count": wallet_transfer_count,
            "total_incoming": total_incoming,
            "total_outgoing": total_outgoing,
            "outgoing_ratio": outgoing_ratio,
        },
    }


def analyze_all_wallets(
    transactions: list[dict],
) -> list[dict[str, Any]]:
    wallet_activity = build_wallet_activity(
        transactions
    )

    results = [
        analyze_wallet(wallet_id, activity)
        for wallet_id, activity in wallet_activity.items()
    ]

    return sorted(
        results,
        key=lambda wallet: (
            wallet["risk_score"],
            wallet["metrics"]["unique_targets"],
            wallet["metrics"]["rapid_transfer_count"],
        ),
        reverse=True,
    )


def get_wallet_analysis(
    wallet_id: str,
    transactions: list[dict],
) -> dict[str, Any] | None:
    wallet_activity = build_wallet_activity(
        transactions
    )

    activity = wallet_activity.get(wallet_id)

    if not activity:
        return None

    return analyze_wallet(
        wallet_id,
        activity,
    )


def calculate_risk(
    account_id: str,
    transactions: list[dict],
) -> dict[str, Any]:
    result = get_wallet_analysis(
        account_id,
        transactions,
    )

    if result:
        return result

    return {
        "wallet_id": account_id,
        "account_id": account_id,
        "risk_score": 0,
        "risk_level": "safe",
        "risk_breakdown": {
            "multiple_senders": 0,
            "rapid_transfer": 0,
            "fan_out": 0,
            "wallet_chain": 0,
            "flow_imbalance": 0,
            "new_device": 0,
        },
        "reasons": [],
        "metrics": {
            "incoming_transaction_count": 0,
            "outgoing_transaction_count": 0,
            "unique_senders": 0,
            "unique_targets": 0,
            "rapid_transfer_count": 0,
            "wallet_transfer_count": 0,
            "total_incoming": 0,
            "total_outgoing": 0,
            "outgoing_ratio": None,
        },
    }