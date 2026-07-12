import {
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  ArrowDownLeft,
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Clock3,
  Smartphone,
} from "lucide-react";

const TRANSACTIONS_PER_PAGE = 10;

function safeNumber(value) {
  const numericValue = Number(value);

  return Number.isFinite(numericValue)
    ? numericValue
    : 0;
}

function formatCurrency(value) {
  return `${new Intl.NumberFormat("tr-TR", {
    maximumFractionDigits: 2,
  }).format(safeNumber(value))} TRY`;
}

function formatTimestamp(value) {
  if (!value) {
    return "Timestamp unavailable";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return new Intl.DateTimeFormat("tr-TR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function getDirection(transaction) {
  const value = (
    transaction?.direction ||
    transaction?.type ||
    ""
  ).toLowerCase();

  return value === "incoming" || value === "in"
    ? "incoming"
    : "outgoing";
}

function getSource(transaction) {
  return (
    transaction?.source ||
    transaction?.sender_id ||
    transaction?.sender ||
    "Unknown source"
  );
}

function getTarget(transaction) {
  return (
    transaction?.target ||
    transaction?.receiver_id ||
    transaction?.receiver ||
    "Unknown target"
  );
}

function RiskTimeline({
  transactions = [],
}) {
  const [currentPage, setCurrentPage] =
    useState(1);

  const sortedTransactions = useMemo(
    () =>
      [...transactions].sort(
        (
          firstTransaction,
          secondTransaction
        ) => {
          const firstTime = new Date(
            firstTransaction.timestamp || 0
          ).getTime();

          const secondTime = new Date(
            secondTransaction.timestamp || 0
          ).getTime();

          return secondTime - firstTime;
        }
      ),
    [transactions]
  );

  const totalPages = Math.max(
    1,
    Math.ceil(
      sortedTransactions.length /
        TRANSACTIONS_PER_PAGE
    )
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [transactions]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const visibleTransactions = useMemo(() => {
    const startIndex =
      (currentPage - 1) *
      TRANSACTIONS_PER_PAGE;

    return sortedTransactions.slice(
      startIndex,
      startIndex + TRANSACTIONS_PER_PAGE
    );
  }, [
    sortedTransactions,
    currentPage,
  ]);

  const firstVisibleItem =
    sortedTransactions.length === 0
      ? 0
      : (currentPage - 1) *
          TRANSACTIONS_PER_PAGE +
        1;

  const lastVisibleItem = Math.min(
    currentPage * TRANSACTIONS_PER_PAGE,
    sortedTransactions.length
  );

  if (sortedTransactions.length === 0) {
    return (
      <div className="timeline-empty-state">
        <Clock3 size={23} />

        <strong>
          No transaction activity
        </strong>

        <p>
          No transactions were returned for
          this wallet.
        </p>
      </div>
    );
  }

  return (
    <div className="risk-timeline">
      <div className="risk-timeline-head">
        <div>
          <span>TRANSACTION EVIDENCE</span>

          <h3>
            Wallet Activity Timeline
          </h3>
        </div>

        <strong>
          {sortedTransactions.length} activities
        </strong>
      </div>

      <div className="risk-timeline-list">
        {visibleTransactions.map(
          (transaction, index) => {
            const direction =
              getDirection(transaction);

            const isIncoming =
              direction === "incoming";

            const transactionId =
              transaction.transaction_id ||
              transaction.id ||
              `${transaction.timestamp}-${index}`;

            const isNewDevice =
              transaction.device_id ===
              "NEW_DEVICE";

            return (
              <article
                className={`risk-timeline-item ${direction}`}
                key={transactionId}
              >
                <div className="timeline-marker">
                  {isIncoming ? (
                    <ArrowDownLeft size={16} />
                  ) : (
                    <ArrowUpRight size={16} />
                  )}
                </div>

                <div className="timeline-transaction-content">
                  <div className="timeline-transaction-head">
                    <div>
                      <strong>
                        {isIncoming
                          ? "Incoming Transfer"
                          : "Outgoing Transfer"}
                      </strong>

                      <span>
                        {transactionId}
                      </span>
                    </div>

                    <strong className="timeline-amount">
                      {isIncoming ? "+" : "-"}
                      {formatCurrency(
                        transaction.amount
                      )}
                    </strong>
                  </div>

                  <div className="timeline-route">
                    <span>
                      {getSource(transaction)}
                    </span>

                    <i>→</i>

                    <span>
                      {getTarget(transaction)}
                    </span>
                  </div>

                  <div className="timeline-footer">
                    <span>
                      <Clock3 size={13} />

                      {formatTimestamp(
                        transaction.timestamp
                      )}
                    </span>

                    {transaction.transaction_type && (
                      <span>
                        {
                          transaction.transaction_type
                        }
                      </span>
                    )}

                    {isNewDevice && (
                      <span className="timeline-device-flag">
                        <Smartphone size={13} />
                        New device
                      </span>
                    )}
                  </div>
                </div>
              </article>
            );
          }
        )}
      </div>

      <div className="timeline-pagination">
        <div>
          Showing{" "}
          <strong>
            {firstVisibleItem}–
            {lastVisibleItem}
          </strong>{" "}
          of{" "}
          <strong>
            {sortedTransactions.length}
          </strong>{" "}
          activities
        </div>

        <div className="timeline-pagination-controls">
          <button
            type="button"
            disabled={currentPage === 1}
            onClick={() =>
              setCurrentPage((page) =>
                Math.max(1, page - 1)
              )
            }
          >
            <ArrowLeft size={14} />
            Previous
          </button>

          <span>
            Page {currentPage} / {totalPages}
          </span>

          <button
            type="button"
            disabled={
              currentPage === totalPages
            }
            onClick={() =>
              setCurrentPage((page) =>
                Math.min(
                  totalPages,
                  page + 1
                )
              )
            }
          >
            Next
            <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default RiskTimeline;