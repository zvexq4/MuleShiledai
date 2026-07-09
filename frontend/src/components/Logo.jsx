function Logo() {
  return (
    <div className="brand-logo">
      <div className="logo-mark">
        <svg viewBox="0 0 64 64" width="34" height="34">
          <path
            d="M32 4L54 13V29C54 43 45 55 32 60C19 55 10 43 10 29V13L32 4Z"
            fill="url(#shieldGradient)"
          />
          <path
            d="M32 13L45 18V30C45 39 40 47 32 51C24 47 19 39 19 30V18L32 13Z"
            fill="#0f172a"
            opacity="0.9"
          />
          <path
            d="M24 32L30 38L42 24"
            stroke="#22c55e"
            strokeWidth="5"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
          <defs>
            <linearGradient id="shieldGradient" x1="10" y1="4" x2="54" y2="60">
              <stop stopColor="#3b82f6" />
              <stop offset="1" stopColor="#22c55e" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      <div>
        <strong>MuleShield</strong>
        <span>Fraud Intelligence</span>
      </div>
    </div>
  );
}

export default Logo;