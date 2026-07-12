import { useEffect, useState } from "react";
import axios from "axios";

import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";
import Accounts from "./pages/Accounts";
import Alerts from "./pages/Alerts";
import Report from "./pages/Report";
import Simulator from "./pages/Simulator";
import Analytics from "./pages/Analytics";
import Contact from "./pages/Contact";
import SplashScreen from "./components/SplashScreen";
import Toast from "./components/Toast";

const API_URL = "http://127.0.0.1:8000";

function App() {
  const [activePage, setActivePage] = useState("dashboard");
  const [dashboard, setDashboard] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [riskDetail, setRiskDetail] = useState(null);
  const [explanation, setExplanation] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState("");
  const [searchValue, setSearchValue] = useState("");

  const [simAccount, setSimAccount] = useState("ACC001");
  const [simAmount, setSimAmount] = useState(2500);
  const [simSender, setSimSender] = useState("UNKNOWN_USER");
  const [simDevice, setSimDevice] = useState("NEW_DEVICE");

  const getRiskColor = (level) => {
    if (level === "critical") return "#ef4444";
    if (level === "suspicious") return "#f59e0b";
    return "#22c55e";
  };

  const adaptWalletForFrontend = (wallet) => {
    return {
      ...wallet,
      account_id: wallet.account_id || wallet.wallet_id,
      wallet_id: wallet.wallet_id || wallet.account_id,
      name: wallet.name || "Hackathon Wallet",
      city: wallet.city || "",
      age: wallet.age || null,
      risk_breakdown: wallet.risk_breakdown || {},
      metrics: wallet.metrics || {},
      reasons: wallet.reasons || [],
    };
  };

  const refreshData = async () => {
    const response = await axios.get(
      `${API_URL}/dataset/dashboard`
    );

    const summary = response.data.summary || {};
    const walletList = Array.isArray(response.data.wallets)
      ? response.data.wallets.map(adaptWalletForFrontend)
      : [];

    setDashboard({
      total_accounts:
        summary.total_wallets || walletList.length,
      safe_accounts:
        summary.safe_wallets || 0,
      suspicious_accounts:
        summary.suspicious_wallets || 0,
      critical_accounts:
        summary.critical_wallets || 0,
      total_transactions:
        summary.total_transactions || 0,

      total_wallets:
        summary.total_wallets || walletList.length,
      safe_wallets:
        summary.safe_wallets || 0,
      suspicious_wallets:
        summary.suspicious_wallets || 0,
      critical_wallets:
        summary.critical_wallets || 0,
    });

    setAccounts(walletList);

    return walletList;
  };

  useEffect(() => {
    const initialize = async () => {
      try {
        await refreshData();
      } catch (error) {
        console.error(
          "Hackathon dataset could not be loaded:",
          error
        );

        setToast(
          "Hackathon dataset could not be loaded."
        );
      } finally {
          setLoading(false);
        }
    };

    initialize();
  }, []);

  const loadAccount = async (account) => {
  const walletId =
    account.wallet_id || account.account_id;

  if (!walletId) {
    return;
  }

  try {
    const [detailResponse, transactionsResponse] =
      await Promise.all([
        axios.get(
          `${API_URL}/dataset/wallet/${walletId}`
        ),
        axios.get(
          `${API_URL}/dataset/wallet/${walletId}/transactions`
        ),
      ]);

    const walletDetail = adaptWalletForFrontend(
      detailResponse.data
    );

    const walletTransactions =
      transactionsResponse.data.transactions || [];

    const adaptedTransactions =
      walletTransactions.map((transaction) => ({
        ...transaction,

        // Eski component'lerin beklediği alanlar
        type: transaction.direction,
        account_id: walletId,
        sender_id: transaction.source,
        receiver_id: transaction.target,
        transaction_id:
          transaction.transaction_id || "UNKNOWN",
      }));

    setSelectedUser(walletDetail);
    setRiskDetail(walletDetail);

    setExplanation({
      explanation:
        walletDetail.reasons?.length > 0
          ? walletDetail.reasons.join(" ")
          : "No significant risk indicators were detected.",
    });

    setTransactions(adaptedTransactions);
  } catch (error) {
    console.error(
      "Wallet information could not be loaded:",
      error
    );

    setToast(
      "Wallet information could not be loaded."
    );

    setTimeout(() => {
      setToast("");
    }, 3000);
  }
};

  const clearSelectedAccount = () => {
    setSelectedUser(null);
    setRiskDetail(null);
    setExplanation(null);
    setTransactions([]);
  };

  const addSimulationTransaction = async () => {
    try {
      await axios.post(`${API_URL}/transactions`, {
        account_id: simAccount,
        amount: Number(simAmount),
        type: "incoming",
        sender_id: simSender,
        receiver_id: simAccount,
        device_id: simDevice,
        location: "Ankara",
      });

      setToast(
        "Demo transaction added successfully."
      );

      setTimeout(() => {
        setToast("");
      }, 3000);
    } catch (error) {
      console.error(
        "Simulation transaction could not be added:",
        error
      );

      setToast(
        "Simulation transaction could not be added."
      );

      setTimeout(() => {
        setToast("");
      }, 3000);
    }
  };

  const resetSimulation = async () => {
    try {
      await axios.post(`${API_URL}/simulation/reset`);

      setToast(
        "Demo dataset reset successfully."
      );

      setTimeout(() => {
        setToast("");
      }, 3000);
    } catch (error) {
      console.error(
        "Demo dataset could not be reset:",
        error
      );

      setToast(
        "Demo dataset could not be reset."
      );

      setTimeout(() => {
        setToast("");
      }, 3000);
    }
  };

  if (loading) {
    return <SplashScreen />;
  }

  return (
    <div className="shell">
      <Toast message={toast} />

      <Sidebar
        activePage={activePage}
        setActivePage={setActivePage}
      />

      <div className="app">
        <Header
          activePage={activePage}
          selectedUser={selectedUser}
          accounts={accounts}
          loadAccount={loadAccount}
          setActivePage={setActivePage}
        />

        {activePage === "dashboard" && (
          <Dashboard
            dashboard={dashboard}
            accounts={accounts}
            loadAccount={loadAccount}
            getRiskColor={getRiskColor}
            setActivePage={setActivePage}
            searchValue={searchValue}
            selectedUser={selectedUser}
            riskDetail={riskDetail}
            explanation={explanation}
            transactions={transactions}
          />
        )}

        {activePage === "accounts" && (
          <Accounts
            accounts={accounts}
            loadAccount={loadAccount}
            setActivePage={setActivePage}
            getRiskColor={getRiskColor}
          />
        )}

        {activePage === "analytics" && (
          <Analytics
            dashboard={dashboard}
            accounts={accounts}
          />
        )}

        {activePage === "report" && (
          <Report
            accounts={accounts}
            loadAccount={loadAccount}
            clearSelectedAccount={
              clearSelectedAccount
            }
            riskDetail={riskDetail}
            explanation={explanation}
            selectedUser={selectedUser}
            transactions={transactions}
            getRiskColor={getRiskColor}
          />
        )}

        {activePage === "alerts" && (
          <Alerts
            accounts={accounts}
            loadAccount={loadAccount}
            setActivePage={setActivePage}
            getRiskColor={getRiskColor}
          />
        )}

        {activePage === "simulator" && (
          <Simulator
            accounts={accounts}
            simAccount={simAccount}
            setSimAccount={setSimAccount}
            simAmount={simAmount}
            setSimAmount={setSimAmount}
            simSender={simSender}
            setSimSender={setSimSender}
            simDevice={simDevice}
            setSimDevice={setSimDevice}
            addSimulationTransaction={
              addSimulationTransaction
            }
            resetSimulation={resetSimulation}
          />
        )}

        {activePage === "contact" && (
          <Contact />
        )}
      </div>
    </div>
  );
}

export default App;