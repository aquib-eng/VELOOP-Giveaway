import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../../../context/AuthContext";

import styles from "./Dashboard.module.css";

const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000/api";

function Dashboard() {
  const navigate = useNavigate();

  const {
    user,
    token,
    logout,
  } = useAuth();

  const [apiMessage, setApiMessage] = useState("");
  const [apiLoading, setApiLoading] = useState(false);
  const [apiError, setApiError] = useState("");

  // =========================
  // LOGOUT
  // =========================

  const handleLogout = () => {
    logout();

    navigate("/login", {
      replace: true,
    });
  };

  // =========================
  // TEST JWT API
  // =========================

  const handleProtectedApi = async () => {
    setApiLoading(true);
    setApiMessage("");
    setApiError("");

    try {
      const response = await fetch(
        `${API_URL}/auth/me`,
        {
          method: "GET",

          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Request failed"
        );
      }

      setApiMessage(
        "JWT authentication is working successfully."
      );

      console.log(
        "Protected API response:",
        data
      );

    } catch (error) {
      console.error(
        "Protected API error:",
        error
      );

      setApiError(
        error.message ||
          "Protected API request failed."
      );

    } finally {
      setApiLoading(false);
    }
  };

  return (
    <main className={styles.page}>

      {/* HEADER */}

      <header className={styles.header}>

        <div className={styles.logo}>
          VELOOP
        </div>

        <button
          className={styles.logoutButton}
          onClick={handleLogout}
        >
          Logout
        </button>

      </header>

      {/* DASHBOARD CONTENT */}

      <section className={styles.container}>

        {/* Welcome */}

        <div className={styles.welcomeCard}>

          <div>

            <p className={styles.eyebrow}>
              DASHBOARD
            </p>

            <h1>
              Welcome,{" "}
              {user?.name || "User"}!
            </h1>

            <p className={styles.subtitle}>
              Manage your VELOOP Rewards account
              and participate in exciting giveaways.
            </p>

          </div>

          <div className={styles.status}>
            <span></span>
            Logged In
          </div>

        </div>

        {/* USER INFORMATION */}

        <div className={styles.grid}>

          <div className={styles.card}>

            <h2>
              Account Information
            </h2>

            <div className={styles.infoRow}>
              <span>
                Name
              </span>

              <strong>
                {user?.name || "N/A"}
              </strong>
            </div>

            <div className={styles.infoRow}>
              <span>
                Email
              </span>

              <strong>
                {user?.email || "N/A"}
              </strong>
            </div>

            <div className={styles.infoRow}>
              <span>
                Account ID
              </span>

              <strong>
                {user?._id || "N/A"}
              </strong>
            </div>

          </div>

          {/* AUTHENTICATION */}

          <div className={styles.card}>

            <h2>
              Authentication
            </h2>

            <div className={styles.authStatus}>

              <span className={styles.check}>
                ✓
              </span>

              <div>

                <strong>
                  JWT Authentication
                </strong>

                <p>
                  Your account is authenticated.
                </p>

              </div>

            </div>

            <button
              className={styles.apiButton}
              onClick={handleProtectedApi}
              disabled={apiLoading}
            >
              {apiLoading
                ? "Checking..."
                : "Test Protected API"}
            </button>

            {apiMessage && (
              <div className={styles.success}>
                {apiMessage}
              </div>
            )}

            {apiError && (
              <div className={styles.error}>
                {apiError}
              </div>
            )}

          </div>

        </div>

        {/* GIVEAWAY SECTION */}

        <div className={styles.giveawayCard}>

          <div>

            <p className={styles.eyebrow}>
              VELOOP REWARDS
            </p>

            <h2>
              Ready to win?
            </h2>

            <p>
              Explore the current giveaway and
              participate for your chance to win.
            </p>

          </div>

          <button
            className={styles.primaryButton}
            onClick={() => navigate("/")}
          >
            Explore Giveaway
          </button>

        </div>

      </section>

    </main>
  );
}

export default Dashboard;