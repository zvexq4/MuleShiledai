from fastapi import APIRouter, HTTPException

from services.data_provider import get_transactions
from services.risk_engine import calculate_risk


router = APIRouter()


def get_account_transactions(
    account_id: str,
    transactions: list[dict],
) -> list[dict]:
    return [
        transaction
        for transaction in transactions
        if transaction.get("account_id") == account_id
        or transaction.get("sender_id") == account_id
        or transaction.get("receiver_id") == account_id
    ]


def create_explanation(risk: dict) -> str:
    breakdown = risk.get("risk_breakdown", {})

    factors: list[str] = []

    if breakdown.get("multiple_senders", 0) > 0:
        factors.append("multiple incoming senders")

    if breakdown.get("rapid_transfer", 0) > 0:
        factors.append("rapid outgoing transfers")

    if breakdown.get("new_device", 0) > 0:
        factors.append("new device activity")

    risk_score = risk.get("risk_score", 0)
    risk_level = risk.get("risk_level", "safe")

    if not factors:
        return (
            "No significant mule account indicators were detected. "
            "The account currently shows normal transaction behavior."
        )

    factor_text = ", ".join(factors)

    return (
        f"This account has a {risk_level} risk level with a score of "
        f"{risk_score}/100. Detected indicators include {factor_text}. "
        "The account should be prioritized for manual fraud review."
    )


@router.get("/explain/{account_id}")
def explain_account(account_id: str):
    transactions = get_transactions()

    account_transactions = get_account_transactions(
        account_id,
        transactions,
    )

    if not account_transactions:
        raise HTTPException(
            status_code=404,
            detail=f"No transactions found for account {account_id}",
        )

    risk = calculate_risk(account_id, account_transactions)

    return {
        "account_id": account_id,
        "risk_score": risk.get("risk_score", 0),
        "risk_level": risk.get("risk_level", "safe"),
        "explanation": create_explanation(risk),
    }