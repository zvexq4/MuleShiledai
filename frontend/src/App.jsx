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

  const refreshData = async () => {
    const dashboardRes = await axios.get(`${API_URL}/dashboard`);
    const accountsRes = await axios.get(`${API_URL}/accounts`);

    setDashboard(dashboardRes.data);
    setAccounts(accountsRes.data.accounts);

    return accountsRes.data.accounts;
  };

  useEffect(() => {
    const initialize = async () => {
      try {
        await refreshData();
      } finally {
        setTimeout(() => {
          setLoading(false);
        }, 1500);
      }
    };

    initialize();
  }, []);

  const loadAccount = async (account) => {
    const risk = await axios.get(`${API_URL}/risk/${account.account_id}`);
    const explain = await axios.get(`${API_URL}/explain/${account.account_id}`);
    const txs = await axios.get(`${API_URL}/transactions/${account.account_id}`);

    setSelectedUser(account);
    setRiskDetail(risk.data);
    setExplanation(explain.data);
    setTransactions(txs.data.transactions);
  };

  const clearSelectedAccount = () => {
    setSelectedUser(null);
    setRiskDetail(null);
    setExplanation(null);
    setTransactions([]);
  };

  const addSimulationTransaction = async () => {
    await axios.post(`${API_URL}/transactions`, {
      account_id: simAccount,
      amount: Number(simAmount),
      type: "incoming",
      sender_id: simSender,
      receiver_id: simAccount,
      device_id: simDevice,
      location: "Ankara",
    });

    const updatedAccounts = await refreshData();
    const updatedAccount = updatedAccounts.find(
      (acc) => acc.account_id === simAccount
    );

    if (updatedAccount) {
      await loadAccount(updatedAccount);
    }

    setActivePage("report");
    setToast("Transaction added. AI report generated.");

    setTimeout(() => {
      setToast("");
    }, 3000);
  };

  const resetSimulation = async () => {
    await axios.post(`${API_URL}/simulation/reset`);

    const updatedAccounts = await refreshData();

    clearSelectedAccount();

    if (updatedAccounts.length > 0) {
      setSimAccount(updatedAccounts[0].account_id);
    }

    setToast("Demo dataset reset successfully.");

    setTimeout(() => {
      setToast("");
    }, 3000);
  };

  if (loading) {
    return <SplashScreen />;
  }

  return (
    <div className="shell">
      <Toast message={toast} />
      <Sidebar activePage={activePage} setActivePage={setActivePage} />

      <div className="app">
        <Header
          activePage={activePage}
          selectedUser={selectedUser}
          searchValue={searchValue}
          onSearchChange={setSearchValue}
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
          <Analytics dashboard={dashboard} accounts={accounts} />
        )}

        {activePage === "report" && (
          <Report
            accounts={accounts}
            loadAccount={loadAccount}
            clearSelectedAccount={clearSelectedAccount}
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
            addSimulationTransaction={addSimulationTransaction}
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