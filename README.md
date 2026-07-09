# 🛡 MuleShield AI

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-7-646CFF?logo=vite&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-0.116-009688?logo=fastapi&logoColor=white)
![Python](https://img.shields.io/badge/Python-3.13-3776AB?logo=python&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green)
![Status](https://img.shields.io/badge/Status-MVP-success)
![Hackathon](https://img.shields.io/badge/Fintech-Hackathon-orange)
![Platform](https://img.shields.io/badge/macOS-Windows-blue)
![UI](https://img.shields.io/badge/UI-React-success)
![Backend](https://img.shields.io/badge/API-FastAPI-green)
![AI](https://img.shields.io/badge/AI-Rule%20Based-red)

# 🛡 MuleShield AI

*This project was created for the Fintech Hackathon by Hamza Çiftçi and Çağıl.*

---
# Description

MuleShield AI is an AI-powered fraud intelligence platform designed to detect potential mule accounts through behavioral transaction analysis.

The system evaluates suspicious financial activity by combining multiple risk indicators such as:

- Multiple incoming senders
- Rapid outgoing transfers
- New device detection
- Behavioral risk scoring

Instead of acting as a payment gateway, MuleShield AI assists fraud analysts by prioritizing suspicious accounts and providing explainable risk reports.

---

# Features

- 📊 Fraud Intelligence Dashboard
- 👥 Customer Monitoring
- 🚨 Active Alerts
- 📄 Investigation Reports
- 📈 Risk Analytics
- 🧪 Transaction Simulator
- 🤖 Explainable AI
- 🔔 Live Notifications

---

# Instructions

## Requirements

- Python 3.11+
- Node.js 20+
- npm

## Installation

Clone the repository:

```bash
git clone https://github.com/USERNAME/muleshield-ai.git
cd muleshield-ai
```
### Macos/Linux

```bash
./start-mac.sh
```
### Windows

```bash
start-windows.bat
```
The application will automatically start:

* FastAPI Backend
* React Frontend
### frontend:

```bash
http://localhost:5173
```
### backend:

```bash
http://localhost:8000
```
## Project Architecture

```bash
React Frontend
        │
        ▼
FastAPI Backend
        │
        ▼
Risk Engine
        │
        ▼
Risk Score
        │
        ▼
Dashboard / Reports / Alerts
```
## Tech Stack
### Frontend
* React
* Vite
* Axios
* Lucide React
### Backend
* FastAPI
* Python
* Uvicorn
### AI
* Rule-Based Risk Engine
* Explainable Risk Analysis

## API Endpoints
| Method | Endpoint |
|----------|--------|
GET 	| /dashboard |
GET 	| /accounts |
GET 	| /risk/{account_id} |
GET 	| /transactions/{account_id} |
GET 	| /explain/{account_id} |
POST 	| /transactions |
POST 	| /simulation/reset |

## Resources

### Documentation
* React Documentation
* FastAPI Documentation
* Vite Documentation
* Lucide React Documentation
### Fraud Detection References
* FATF – Financial Action Task Force
* Europol Financial Crime Reports
### AI Usage

Artificial Intelligence was used during development to:

* Brainstorm the overall project architecture.
* Improve the user interface and user experience.
* Refactor React components into a modular structure.
* Assist with documentation writing.
* Generate and refine sample datasets for demonstration purposes.\
\
All implementation decisions, integration, testing, and final validation were performed by the project team.
## Team
\
Hamza Çiftçi
* Backend Development
* Risk Engine
* System Architecture\

Çağıl Emek Kurtul
* Frontend Development
* UI/UX Design
* Documentation
* Project Management
## Future Improvements
* Machine Learning risk scoring
* PostgreSQL integration
* Bank API integration
* PDF export
* Network graph visualization
* Authentication & Role Management
## License
This project was developed for educational and demonstration purposes as part of the Fintech Hackathon.