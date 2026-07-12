import shutil

from fastapi import APIRouter, HTTPException

from services.data_provider import (
    DEFAULT_TRANSACTIONS_FILE,
    TRANSACTIONS_FILE,
    get_transactions,
    save_transactions,
)
from services.analysis_cache import (
    clear_analysis_cache,
    warm_analysis_cache,
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

    previous_transactions = list(get_transactions())

    try:
        shutil.copyfile(
            DEFAULT_TRANSACTIONS_FILE,
            TRANSACTIONS_FILE,
        )
        clear_analysis_cache()
        warm_analysis_cache()
    except Exception as error:
        try:
            save_transactions(previous_transactions)
            clear_analysis_cache()
            warm_analysis_cache()
        except Exception as rollback_error:
            raise HTTPException(
                status_code=500,
                detail=(
                    "Simulation reset failed and the previous cache "
                    f"could not be restored: {rollback_error}"
                ),
            ) from rollback_error

        raise HTTPException(
            status_code=500,
            detail=(
                "Simulation reset failed. The previous dataset and "
                f"analysis were restored: {error}"
            ),
        ) from error

    transactions = get_transactions()

    return {
        "message": "Simulation reset successfully",
        "total_transactions": len(transactions),
    }
