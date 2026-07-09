function Simulator({
  accounts,
  simAccount,
  setSimAccount,
  simAmount,
  setSimAmount,
  simSender,
  setSimSender,
  simDevice,
  setSimDevice,
  addSimulationTransaction,
  resetSimulation,
}) {
  return (
    <main className="simulator-page">
      <section className="panel simulator-panel">
        <h2>🧪 Demo Simulator</h2>
        <p className="empty">
          Create a demo transaction and see how MuleShield recalculates risk.
        </p>

        <label>Target Account</label>
        <select value={simAccount} onChange={(e) => setSimAccount(e.target.value)}>
          {accounts.map((account) => (
            <option key={account.account_id} value={account.account_id}>
              {account.name} - {account.account_id}
            </option>
          ))}
        </select>

        <label>Amount</label>
        <input
          type="number"
          value={simAmount}
          onChange={(e) => setSimAmount(e.target.value)}
        />

        <label>Sender</label>
        <input value={simSender} onChange={(e) => setSimSender(e.target.value)} />

        <label>Device</label>
        <select value={simDevice} onChange={(e) => setSimDevice(e.target.value)}>
          <option value="DEVICE_1">Known Device</option>
          <option value="NEW_DEVICE">New Device</option>
        </select>

        <button onClick={addSimulationTransaction}>Add Transaction</button>

        <button className="reset-button" onClick={resetSimulation}>
          Reset Demo
        </button>
      </section>

      <section className="panel simulator-guide">
        <h2>How to Use</h2>

        <div className="guide-steps">
          <div>
            <strong>1. Select Account</strong>
            <p>Choose a customer account to simulate suspicious activity.</p>
          </div>

          <div>
            <strong>2. Add Transaction</strong>
            <p>Add an incoming transfer from an unknown sender or new device.</p>
          </div>

          <div>
            <strong>3. Review Report</strong>
            <p>After submission, MuleShield opens the investigation report automatically.</p>
          </div>

          <div>
            <strong>4. Reset Demo</strong>
            <p>Use reset to restore the original dataset before presenting again.</p>
          </div>
        </div>

        <h3>Risk Rules</h3>

        <div className="breakdown">
          <div>
            <span>Multiple Senders</span>
            <strong>+30</strong>
          </div>
          <div>
            <span>Rapid Transfer</span>
            <strong>+40</strong>
          </div>
          <div>
            <span>New Device</span>
            <strong>+20</strong>
          </div>
        </div>
      </section>
    </main>
  );
}

export default Simulator;