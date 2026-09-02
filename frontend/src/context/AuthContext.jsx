import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";

const AuthContext = createContext(null);

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(
    localStorage.getItem("veloopp_token")
  );
  const [loading, setLoading] = useState(true);

  /*
   * Get currently authenticated user
   */
  const getCurrentUser = async (currentToken) => {
    try {
      const response = await api.get("/auth/me", {
        headers: {
          Authorization: `Bearer ${currentToken}`,
        },
      });

      setUser(response.data.user);
    } catch (error) {
      console.error(
        "Get current user error:",
        error.response?.data?.message || error.message
      );

      localStorage.removeItem("veloopp_token");
      setToken(null);
      setUser(null);
    }
  };

  /*
   * Check login when application starts
   */
  useEffect(() => {
    const initializeAuth = async () => {
      if (token) {
        await getCurrentUser(token);
      }

      setLoading(false);
    };

    initializeAuth();
  }, [token]);

  /*
   * REGISTER
   */
  const register = async (name, email, password) => {
    const response = await api.post("/auth/register", {
      name,
      email,
      password,
    });

    return response.data;
  };

  /*
   * LOGIN
   */
  const login = async (email, password) => {
    const response = await api.post("/auth/login", {
      email,
      password,
    });

    const newToken = response.data.token;
    const loggedInUser = response.data.user;

    localStorage.setItem("veloopp_token", newToken);

    setToken(newToken);
    setUser(loggedInUser);

    return response.data;
  };

  /*
   * LOGOUT
   */
  const logout = () => {
    localStorage.removeItem("veloopp_token");
    setToken(null);
    setUser(null);
  };

  const value = {
    user,
    token,
    loading,
    register,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

/*
 * Custom Hook
 */
export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider"
    );
  }

  return context;
};

export default AuthProvider;