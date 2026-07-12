# Product and Engineering Roadmap

[← Back to README](../README.md)

## Purpose

This roadmap separates the current hackathon implementation from potential future work. Items below are proposals, not capabilities present in the repository.

## Current Baseline

The repository currently provides:

- Local Excel hackathon dataset ingestion
- Transaction normalization and wallet aggregation
- Six deterministic risk signals
- Isolation Forest anomaly ranking
- Hybrid scoring and Risk Anatomy
- FastAPI endpoints with in-process caching
- React monitoring, accounts, alerts, reports, analytics, and simulator views
- Client-side PDF investigation export
- JSON-based demo transaction persistence

## Guiding Principles

Future development should preserve:

1. **Explainability:** every prioritization result should expose supporting evidence.
2. **Analyst control:** automated scores should assist rather than silently enforce decisions.
3. **Reproducibility:** data, rules, model version, and configuration should be traceable.
4. **Security by default:** access, secrets, and audit trails should be designed before external integrations.
5. **Measured claims:** model performance should be supported by labeled evaluation data.

## Phase 1 — Prototype Hardening

Goal: make the current local application easier to verify and maintain without changing its product scope.

- Add unit tests for every rule threshold and boundary
- Add tests for normalization and rapid-transfer amount matching
- Add tests for hybrid weighting and risk-level thresholds
- Add FastAPI endpoint tests for valid and invalid parameters
- Add frontend component and interaction tests
- Remove unreachable or legacy code after regression verification
- Add formatting and lint checks for Python
- Add CI checks for frontend lint/build and backend tests
- Replace hardcoded frontend API URL with environment configuration
- Restrict CORS through environment-specific settings
- Document supported Python and Node.js versions

Exit criteria:

- Critical scoring paths have automated boundary tests.
- A clean checkout can be installed and verified through documented commands.
- Configuration differs safely between local and deployed environments.

## Phase 2 — Persistent Investigation Workflow

Goal: move from a demonstration dashboard toward an auditable analyst workflow.

- Add a relational database for wallets, normalized transactions, cases, and report metadata
- Persist analyst case status, notes, ownership, and review decisions
- Add authentication and role-based access control
- Add audit logs for login, wallet review, state changes, and report export
- Store immutable model and rule versions with each analysis result
- Replace process-local cache with a managed caching strategy
- Add explicit cache invalidation after relevant data changes
- Separate simulator storage from investigation storage

Exit criteria:

- Every investigation action is attributable and auditable.
- Analysis results survive process restarts.
- Access is restricted according to user role.

## Phase 3 — Model Validation and Monitoring

Goal: establish whether scoring improves prioritization on reviewed or labeled outcomes.

- Define analyst-reviewed labels and data-quality rules
- Evaluate ranking quality using appropriate metrics
- Calibrate deterministic thresholds with fraud-domain review
- Compare hybrid results against rule-only and anomaly-only baselines
- Track false positives and missed reviewed cases
- Version feature definitions, training populations, and model parameters
- Add data drift and score-distribution monitoring
- Add reproducible offline evaluation pipelines
- Assess fairness and unintended proxy behavior where relevant data exists

Exit criteria:

- Model and threshold changes require recorded evaluation results.
- Anomaly scores are monitored for drift.
- Operational users understand score meaning and limitations.

## Phase 4 — Controlled Data Ingestion

Goal: replace manual local-file loading with a governed ingestion boundary.

- Define a versioned transaction input schema
- Add batch ingestion with validation and rejection reporting
- Add idempotency and duplicate handling
- Add secrets management and encrypted transport
- Add retry, dead-letter, and observability patterns
- Add data retention and deletion policies
- Evaluate stream processing only after batch behavior is reliable

This phase does not automatically imply direct bank integration. Any external connection would require separate security, legal, privacy, and operational review.

## Phase 5 — Network Intelligence

Goal: extend wallet-level features with relationship context.

- Build wallet-to-wallet relationship graphs
- Measure fan-in, fan-out, path length, and connected components
- Identify repeated intermediaries and circular movement patterns
- Add time-aware network views for analysts
- Evaluate graph-derived features against existing baselines
- Preserve human-readable evidence for every graph signal

## Phase 6 — Deployment and Operations

Goal: operate a validated version with predictable reliability.

- Package frontend and backend for repeatable deployment
- Add structured logging, metrics, tracing, and health probes
- Define backup and recovery procedures
- Add dependency and container security scanning
- Add rate limiting and request-size controls
- Establish incident response and model rollback procedures
- Define service-level objectives only after workload testing

## Prioritization Matrix

| Work item | User value | Risk reduction | Dependency |
|---|---|---|---|
| Rule and hybrid tests | High | High | None |
| Environment configuration | Medium | High | None |
| Authentication and RBAC | High | High | Persistent users |
| Audit logging | High | High | Identity and database |
| Model evaluation | High | High | Reviewed labels |
| Persistent cases | High | Medium | Database |
| Controlled ingestion | High | High | Schema and security review |
| Graph analysis | Medium | Medium | Reliable normalized history |
| Streaming | Conditional | High complexity | Stable batch ingestion |

## Explicit Non-Claims

Until implemented and validated, the project should not claim:

- Production readiness
- Real-time transaction monitoring
- Live bank integration
- Proven fraud-detection accuracy
- Automated payment blocking
- Regulatory compliance
- Fraud probability estimation

## Contribution Opportunities

Contributors can help by:

- Adding rule-boundary tests
- Improving API schema documentation
- Creating synthetic edge-case fixtures
- Adding accessible frontend test coverage
- Documenting model evaluation methodology
- Improving local installation reproducibility

Any scoring change should include its expected behavior, boundary cases, and an explanation of how it affects Risk Anatomy.
