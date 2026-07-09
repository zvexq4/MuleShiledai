import { jsPDF } from "jspdf";

function InvestigationPanel({
    selectedUser,
    riskDetail,
    explanation,
    transactions,
}) {

    if (!selectedUser || !riskDetail) return null;

    const generatePDF = () => {

        const doc = new jsPDF();

        doc.setFontSize(22);
        doc.text("MuleShield AI", 20, 20);

        doc.setFontSize(15);
        doc.text("Financial Crime Investigation Report", 20, 32);

        doc.line(20, 38, 190, 38);

        doc.setFontSize(12);

        doc.text(`Customer : ${selectedUser.name}`, 20, 50);
        doc.text(`Account ID : ${selectedUser.account_id}`, 20, 60);
        doc.text(`City : ${selectedUser.city}`, 20, 70);

        doc.text(
            `Risk Score : ${riskDetail.risk_score}/100`,
            20,
            85
        );

        doc.text(
            `Risk Level : ${riskDetail.risk_level}`,
            20,
            95
        );

        doc.line(20, 105, 190, 105);

        doc.text("AI Explanation", 20, 120);

        doc.setFontSize(10);

        doc.text(
            explanation.summary || "No explanation available.",
            20,
            132,
            { maxWidth: 170 }
        );

        let y = 170;

        doc.setFontSize(12);

        doc.text("Recent Transactions", 20, y);

        y += 12;

        transactions.slice(0, 10).forEach(tx => {

            doc.setFontSize(10);

            doc.text(
                `${tx.type}   ${tx.amount} TRY`,
                20,
                y
            );

            y += 8;

        });

        doc.save(`${selectedUser.account_id}_report.pdf`);

    };

    return (

        <section className="panel">

            <h2>Investigation Case</h2>

            <p><strong>{selectedUser.name}</strong></p>

            <p>{selectedUser.account_id}</p>

            <p>{selectedUser.city}</p>

            <br />

            <p>
                Risk Score:
                <strong> {riskDetail.risk_score}/100</strong>
            </p>

            <button
                className="download-report-btn"
                onClick={generatePDF}
            >
                Download Investigation PDF
            </button>

        </section>

    );

}

export default InvestigationPanel;