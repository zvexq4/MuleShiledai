from pathlib import Path
from typing import Any

import pandas as pd


BASE_DIR = Path(__file__).resolve().parents[2]
EXCEL_FILE = BASE_DIR / "datasets" / "real" / "hackathon-data-trx.xlsx"


def load_excel_dataframe() -> pd.DataFrame:
    if not EXCEL_FILE.exists():
        raise FileNotFoundError(
            f"Hackathon dataset not found: {EXCEL_FILE}"
        )

    dataframe = pd.read_excel(EXCEL_FILE)

    required_columns = {
        "FromWalletNumber",
        "ToWalletNumber",
        "RecieverIBAN",
        "ReceiverName",
        "SenderIBAN",
        "SenderName",
        "Amount",
        "ProcessGroupType",
        "ProcessSubGroupType",
        "CreatedDate",
    }

    missing_columns = required_columns - set(dataframe.columns)

    if missing_columns:
        raise ValueError(
            "Missing Excel columns: "
            + ", ".join(sorted(missing_columns))
        )

    return dataframe


def clean_value(value: Any) -> str | None:
    if pd.isna(value):
        return None

    text = str(value).strip()

    return text or None


def build_transaction_type(row: pd.Series) -> str:
    group = int(row["ProcessGroupType"])
    subgroup = int(row["ProcessSubGroupType"])

    return f"{group}-{subgroup}"


def normalize_transaction(row: pd.Series, index: int) -> dict:
    transaction_type = build_transaction_type(row)

    source = None
    target = None
    source_name = None
    target_name = None
    source_type = None
    target_type = None
    direction = "unknown"

    if transaction_type in {"2-1", "2-42"}:
        source = clean_value(row["FromWalletNumber"])
        target = clean_value(row["RecieverIBAN"])
        source_type = "wallet"
        target_type = "iban"
        target_name = clean_value(row["ReceiverName"])
        direction = "outgoing"

    elif transaction_type in {"1-4", "1-70"}:
        source = clean_value(row["SenderIBAN"])
        target = clean_value(row["FromWalletNumber"])
        source_name = clean_value(row["SenderName"])
        source_type = "iban"
        target_type = "wallet"
        direction = "incoming"

    elif transaction_type == "2-2":
        source = clean_value(row["FromWalletNumber"])
        target = clean_value(row["ToWalletNumber"])
        source_type = "wallet"
        target_type = "wallet"
        direction = "wallet_transfer"

    created_date = pd.to_datetime(
        row["CreatedDate"],
        dayfirst=True,
        errors="coerce",
    )

    timestamp = None if pd.isna(created_date) else created_date.isoformat()

    return {
        "transaction_id": f"HTX{index + 1:06d}",
        "transaction_type": transaction_type,
        "source": source,
        "target": target,
        "source_name": source_name,
        "target_name": target_name,
        "source_type": source_type,
        "target_type": target_type,
        "direction": direction,
        "amount": float(row["Amount"]),
        "timestamp": timestamp,
    }


def normalize_transactions() -> list[dict]:
    dataframe = load_excel_dataframe()

    return [
        normalize_transaction(row, index)
        for index, row in dataframe.iterrows()
    ]