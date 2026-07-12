const SIGNALS = [
  {
    key: "multiple_senders",
    label: "Multiple Senders",
    className: "seg-red",
  },
  {
    key: "rapid_transfer",
    label: "Rapid Transfer",
    className: "seg-amber striped",
  },
  {
    key: "fan_out",
    label: "Fan-Out Activity",
    className: "seg-blue",
  },
  {
    key: "wallet_chain",
    label: "Wallet Chain",
    className: "seg-chain",
  },
  {
    key: "flow_imbalance",
    label: "Flow Imbalance",
    className: "seg-cyan",
  },
  {
    key: "new_device",
    label: "New Device",
    className: "seg-orange striped-fine",
  },
];

function safeNumber(value) {
  const numericValue = Number(value);

  return Number.isFinite(numericValue)
    ? Math.max(0, numericValue)
    : 0;
}

function RiskAnatomyBar({
  breakdown = {},
  showLegend = false,
}) {
  const segments = SIGNALS.map((signal) => ({
    ...signal,
    value: safeNumber(
      breakdown[signal.key]
    ),
  })).filter((signal) => signal.value > 0);

  const ruleTotal = segments.reduce(
    (sum, signal) => sum + signal.value,
    0
  );

  const safeSpace = Math.max(
    0,
    100 - Math.min(100, ruleTotal)
  );

  return (
    <div className="anatomy-wrap">
      <div className="anatomy-track">
        {segments.map((signal) => (
          <div
            key={signal.key}
            className={`anatomy-seg ${signal.className}`}
            style={{
              width: `${signal.value}%`,
            }}
            title={`${signal.label}: ${signal.value} risk points`}
          />
        ))}

        <div
          className="anatomy-seg seg-safe"
          style={{
            width: `${safeSpace}%`,
          }}
        />
      </div>

      {showLegend && (
        <div className="anatomy-legend">
          {SIGNALS.map((signal) => (
            <span key={signal.key}>
              <i
                className={`dot ${signal.className}`}
              />
              {signal.label}
            </span>
          ))}

        </div>
      )}
    </div>
  );
}

export default RiskAnatomyBar;
