import json


def load_transactions(path):
    with open(path, "r", encoding="utf-8") as file:
        return json.load(file)


def get_risk_level(score):
    if score >= 70:
        return "critical"
    if score >= 30:
        return "suspicious"
    return "safe"


def calculate_risk(account_id, transactions):
    score = 0
    reasons = []

    account_transactions = [
        tx for tx in transactions if tx["account_id"] == account_id
    ]

    incoming = [tx for tx in account_transactions if tx["type"] == "incoming"]
    outgoing = [tx for tx in account_transactions if tx["type"] == "outgoing"]

    unique_senders = set(tx["sender_id"] for tx in incoming)

    total_incoming = sum(tx["amount"] for tx in incoming)
    total_outgoing = sum(tx["amount"] for tx in outgoing)

    if len(unique_senders) >= 5:
        score += 30
        reasons.append("Multiple different senders detected")

    if (
        total_incoming > 0
        and len(unique_senders) >= 5
        and total_incoming >= 5000
        and total_outgoing / total_incoming >= 0.8
    ):
        score += 40
        reasons.append(
            "Many different senders and most of the money was transferred out quickly"
        )

    devices = set(tx["device_id"] for tx in account_transactions)

    if "NEW_DEVICE" in devices:
        score += 20
        reasons.append("New device activity detected")

    if score > 100:
        score = 100

    return {
        "account_id": account_id,
        "risk_score": score,
        "risk_level": get_risk_level(score),
        "reasons": reasons
    }


if __name__ == "__main__":
    transactions = load_transactions("../datasets/sample_transactions.json")

    print(calculate_risk("ACC001", transactions))
    print(calculate_risk("ACC_RISKY", transactions))