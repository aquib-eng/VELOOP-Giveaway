// import { useState } from "react";
// import { Link } from "react-router-dom";

// import styles from "./Register.module.css";
// import { useAuth } from "../../../context/AuthContext";

// function Register() {
//   const { register } = useAuth();
//   const [formData, setFormData] = useState({
//     name: "",
//     email: "",
//     password: "",
//     confirmPassword: "",
//   });

//   const [error, setError] = useState("");
// const [loading, setLoading] = useState(false);

//   const handleChange = (event) => {
//     const { name, value } = event.target;

//     setFormData((previous) => ({
//       ...previous,
//       [name]: value,
//     }));

//     setError("");
//   };

// const handleSubmit = async (e) => {
//   e.preventDefault();

//   setError("");
//   setLoading(true);

//   try {
//     const response = await register(
//       formData.name,
//       email,
//       password
//     );

//     console.log("Registration successful:", response);

//     // After successful registration
//     navigate("/login");

//   } catch (error) {
//     console.error("Registration error:", error);

//     const message =
//       error.response?.data?.message ||
//       "Registration failed. Please try again.";

//     setError(message);
//   } finally {
//     setLoading(false);
//   }
// };

//   return (
//     <main className={styles.page}>
//       <div className={styles.container}>

//         {/* Left Side */}

//         <div className={styles.info}>

//           <Link
//             to="/"
//             className={styles.logo}
//           >
//             VELOOP
//           </Link>

//           <div className={styles.infoContent}>
//             <span className={styles.badge}>
//               JOIN VELOOP
//             </span>

//             <h1>
//               Create your
//               <span>Rewards Account</span>
//             </h1>

//             <p>
//               Create your account to explore giveaways,
//               participate in eligible campaigns and
//               discover exciting rewards.
//             </p>

//             <div className={styles.benefits}>

//               <div>
//                 <span>✓</span>
//                 <p>Access eligible giveaways</p>
//               </div>

//               <div>
//                 <span>✓</span>
//                 <p>Track your participation</p>
//               </div>

//               <div>
//                 <span>✓</span>
//                 <p>Receive winner notifications</p>
//               </div>

//             </div>
//           </div>

//         </div>

//         {/* Register Form */}

//         <div className={styles.formWrapper}>

//           <div className={styles.formHeader}>
//             <h2>
//               Create Account
//             </h2>

//             <p>
//               Enter your details to get started.
//             </p>
//           </div>

//           <form
//             className={styles.form}
//             onSubmit={handleSubmit}
//           >

//             {/* Name */}

//             <div className={styles.field}>
//               <label htmlFor="name">
//                 Full Name
//               </label>

//               <input
//                 id="name"
//                 name="name"
//                 type="text"
//                 placeholder="Enter your name"
//                 value={formData.name}
//                 onChange={handleChange}
//                 autoComplete="name"
//               />
//             </div>

//             {/* Email */}

//             <div className={styles.field}>
//               <label htmlFor="email">
//                 Email Address
//               </label>

//               <input
//                 id="email"
//                 name="email"
//                 type="email"
//                 placeholder="Enter your email"
//                 value={formData.email}
//                 onChange={handleChange}
//                 autoComplete="email"
//               />
//             </div>

//             {/* Password */}

//             <div className={styles.field}>
//               <label htmlFor="password">
//                 Password
//               </label>

//               <input
//                 id="password"
//                 name="password"
//                 type="password"
//                 placeholder="Create a password"
//                 value={formData.password}
//                 onChange={handleChange}
//                 autoComplete="new-password"
//               />
//             </div>

//             {/* Confirm Password */}

//             <div className={styles.field}>
//               <label htmlFor="confirmPassword">
//                 Confirm Password
//               </label>

//               <input
//                 id="confirmPassword"
//                 name="confirmPassword"
//                 type="password"
//                 placeholder="Confirm your password"
//                 value={formData.confirmPassword}
//                 onChange={handleChange}
//                 autoComplete="new-password"
//               />
//             </div>

//             {/* Error */}

//             {error && (
//               <div className={styles.error}>
//                 {error}
//               </div>
//             )}

//             {/* Submit */}

//             <button
//               type="submit"
//               className={styles.submitButton}
//             >
//               Create Account
//             </button>

//           </form>

//           <p className={styles.loginText}>
//             Already have an account?

//             <Link to="/login">
//               Login
//             </Link>
//           </p>

//         </div>

//       </div>
//     </main>
//   );
// }

// export default Register;
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";

import styles from "./Register.module.css";

function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: value,
    }));
  };

  // Handle registration
  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await register(
        formData.name,
        formData.email,
        formData.password
      );

      console.log("Registration successful:", response);

      navigate("/login");
    } catch (error) {
      console.error("Registration error:", error);

      const message =
        error.response?.data?.message ||
        "Registration failed. Please try again.";

      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.container}>

        {/* LEFT SIDE */}
        <div className={styles.info}>

          <div className={styles.logo}>
            VELOOP
          </div>

          <div className={styles.infoContent}>

            <span className={styles.badge}>
              JOIN THE REWARDS
            </span>

            <h1>
              Create
              <span>Account!</span>
            </h1>

            <p>
              Create your VELOOP account and start
              participating in exciting giveaways,
              rewards and exclusive opportunities.
            </p>

            <div className={styles.benefits}>

              <div>
                <span>✓</span>
                <p>Participate in exciting giveaways</p>
              </div>

              <div>
                <span>✓</span>
                <p>Track your giveaway participation</p>
              </div>

              <div>
                <span>✓</span>
                <p>Discover exciting rewards</p>
              </div>

            </div>

          </div>

        </div>

        {/* RIGHT SIDE */}
        <div className={styles.formWrapper}>

          <div className={styles.formHeader}>

            <h2>
              Create Account
            </h2>

            <p>
              Enter your details to create your VELOOP account.
            </p>

          </div>

          {/* FORM */}
          <form
            className={styles.form}
            onSubmit={handleSubmit}
          >

            {/* ERROR */}
            {error && (
              <div className={styles.error}>
                {error}
              </div>
            )}

            {/* NAME */}
            <div className={styles.field}>

              <label htmlFor="name">
                Full Name
              </label>

              <input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your name"
                required
              />

            </div>

            {/* EMAIL */}
            <div className={styles.field}>

              <label htmlFor="email">
                Email Address
              </label>

              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                required
              />

            </div>

            {/* PASSWORD */}
            <div className={styles.field}>

              <label htmlFor="password">
                Password
              </label>

              <input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                minLength={8}
                required
              />

            </div>

            {/* SUBMIT */}
            <button
              type="submit"
              className={styles.submitButton}
              disabled={loading}
            >
              {loading
                ? "Creating Account..."
                : "Create Account"}
            </button>

          </form>

          {/* LOGIN */}
          <div className={styles.loginText}>

            <span>
              Already have an account?
            </span>

            <a
              href="/login"
              onClick={(e) => {
                e.preventDefault();
                navigate("/login");
              }}
            >
              Login
            </a>

          </div>

        </div>

      </div>
    </div>
  );
}

export default Register;