import Logo from "./Logo";

function SplashScreen() {
  return (
    <div className="splash-screen">
      <Logo />

      <h1>MuleShield AI</h1>
      <p>Initializing Fraud Intelligence Engine...</p>

      <div className="splash-loader">
        <div />
      </div>

      <span>Loading datasets • Connecting API • Preparing dashboard</span>
    </div>
  );
}

export default SplashScreen;