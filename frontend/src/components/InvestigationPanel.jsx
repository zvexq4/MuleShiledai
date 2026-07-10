import generateInvestigationPDF from "../utils/generateInvestigationPDF";
import { FileDown, ShieldAlert, User, MapPin, CreditCard } from "lucide-react";

function InvestigationPanel({
    selectedUser,
    riskDetail,
    explanation,
    transactions,
    getRiskColor,
}) {
    if (!selectedUser || !riskDetail) return null;

    const latestTransactions = transactions.slice(0, 5);

    return (
        <aside className="investigation-panel">

            <div className="investigation-header">
                <ShieldAlert size={20} />
                <h2>Investigation Case</h2>
            </div>

            <div className="investigation-card">

                <div className="profile-row">
                    <User size={18} />
                    <div>
                        <strong>{selectedUser.name}</strong>
                        <span>{selectedUser.account_id}</span>
                    </div>
                </div>

                <div className="profile-row">
                    <MapPin size={18} />
                    <span>{selectedUser.city}</span>
                </div>

                <div className="profile-row">
                    <CreditCard size={18} />
                    <span>{selectedUser.age} Years Old</span>
                </div>

            </div>

            <div className="investigation-card">

                <h3>Risk Overview</h3>

                <div className="risk-score-big">

                    <span
                        className="risk-circle"
                        style={{
                            borderColor: getRiskColor(riskDetail.risk_level),
                            color: getRiskColor(riskDetail.risk_level),
                        }}
                    >
                        {riskDetail.risk_score}
                    </span>

                    <div>

                        <strong>{riskDetail.risk_level.toUpperCase()}</strong>

                        <p>
                            AI Confidence: High
                        </p>

                    </div>

                </div>

            </div>

            <div className="investigation-card">

                <h3>AI Findings</h3>

                <ul className="finding-list">

                    <li>
                        New Device Activity
                    </li>

                    <li>
                        Rapid Money Transfer
                    </li>

                    <li>
                        Multiple Counterparties
                    </li>

                    <li>
                        High Risk Behaviour
                    </li>

                </ul>

            </div>

            <div className="investigation-card">

                <h3>Latest Transactions</h3>

                {latestTransactions.map((tx) => (

                    <div
                        className="mini-transaction"
                        key={tx.transaction_id}
                    >

                        <div>

                            <strong>

                                {tx.type === "incoming"
                                    ? "Incoming"
                                    : "Outgoing"}

                            </strong>

                            <small>

                                {tx.sender_id}
                                {" → "}
                                {tx.receiver_id}

                            </small>

                        </div>

                        <span>

                            {tx.type === "incoming"
                                ? "+"
                                : "-"}

                            {tx.amount}

                        </span>

                    </div>

                ))}

            </div>

            <button
                className="download-investigation-btn"
                onClick={() =>
                    generateInvestigationPDF(
                        selectedUser,
                        riskDetail,
                        explanation,
                        transactions
                    )
                }
            >

                <FileDown size={18} />

                Download Investigation PDF

            </button>

        </aside>
    );
}

export default InvestigationPanel;