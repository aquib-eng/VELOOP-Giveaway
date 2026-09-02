const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000/api";

// ==========================================
// GET AUTH TOKEN
// ==========================================

const getToken = () => {
  return localStorage.getItem(
    "veloopp_token"
  );
};

// ==========================================
// GET DASHBOARD
// ==========================================

export const getDashboard = async () => {
  const token = getToken();

  const response = await fetch(
    `${API_URL}/dashboard`,
    {
      method: "GET",

      headers: {
        "Content-Type":
          "application/json",

        ...(token
          ? {
              Authorization:
                `Bearer ${token}`,
            }
          : {}),
      },

      credentials: "include",
    }
  );

  const data =
    await response.json();

  if (!response.ok) {
    throw new Error(
      data.message ||
        "Failed to load dashboard."
    );
  }

  return data;
};