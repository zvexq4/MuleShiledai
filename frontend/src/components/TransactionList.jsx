function TransactionList({ transactions }) {
  return (
    <div className="transaction-list">
      {transactions.map((tx) => (
        <div className="transaction-item" key={tx.transaction_id}>
          <div>
            <strong>{tx.type.toUpperCase()}</strong>
            <p>{tx.timestamp}</p>
            <p>
              {tx.sender_id} → {tx.receiver_id}
            </p>
          </div>

          <span className={tx.type === "incoming" ? "incoming" : "outgoing"}>
            {tx.type === "incoming" ? "+" : "-"}
            {tx.amount} TRY
          </span>
        </div>
      ))}
    </div>
  );
}

export default TransactionList;