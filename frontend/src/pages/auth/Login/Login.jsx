import { useState } from "react";

import { useAuth } from "../../../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";

import styles from "./Login.module.css";

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setError("");
  };

const handleSubmit = async (event) => {
  event.preventDefault();

  setError("");

  if (!formData.email || !formData.password) {
    setError("Please enter your email and password.");
    return;
  }

  try {
    const result = await login(
      formData.email,
      formData.password
    );

    console.log("Login successful:", result);

    setError("");

    // Go to dashboard after successful login
    navigate("/dashboard");

  } catch (error) {
    console.error("Login error:", error);

    const message =
      error.response?.data?.message ||
      "Invalid email or password.";

    setError(message);
  }
};

  return (
    <main className={styles.page}>
      <div className={styles.container}>

        {/* Left Side */}

        <div className={styles.info}>

          <Link
            to="/"
            className={styles.logo}
          >
            VELOOP
          </Link>

          <div className={styles.infoContent}>

            <span className={styles.badge}>
              WELCOME BACK
            </span>

            <h1>
              Welcome
              <span>Back!</span>
            </h1>

            <p>
              Login to your VELOOP account to manage
              your participation, rewards and giveaway
              activity.
            </p>

            <div className={styles.benefits}>

              <div>
                <span>✓</span>
                <p>Access your account securely</p>
              </div>

              <div>
                <span>✓</span>
                <p>Track your giveaway participation</p>
              </div>

              <div>
                <span>✓</span>
                <p>Stay updated about your rewards</p>
              </div>

            </div>

          </div>
        </div>

        {/* Login Form */}

        <div className={styles.formWrapper}>

          <div className={styles.formHeader}>

            <h2>
              Login
            </h2>

            <p>
              Enter your account details to continue.
            </p>

          </div>

          <form
            className={styles.form}
            onSubmit={handleSubmit}
          >

            {/* Email */}

            <div className={styles.field}>

              <label htmlFor="email">
                Email Address
              </label>

              <input
                id="email"
                name="email"
                type="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                autoComplete="email"
              />

            </div>

            {/* Password */}

            <div className={styles.field}>

              <div className={styles.passwordHeader}>

                <label htmlFor="password">
                  Password
                </label>

                <Link to="/forgot-password">
                  Forgot Password?
                </Link>

              </div>

              <input
                id="password"
                name="password"
                type="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                autoComplete="current-password"
              />

            </div>

            {/* Remember Me */}

            <label className={styles.remember}>

              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(event) =>
                  setRememberMe(event.target.checked)
                }
              />

              <span>
                Remember me
              </span>

            </label>

            {/* Error */}

            {error && (
              <div className={styles.error}>
                {error}
              </div>
            )}

            {/* Submit */}

            <button
              type="submit"
              className={styles.submitButton}
            >
              Login
            </button>

          </form>

          <p className={styles.registerText}>

            Don't have an account?

            <Link to="/register">
              Create Account
            </Link>

          </p>

        </div>

      </div>
    </main>
  );
}

export default Login;