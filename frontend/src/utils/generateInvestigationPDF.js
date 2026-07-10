import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function generateInvestigationPDF(
    selectedUser,
    riskDetail,
    explanation,
    transactions
) {

    const doc = new jsPDF();

    doc.setFontSize(20);
    doc.text("MuleShield AI", 20, 20);

    doc.setFontSize(12);
    doc.text("Financial Crime Investigation Report", 20, 30);

    doc.line(20, 35, 190, 35);

    doc.text(`Customer : ${selectedUser.name}`, 20, 50);
    doc.text(`Account : ${selectedUser.account_id}`, 20, 60);
    doc.text(`City : ${selectedUser.city}`, 20, 70);

    doc.text(`Risk Score : ${riskDetail.risk_score}/100`, 20, 90);

    doc.text(
        `Risk Level : ${riskDetail.risk_level.toUpperCase()}`,
        20,
        100
    );

    doc.text("AI Explanation", 20, 120);

    doc.setFontSize(10);

    doc.text(
        explanation.explanation,
        20,
        130,
        {
            maxWidth: 170
        }
    );

    autoTable(doc, {
        startY: 165,
        head: [[
            "Date",
            "Type",
            "Amount",
            "Sender",
            "Receiver"
        ]],
        body: transactions.map(tx => [
            tx.timestamp,
            tx.type,
            tx.amount,
            tx.sender_id,
            tx.receiver_id
        ])
    });

    doc.save(
        `${selectedUser.account_id}_Investigation.pdf`
    );

}