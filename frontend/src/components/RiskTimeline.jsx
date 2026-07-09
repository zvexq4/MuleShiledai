function RiskTimeline({ transactions }) {
  if (!transactions || transactions.length === 0) {
    return null;
  }

  return (
    <section className="panel">
      <h2>Risk Timeline</h2>

      <div className="timeline">
        {transactions.map((tx) => (
          <div className="timeline-item" key={tx.transaction_id}>
            <div className="timeline-dot" />

            <div className="timeline-content">
              <strong>
                {tx.type === "incoming" ? "💰 Incoming Transfer" : "💸 Outgoing Transfer"}
              </strong>

              <p>{tx.timestamp}</p>

              <span>
                {tx.type === "incoming" ? "+" : "-"}
                {tx.amount} TRY
              </span>

              <small>
                {tx.sender_id} → {tx.receiver_id}
              </small>

              {tx.device_id === "NEW_DEVICE" && (
                <em>📱 New device detected</em>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default RiskTimeline;