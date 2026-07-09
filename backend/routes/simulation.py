import json
import shutil

from fastapi import APIRouter

router = APIRouter()


@router.post("/simulation/reset")
def reset_simulation():
    shutil.copyfile(
        "../datasets/default_transactions.json",
        "../datasets/sample_transactions.json"
    )

    with open("../datasets/sample_transactions.json", "r", encoding="utf-8") as file:
        transactions = json.load(file)

    return {
        "message": "Simulation reset successfully",
        "total_transactions": len(transactions)
    }