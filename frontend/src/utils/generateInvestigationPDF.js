import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

const SIGNAL_LABELS = {
  multiple_senders: "Multiple Senders",
  rapid_transfer: "Rapid Transfer",
  fan_out: "Fan-Out",
  wallet_chain: "Wallet Chain",
  flow_imbalance: "Flow Imbalance",
  new_device: "New Device",
};

function safeText(value, fallback = "—") {
  if (value === null || value === undefined || value === "") {
    return fallback;
  }

  return String(value);
}

function safeNumber(value) {
  const numericValue = Number(value);

  return Number.isFinite(numericValue) ? numericValue : 0;
}

function addWrappedSection(doc, title, text, startY) {
  const pageBottom = 280;
  const lineHeight = 5;
  const lines = doc.splitTextToSize(
    safeText(text, "No information available."),
    170
  );
  let currentY = startY;

  if (currentY + 12 > pageBottom) {
    doc.addPage();
    currentY = 20;
  }

  doc.setFontSize(12);
  doc.text(title, 20, currentY);
  currentY += 8;
  doc.setFontSize(9);

  for (const line of lines) {
    if (currentY + lineHeight > pageBottom) {
      doc.addPage();
      currentY = 20;
    }

    doc.text(line, 20, currentY);
    currentY += lineHeight;
  }

  return currentY + 4;
}

export default function generateInvestigationPDF(
  selectedUser,
  riskDetail,
  explanation,
  transactions = []
) {
  if (!selectedUser || !riskDetail) {
    throw new Error("Wallet risk details are required for PDF export.");
  }

  const doc = new jsPDF();
  const accountId =
    selectedUser.account_id ||
    selectedUser.wallet_id ||
    riskDetail.account_id ||
    riskDetail.wallet_id;
  const hybridScore = safeNumber(
    riskDetail.hybrid_risk_score ?? riskDetail.risk_score
  );
  const hybridLevel = safeText(
    riskDetail.hybrid_risk_level || riskDetail.risk_level,
    "safe"
  ).toUpperCase();
  const ruleScore = safeNumber(
    riskDetail.rule_risk_score ?? riskDetail.risk_score
  );
  const mlScore = safeNumber(riskDetail.ml_anomaly_score);
  const breakdown = riskDetail.risk_breakdown || {};
  const metrics = riskDetail.metrics || {};
  const reasons = Array.isArray(riskDetail.reasons)
    ? riskDetail.reasons
    : [];

  doc.setFontSize(20);
  doc.text("MuleShield AI", 20, 20);

  doc.setFontSize(12);
  doc.text("Financial Crime Investigation Report", 20, 30);
  doc.line(20, 35, 190, 35);

  doc.setFontSize(10);
  doc.text(`Wallet: ${safeText(accountId)}`, 20, 48);
  doc.text(
    `Entity: ${safeText(selectedUser.name, "Hackathon Wallet")}`,
    20,
    56
  );
  doc.text(`City: ${safeText(selectedUser.city)}`, 20, 64);

  autoTable(doc, {
    startY: 74,
    tableWidth: 165,
    head: [["Hybrid Risk", "Risk Level", "Rule Score", "ML Anomaly Percentile", "ML Anomaly"]],
    body: [[
      `${hybridScore}/100`,
      hybridLevel,
      `${ruleScore}/100`,
      `${mlScore.toFixed(2)}/100`,
      riskDetail.is_ml_anomaly ? "Yes" : "No",
    ]],
    styles: {
      fontSize: 7,
      overflow: "linebreak",
    },
    headStyles: { fillColor: [15, 118, 110] },
    columnStyles: {
      0: { cellWidth: 30 },
      1: { cellWidth: 30 },
      2: { cellWidth: 27 },
      3: { cellWidth: 50 },
      4: { cellWidth: 28 },
    },
  });

  autoTable(doc, {
    startY: doc.lastAutoTable.finalY + 10,
    head: [["Rule Risk Anatomy", "Rule Points"]],
    body: Object.entries(SIGNAL_LABELS).map(([key, label]) => [
      label,
      safeNumber(breakdown[key]),
    ]),
    styles: { fontSize: 8 },
    headStyles: { fillColor: [15, 23, 42] },
  });

  autoTable(doc, {
    startY: doc.lastAutoTable.finalY + 10,
    head: [["Metric", "Value"]],
    body: [
      ["Incoming transactions", safeNumber(metrics.incoming_transaction_count)],
      ["Outgoing transactions", safeNumber(metrics.outgoing_transaction_count)],
      ["Unique senders", safeNumber(metrics.unique_senders)],
      ["Unique targets", safeNumber(metrics.unique_targets)],
      ["Rapid transfers", safeNumber(metrics.rapid_transfer_count)],
      ["Wallet transfers", safeNumber(metrics.wallet_transfer_count)],
      ["Total incoming", safeNumber(metrics.total_incoming)],
      ["Total outgoing", safeNumber(metrics.total_outgoing)],
      ["Outgoing ratio", safeText(metrics.outgoing_ratio)],
    ],
    styles: { fontSize: 8 },
    headStyles: { fillColor: [15, 23, 42] },
  });

  let currentY = doc.lastAutoTable.finalY + 12;
  currentY = addWrappedSection(
    doc,
    "Detection Reasons",
    reasons.length > 0
      ? reasons.map((reason, index) => `${index + 1}. ${reason}`).join("\n")
      : "No active rule-based detection reasons.",
    currentY
  );
  currentY = addWrappedSection(
    doc,
    "Analysis Explanation",
    explanation?.explanation,
    currentY
  );

  if (currentY + 20 > 280) {
    doc.addPage();
    currentY = 20;
  }

  autoTable(doc, {
    startY: currentY,
    tableWidth: 183,
    head: [["Date", "Direction", "Amount", "Source", "Target"]],
    body: transactions.map((transaction) => [
      safeText(transaction.timestamp),
      safeText(transaction.direction || transaction.type),
      safeNumber(transaction.amount),
      safeText(transaction.source || transaction.sender_id),
      safeText(transaction.target || transaction.receiver_id),
    ]),
    styles: {
      fontSize: 7,
      overflow: "linebreak",
    },
    headStyles: { fillColor: [15, 118, 110] },
    margin: { left: 10, right: 10 },
    columnStyles: {
      0: { cellWidth: 36 },
      1: { cellWidth: 25 },
      2: { cellWidth: 24 },
      3: { cellWidth: 49 },
      4: { cellWidth: 49 },
    },
  });

  doc.save(`${safeText(accountId, "wallet")}_Investigation.pdf`);
}
