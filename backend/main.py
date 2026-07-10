from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routes.accounts import router as accounts_router
from routes.explain import router as explain_router
from routes.risk import router as risk_router
from routes.transactions import router as transactions_router
from routes.dashboard import router as dashboard_router
from routes.simulation import router as simulation_router
from routes.dataset import router as dataset_router

app = FastAPI(
    title="MuleShield AI",
    description="AI-powered Mule Account Prevention Platform",
    version="1.0.0"
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(risk_router)
app.include_router(accounts_router)
app.include_router(transactions_router)
app.include_router(explain_router)
app.include_router(dashboard_router)
app.include_router(simulation_router)
app.include_router(dataset_router)

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