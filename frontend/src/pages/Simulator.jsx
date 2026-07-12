import {
  AlertTriangle,
  ArrowRight,
  Beaker,
  CheckCircle2,
  RotateCcw,
  ShieldCheck,
  Smartphone,
  UserRound,
  WalletCards,
  Zap,
} from "lucide-react";

function safeNumber(value) {
  const numericValue = Number(value);

  return Number.isFinite(numericValue)
    ? numericValue
    : 0;
}

function getAccountId(account) {
  return (
    account?.account_id ||
    account?.wallet_id ||
    ""
  );
}

function getRiskLevel(account) {
  return (
    account?.hybrid_risk_level ||
    account?.risk_level ||
    "safe"
  );
}

function getRiskScore(account) {
  return safeNumber(
    account?.hybrid_risk_score ??
      account?.risk_score
  );
}

function Simulator({
  accounts = [],
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
  const selectedAccount =
    accounts.find(
      (account) =>
        getAccountId(account) === simAccount
    ) || accounts[0];

  const selectedAccountId =
    getAccountId(selectedAccount);

  const selectedRiskScore =
    getRiskScore(selectedAccount);

  const selectedRiskLevel =
    getRiskLevel(selectedAccount);

  const amountValue =
    safeNumber(simAmount);

  const isUnknownSender =
    Boolean(simSender) &&
    !String(simSender)
      .toUpperCase()
      .includes("KNOWN");

  const isNewDevice =
    simDevice === "NEW_DEVICE";

  const estimatedImpact =
    (isUnknownSender ? 30 : 0) +
    (isNewDevice ? 20 : 0) +
    (amountValue >= 10000 ? 10 : 0);

  const projectedScore = Math.min(
    100,
    selectedRiskScore +
      estimatedImpact
  );

  return (
    <main className="simulator-page simulator-v2">
      <section className="panel simulator-panel">
        <div className="simulator-heading">
          <div className="simulator-heading-icon">
            <Beaker size={21} />
          </div>

          <div>
            <span>DEMO CONTROL CENTER</span>

            <h1>Transaction Simulator</h1>

            <p>
              Create a controlled transaction and
              observe how MuleShield recalculates
              account risk.
            </p>
          </div>
        </div>

        <div className="simulator-account-preview">
          <div>
            <span>SELECTED WALLET</span>

            <strong>
              {selectedAccount?.name ||
                "Hackathon Wallet"}
            </strong>

            <small>
              {selectedAccountId ||
                "No wallet selected"}
            </small>
          </div>

          <div className="simulator-risk-preview">
            <span>
              Current Risk
            </span>

            <strong>
              {selectedRiskScore}/100
            </strong>

            <small>
              {selectedRiskLevel.toUpperCase()}
            </small>
          </div>
        </div>

        <div className="simulator-form">
          <label>
            <span>
              <WalletCards size={15} />
              Target Account
            </span>

            <select
              value={
                simAccount ||
                selectedAccountId
              }
              onChange={(event) =>
                setSimAccount(
                  event.target.value
                )
              }
            >
              {accounts.map((account) => {
                const accountId =
                  getAccountId(account);

                return (
                  <option
                    key={accountId}
                    value={accountId}
                  >
                    {account.name ||
                      "Hackathon Wallet"}{" "}
                    — {accountId}
                  </option>
                );
              })}
            </select>
          </label>

          <div className="simulator-form-grid">
            <label>
              <span>
                <Zap size={15} />
                Amount
              </span>

              <input
                type="number"
                min="0"
                value={simAmount}
                onChange={(event) =>
                  setSimAmount(
                    event.target.value
                  )
                }
              />
            </label>

            <label>
              <span>
                <Smartphone size={15} />
                Device
              </span>

              <select
                value={simDevice}
                onChange={(event) =>
                  setSimDevice(
                    event.target.value
                  )
                }
              >
                <option value="DEVICE_1">
                  Known Device
                </option>

                <option value="NEW_DEVICE">
                  New Device
                </option>
              </select>
            </label>
          </div>

          <label>
            <span>
              <UserRound size={15} />
              Sender
            </span>

            <input
              value={simSender}
              placeholder="Enter sender ID..."
              onChange={(event) =>
                setSimSender(
                  event.target.value
                )
              }
            />
          </label>
        </div>

        <div className="simulator-impact-card">
          <div className="simulator-impact-head">
            <div>
              <span>
                PROJECTED IMPACT
              </span>

              <strong>
                +{estimatedImpact} points
              </strong>
            </div>

            <div>
              <span>
                Estimated Score
              </span>

              <strong>
                {projectedScore}/100
              </strong>
            </div>
          </div>

          <div className="simulator-impact-bar">
            <i
              style={{
                width:
                  `${projectedScore}%`,
              }}
            />
          </div>

          <div className="simulator-impact-flags">
            <span
              className={
                isUnknownSender
                  ? "active"
                  : ""
              }
            >
              Unknown Sender
            </span>

            <span
              className={
                isNewDevice
                  ? "active"
                  : ""
              }
            >
              New Device
            </span>

            <span
              className={
                amountValue >= 10000
                  ? "active"
                  : ""
              }
            >
              High Amount
            </span>
          </div>
        </div>

        <div className="simulator-actions">
          <button
            type="button"
            className="simulator-submit"
            onClick={
              addSimulationTransaction
            }
          >
            <Zap size={16} />
            Add Demo Transaction
            <ArrowRight size={16} />
          </button>

          <button
            type="button"
            className="reset-button"
            onClick={resetSimulation}
          >
            <RotateCcw size={16} />
            Reset Demo Dataset
          </button>
        </div>

        <div className="simulator-warning">
          <AlertTriangle size={16} />

          <p>
            Demo actions modify the temporary
            simulation dataset. Use reset before
            the next presentation scenario.
          </p>
        </div>
      </section>

      <section className="panel simulator-guide">
        <div className="simulator-guide-heading">
          <span>OPERATOR GUIDE</span>

          <h2>How to Use</h2>

          <p>
            Follow the four-step demo flow to
            create and review a simulated fraud
            case.
          </p>
        </div>

        <div className="guide-steps">
          <article>
            <span>01</span>

            <div>
              <strong>
                Select Account
              </strong>

              <p>
                Choose the wallet that will
                receive the simulated
                transaction.
              </p>
            </div>

            <CheckCircle2 size={17} />
          </article>

          <article>
            <span>02</span>

            <div>
              <strong>
                Configure Transaction
              </strong>

              <p>
                Set the amount, sender and device
                scenario.
              </p>
            </div>

            <CheckCircle2 size={17} />
          </article>

          <article>
            <span>03</span>

            <div>
              <strong>
                Run Risk Analysis
              </strong>

              <p>
                Submit the transaction and allow
                MuleShield to recalculate risk.
              </p>
            </div>

            <CheckCircle2 size={17} />
          </article>

          <article>
            <span>04</span>

            <div>
              <strong>
                Review or Reset
              </strong>

              <p>
                Inspect the generated report or
                restore the demo dataset.
              </p>
            </div>

            <CheckCircle2 size={17} />
          </article>
        </div>

        <div className="simulator-rule-section">
          <div className="simulator-rule-heading">
            <div>
              <span>RULE ENGINE</span>
              <h3>Risk Rules</h3>
            </div>

            <ShieldCheck size={20} />
          </div>

          <div className="simulator-rules">
            <article>
              <div className="rule-icon rule-red">
                <UserRound size={16} />
              </div>

              <div>
                <strong>
                  Multiple Senders
                </strong>

                <span>
                  Independent funding sources
                </span>
              </div>

              <b>+30</b>
            </article>

            <article>
              <div className="rule-icon rule-amber">
                <Zap size={16} />
              </div>

              <div>
                <strong>
                  Rapid Transfer
                </strong>

                <span>
                  Funds moved shortly after
                  arrival
                </span>
              </div>

              <b>+40</b>
            </article>

            <article>
              <div className="rule-icon rule-orange">
                <Smartphone size={16} />
              </div>

              <div>
                <strong>
                  New Device
                </strong>

                <span>
                  Unrecognized device activity
                </span>
              </div>

              <b>+20</b>
            </article>
          </div>
        </div>
      </section>
    </main>
  );
}

export default Simulator;