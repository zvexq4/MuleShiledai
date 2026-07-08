from fastapi import APIRouter
from services.risk_engine import calculate_risk, load_transactions

router = APIRouter()


@router.get("/explain/{account_id}")
def explain_risk(account_id: str):
    transactions = load_transactions("../datasets/sample_transactions.json")
    risk = calculate_risk(account_id, transactions)

    breakdown = risk["risk_breakdown"]

    if risk["risk_level"] == "critical":
        explanation = (
            "This account shows a high-risk mule account pattern. "
            f"Multiple senders contributed +{breakdown['multiple_senders']} points, "
            f"rapid outgoing transfer behavior contributed +{breakdown['rapid_transfer']} points, "
            f"and new device activity contributed +{breakdown['new_device']} points. "
            "The case should be prioritized for fraud team review."
        )
    elif risk["risk_level"] == "suspicious":
        explanation = (
            "This account shows some unusual behavior. "
            "The activity should be reviewed before it becomes a higher-risk case."
        )
    else:
        explanation = (
            "No critical mule account behavior was detected for this account."
        )

    return {
        "account_id": account_id,
        "risk_score": risk["risk_score"],
        "risk_level": risk["risk_level"],
        "risk_breakdown": risk["risk_breakdown"],
        "reasons": risk["reasons"],
        "explanation": explanation
    }