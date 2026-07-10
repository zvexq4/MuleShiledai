function RiskTimeline({ transactions }) {

  if (!transactions || transactions.length === 0) {
    return null;
  }


  // Risk skoruna göre sıralama
  const riskyTransactions = [...transactions]
    .sort((a, b) => {

      const scoreA =
        (a.device_id === "NEW_DEVICE" ? 40 : 0) +
        (a.amount > 10000 ? 30 : 0);

      const scoreB =
        (b.device_id === "NEW_DEVICE" ? 40 : 0) +
        (b.amount > 10000 ? 30 : 0);

      return scoreB - scoreA;

    })
    .slice(0, 3);



  const hiddenCount =
    transactions.length - riskyTransactions.length;



  return (
    <section className="panel high-risk-panel">

      <div className="high-risk-header">

        <h2>
          ⚠ HIGH RISK EVENTS
        </h2>

        <span>
          {transactions.length} total activities
        </span>

      </div>



      <div className="risk-events">

        {riskyTransactions.map((tx) => (

          <div
            className="risk-event"
            key={tx.transaction_id}
          >

            <div className="risk-icon">
              🔴
            </div>


            <div className="risk-info">

              <strong>

                {
                  tx.device_id === "NEW_DEVICE"
                    ? "NEW DEVICE DETECTED"
                    : tx.type === "incoming"
                      ? "HIGH VALUE INCOMING"
                      : "RAPID OUTGOING TRANSFER"
                }

              </strong>


              <p>

                {tx.type === "incoming" ? "+" : "-"}
                {tx.amount} TRY

              </p>


              <small>

                {tx.sender_id}
                {" → "}
                {tx.receiver_id}

              </small>


              {
                tx.device_id === "NEW_DEVICE" && (
                  <em>
                    📱 New device activity detected
                  </em>
                )
              }


            </div>


          </div>

        ))}

      </div>



      {
        hiddenCount > 0 && (

          <div className="more-risk-warning">

            ⚠ +{hiddenCount} more suspicious activities hidden

          </div>

        )
      }


    </section>
  );
}


export default RiskTimeline;