import json


def load_json(path):
    with open(path, "r", encoding="utf-8") as file:
        return json.load(file)


def get_transactions():
    return load_json("../datasets/sample_transactions.json")


def get_users():
    return load_json("../datasets/sample_users.json")