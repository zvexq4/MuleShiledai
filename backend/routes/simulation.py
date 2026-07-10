import shutil

from fastapi import APIRouter, HTTPException

from services.data_provider import (
    DEFAULT_TRANSACTIONS_FILE,
    TRANSACTIONS_FILE,
    get_transactions,
)


router = APIRouter()


@router.post("/simulation/reset")
def reset_simulation():
    if not DEFAULT_TRANSACTIONS_FILE.exists():
        raise HTTPException(
            status_code=500,
            detail=(
                "Default transaction dataset not found: "
                f"{DEFAULT_TRANSACTIONS_FILE}"
            ),
        )

    shutil.copyfile(
        DEFAULT_TRANSACTIONS_FILE,
        TRANSACTIONS_FILE,
    )

    transactions = get_transactions()

    return {
        "message": "Simulation reset successfully",
        "total_transactions": len(transactions),
    }