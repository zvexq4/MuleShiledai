function AccountTable({ accounts, loadAccount, getRiskColor }) {
  return (
    <section className="panel">
      <h2>Account Risk List</h2>

      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Account ID</th>
            <th>Risk Score</th>
            <th>Risk Level</th>
            <th>Risk Anatomy</th>
          </tr>
        </thead>

        <tbody>
          {accounts.map((account) => (
            <tr key={account.account_id} onClick={() => loadAccount(account)}>
              <td>{account.name}</td>
              <td>{account.account_id}</td>
              <td style={{ color: getRiskColor(account.risk_level), fontWeight: "bold" }}>
                {account.risk_score}
              </td>
              <td>
                <span
                  className="badge"
                  style={{ backgroundColor: getRiskColor(account.risk_level) }}
                >
                  {account.risk_level.toUpperCase()}
                </span>
              </td>
              <td>
                <div className="anatomy-bar">
                  <div
                    className="anatomy-fill"
                    style={{
                      width: `${account.risk_score}%`,
                      backgroundColor: getRiskColor(account.risk_level),
                    }}
                  />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}

export default AccountTable;