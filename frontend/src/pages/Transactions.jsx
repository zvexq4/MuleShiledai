function Transactions({
  accounts,
  selectedUser,
  transactions,
  loadAccount,
}) {
  return (
    <main className="transactions-page">
      <section className="panel">
        <h2>Transaction Monitor</h2>
        <p className="empty">Selected account transaction history</p>

        <label>Select Account</label>
        <select
          value={selectedUser?.account_id || ""}
          onChange={(e) => {
            const account = accounts.find((acc) => acc.account_id === e.target.value);
            if (account) loadAccount(account);
          }}
        >
          <option value="">Choose account</option>
          {accounts.map((account) => (
            <option key={account.account_id} value={account.account_id}>
              {account.name} - {account.account_id}
            </option>
          ))}
        </select>

        {selectedUser && (
          <>
            <h3>{selectedUser.name} - {selectedUser.account_id}</h3>

            <div className="transaction-list">
              {transactions.map((tx) => (
                <div className="transaction-item" key={tx.transaction_id}>
                  <div>
                    <strong>{tx.type.toUpperCase()}</strong>
                    <p>{tx.timestamp}</p>
                    <p>{tx.sender_id} → {tx.receiver_id}</p>
                  </div>

                  <span className={tx.type === "incoming" ? "incoming" : "outgoing"}>
                    {tx.type === "incoming" ? "+" : "-"}
                    {tx.amount} TRY
                  </span>
                </div>
              ))}
            </div>
          </>
        )}
      </section>
    </main>
  );
}

export default Transactions;