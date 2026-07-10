import json
from pathlib import Path
from typing import Any


BASE_DIR = Path(__file__).resolve().parents[2]
DEMO_DATASET_DIR = BASE_DIR / "datasets" / "demo"

USERS_FILE = DEMO_DATASET_DIR / "sample_users.json"
TRANSACTIONS_FILE = DEMO_DATASET_DIR / "sample_transactions.json"
DEFAULT_TRANSACTIONS_FILE = DEMO_DATASET_DIR / "default_transactions.json"


def load_json(path: Path) -> Any:
    if not path.exists():
        raise FileNotFoundError(f"Dataset file not found: {path}")

    with open(path, "r", encoding="utf-8") as file:
        return json.load(file)


def save_json(path: Path, data: Any) -> None:
    with open(path, "w", encoding="utf-8") as file:
        json.dump(data, file, ensure_ascii=False, indent=2)


def get_users() -> list[dict]:
    data = load_json(USERS_FILE)

    if isinstance(data, dict):
        return data.get("accounts", [])

    return data


def get_transactions() -> list[dict]:
    data = load_json(TRANSACTIONS_FILE)

    if isinstance(data, dict):
        return data.get("transactions", [])

    return data


def save_transactions(transactions: list[dict]) -> None:
    save_json(
        TRANSACTIONS_FILE,
        {"transactions": transactions},
    )


def get_default_transactions() -> list[dict]:
    data = load_json(DEFAULT_TRANSACTIONS_FILE)

    if isinstance(data, dict):
        return data.get("transactions", [])

    return data