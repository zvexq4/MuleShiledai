from fastapi import FastAPI
from routes.risk import router as risk_router
from routes.accounts import router as accounts_router
from routes.transactions import router as transactions_router
from routes.explain import router as explain_router

app = FastAPI(
    title="MuleShield AI",
    description="AI-powered Mule Account Prevention Platform",
    version="1.0.0"
)

app.include_router(risk_router)
app.include_router(accounts_router)
app.include_router(transactions_router)
app.include_router(explain_router)

@app.get("/")
def home():
    return {
        "message": "Welcome to MuleShield AI",
        "status": "running"
    }


@app.get("/health")
def health():
    return {
        "status": "healthy"
    }