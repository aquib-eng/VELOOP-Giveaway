const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000/api";

// ==========================================
// GET TOKEN
// ==========================================

const getToken = () => {
  return localStorage.getItem(
    "veloopp_token"
  );
};

// ==========================================
// GET CURRENT GIVEAWAY
// ==========================================

export const getCurrentGiveaway =
  async () => {
    const response = await fetch(
      `${API_URL}/giveaways/current`,
      {
        method: "GET",

        headers: {
          "Content-Type":
            "application/json",
        },

        credentials: "include",
      }
    );

    const data =
      await response.json();

    if (!response.ok) {
      throw new Error(
        data.message ||
          "Failed to load current giveaway."
      );
    }

    return data;
  };

// ==========================================
// GET ALL GIVEAWAYS
// ==========================================

export const getGiveaways =
  async () => {
    const response = await fetch(
      `${API_URL}/giveaways`,
      {
        method: "GET",

        headers: {
          "Content-Type":
            "application/json",
        },

        credentials: "include",
      }
    );

    const data =
      await response.json();

    if (!response.ok) {
      throw new Error(
        data.message ||
          "Failed to load giveaways."
      );
    }

    return data;
  };

// ==========================================
// GET GIVEAWAY BY ID
// ==========================================

export const getGiveawayById =
  async (id) => {
    if (!id) {
      throw new Error(
        "Giveaway ID is required."
      );
    }

    const response = await fetch(
      `${API_URL}/giveaways/${id}`,
      {
        method: "GET",

        headers: {
          "Content-Type":
            "application/json",
        },

        credentials: "include",
      }
    );

    const data =
      await response.json();

    if (!response.ok) {
      throw new Error(
        data.message ||
          "Failed to load giveaway."
      );
    }

    return data;
  };

// ==========================================
// GET PREVIOUS GIVEAWAYS
// ==========================================

export const getPreviousGiveaways =
  async () => {
    const response = await fetch(
      `${API_URL}/giveaways/previous`,
      {
        method: "GET",

        headers: {
          "Content-Type":
            "application/json",
        },

        credentials: "include",
      }
    );

    const data =
      await response.json();

    if (!response.ok) {
      throw new Error(
        data.message ||
          "Failed to load previous giveaways."
      );
    }

    return data;
  };

// ==========================================
// GET ENTRY STATUS
// ==========================================

export const getEntryStatus =
  async (id) => {
    const token = getToken();

    if (!token) {
      throw new Error(
        "Please login first."
      );
    }

    const response = await fetch(
      `${API_URL}/giveaways/${id}/entry-status`,
      {
        method: "GET",

        headers: {
          "Content-Type":
            "application/json",

          Authorization:
            `Bearer ${token}`,
        },

        credentials: "include",
      }
    );

    const data =
      await response.json();

    if (!response.ok) {
      throw new Error(
        data.message ||
          "Failed to check entry status."
      );
    }

    return data;
  };