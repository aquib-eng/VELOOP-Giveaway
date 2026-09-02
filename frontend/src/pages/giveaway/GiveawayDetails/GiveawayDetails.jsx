import { useEffect, useState } from "react";

import {
  Link,
  useNavigate,
  useParams,
} from "react-router-dom";

import { useAuth } from "../../../context/AuthContext";
import { getDeviceId } from "../../../utils/deviceId";

import styles from "./GiveawayDetails.module.css";

// ==========================================
// API URL
// ==========================================

const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000/api";

// ==========================================
// IDENTITY / IDEMPOTENCY HELPERS
// ==========================================

const generateIdempotencyKey = () => {
  if (
    typeof crypto !== "undefined" &&
    crypto.randomUUID
  ) {
    return crypto.randomUUID();
  }

  return (
    Date.now().toString(36) +
    "-" +
    Math.random()
      .toString(36)
      .substring(2) +
    "-" +
    Math.random()
      .toString(36)
      .substring(2)
  );
};

// ==========================================
// SAFE JSON RESPONSE HELPER
// ==========================================

const parseResponse = async (response) => {
  const text = await response.text();

  if (!text) {
    return {};
  }

  try {
    return JSON.parse(text);
  } catch {
    throw new Error(
      "Server returned an invalid response."
    );
  }
};

// ==========================================
// GIVEAWAY DETAILS COMPONENT
// ==========================================

function GiveawayDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { token } = useAuth();

  // ========================================
  // GIVEAWAY STATE
  // ========================================

  const [giveaway, setGiveaway] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  // ========================================
  // ENTRY STATE
  // ========================================

  const [entering, setEntering] =
    useState(false);

  const [checkingEntry, setCheckingEntry] =
    useState(false);

  const [hasEntered, setHasEntered] =
    useState(false);

  const [entryMessage, setEntryMessage] =
    useState("");

  // ========================================
  // FETCH GIVEAWAY DETAILS
  // ========================================

  useEffect(() => {
    const fetchGiveaway = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `${API_URL}/giveaways/${id}`,
          {
            method: "GET",
            headers: {
              "Content-Type":
                "application/json",
            },
          }
        );

        const data =
          await parseResponse(response);

        console.log(
          "Giveaway Details API Response:",
          data
        );

        if (!response.ok) {
          throw new Error(
            data.message ||
              "Failed to load giveaway."
          );
        }

        // ====================================
        // IMPORTANT
        // Backend response:
        //
        // {
        //   success: true,
        //   data: {
        //     _id: "...",
        //     title: "...",
        //     description: "...",
        //     prize: {...}
        //   }
        // }
        //
        // Therefore giveaway is data.data
        // ====================================

        const giveawayData =
          data.data || null;

        if (!giveawayData) {
          throw new Error(
            "Giveaway data was not returned by the server."
          );
        }

        setGiveaway(giveawayData);
      } catch (error) {
        console.error(
          "Giveaway details error:",
          error
        );

        setGiveaway(null);

        setError(
          error.message ||
            "Unable to load giveaway."
        );
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchGiveaway();
    } else {
      setLoading(false);
      setError("Invalid giveaway ID.");
    }
  }, [id]);

  // ==========================================
  // CHECK ENTRY STATUS
  // ==========================================

  useEffect(() => {
    const checkEntryStatus = async () => {
      // --------------------------------------
      // User is not logged in
      // --------------------------------------

      if (!token || !id) {
        setHasEntered(false);
        setCheckingEntry(false);
        return;
      }

      try {
        setCheckingEntry(true);

        const response = await fetch(
          `${API_URL}/giveaways/${id}/entry-status`,
          {
            method: "GET",

            headers: {
              Authorization:
                `Bearer ${token}`,

              "Content-Type":
                "application/json",
            },
          }
        );

        const data =
          await parseResponse(response);

        console.log(
          "Entry Status Response:",
          data
        );

        if (!response.ok) {
          throw new Error(
            data.message ||
              "Failed to check entry status."
          );
        }

        setHasEntered(
          data.hasEntered === true
        );
      } catch (error) {
        console.error(
          "Entry status error:",
          error.message
        );

        // Do not break the giveaway page.
        setHasEntered(false);
      } finally {
        setCheckingEntry(false);
      }
    };

    checkEntryStatus();
  }, [id, token]);

  // ==========================================
  // ENTER GIVEAWAY
  // ==========================================

  const handleEnterGiveaway =
    async () => {
      // --------------------------------------
      // Clear previous messages
      // --------------------------------------

      setEntryMessage("");
      setError("");

      // --------------------------------------
      // Check login
      // --------------------------------------

      if (!token) {
        navigate("/login");
        return;
      }

      // --------------------------------------
      // Already entered
      // --------------------------------------

      if (hasEntered) {
        setEntryMessage(
          "You have already entered this giveaway."
        );

        return;
      }

      // --------------------------------------
      // Check giveaway ID
      // --------------------------------------

      if (!id) {
        setError(
          "Invalid giveaway."
        );

        return;
      }

      try {
        setEntering(true);

        // ------------------------------------
        // Get device ID
        // ------------------------------------

        const deviceId =
          getDeviceId();

        // ------------------------------------
        // Generate idempotency key
        // ------------------------------------

        const idempotencyKey =
          generateIdempotencyKey();

        // ------------------------------------
        // Send join request
        // ------------------------------------

        const response = await fetch(
          `${API_URL}/giveaways/${id}/enter`,
          {
            method: "POST",

            headers: {
              Authorization:
                `Bearer ${token}`,

              "Content-Type":
                "application/json",

              "X-Veloop-Device-Id":
                deviceId,

              "Idempotency-Key":
                idempotencyKey,
            },
          }
        );

        const data =
          await parseResponse(response);

        console.log(
          "Enter Giveaway Response:",
          data
        );

        // ====================================
        // SUCCESS
        // ====================================

        if (response.ok) {
          setHasEntered(true);

          setEntryMessage(
            data.message ||
              "You have successfully entered the giveaway!"
          );

          return;
        }

        // ====================================
        // DUPLICATE ENTRY
        // ====================================

        if (response.status === 409) {
          if (
            data.hasEntered === true ||
            data.hasParticipated === true
          ) {
            setHasEntered(true);

            setEntryMessage(
              data.message ||
                "You have already entered this giveaway."
            );

            return;
          }

          // ----------------------------------
          // Same idempotency request
          // ----------------------------------

          if (
            data.replayed === true
          ) {
            setHasEntered(true);

            setEntryMessage(
              data.message ||
                "Your previous request was already processed successfully."
            );

            return;
          }

          setError(
            data.message ||
              "This request has already been processed."
          );

          return;
        }

        // ====================================
        // INSUFFICIENT BALANCE
        // ====================================

        if (
          response.status === 400 &&
          data.insufficientBalance
        ) {
          setError(
            data.message ||
              "Insufficient wallet balance."
          );

          return;
        }

        // ====================================
        // GIVEAWAY ENDED
        // ====================================

        if (
          response.status === 400 &&
          data.code ===
            "GIVEAWAY_ENDED"
        ) {
          setError(
            data.message ||
              "This giveaway has ended."
          );

          return;
        }

        // ====================================
        // GIVEAWAY NOT ACTIVE
        // ====================================

        if (
          response.status === 400 &&
          (
            data.code ===
              "GIVEAWAY_NOT_ACTIVE" ||
            data.code ===
              "GIVEAWAY_NOT_AVAILABLE"
          )
        ) {
          setError(
            data.message ||
              "This giveaway is not currently available."
          );

          return;
        }

        // ====================================
        // FRAUD / BLOCKED
        // ====================================

        if (
          response.status === 403 &&
          data.fraud === true
        ) {
          setError(
            data.message ||
              "Your participation could not be processed because of suspicious activity."
          );

          return;
        }

        // ====================================
        // USER BLOCKED / SUSPENDED
        // ====================================

        if (
          response.status === 403
        ) {
          setError(
            data.message ||
              "You are not allowed to participate in this giveaway."
          );

          return;
        }

        // ====================================
        // AUTHORIZATION ERROR
        // ====================================

        if (
          response.status === 401
        ) {
          setError(
            "Your session has expired. Please login again."
          );

          return;
        }

        // ====================================
        // OTHER API ERROR
        // ====================================

        throw new Error(
          data.message ||
            "Failed to enter giveaway."
        );
      } catch (error) {
        console.error(
          "Enter giveaway error:",
          error
        );

        setError(
          error.message ||
            "Failed to enter giveaway."
        );
      } finally {
        setEntering(false);
      }
    };

  // ==========================================
  // LOADING STATE
  // ==========================================

  if (loading) {
    return (
      <main className={styles.page}>
        <div className={styles.message}>

          <div className={styles.loader}>
            <span></span>
            <span></span>
            <span></span>
          </div>

          <h2>
            Loading Giveaway...
          </h2>

          <p>
            Please wait while we load the
            giveaway details.
          </p>

        </div>
      </main>
    );
  }

  // ==========================================
  // ERROR STATE
  // ==========================================

  if (error && !giveaway) {
    return (
      <main className={styles.page}>
        <div className={styles.message}>

          <h2>
            Giveaway Not Found
          </h2>

          <p>
            {error}
          </p>

          <Link
            to="/"
            className={
              styles.backButton
            }
          >
            ← Back to Home
          </Link>

        </div>
      </main>
    );
  }

  // ==========================================
  // NO GIVEAWAY
  // ==========================================

  if (!giveaway) {
    return (
      <main className={styles.page}>
        <div className={styles.message}>

          <h2>
            Giveaway Not Found
          </h2>

          <p>
            This giveaway is no longer
            available.
          </p>

          <Link
            to="/"
            className={
              styles.backButton
            }
          >
            ← Back to Home
          </Link>

        </div>
      </main>
    );
  }

  // ==========================================
  // FORMAT DATES
  // ==========================================

  const startDate =
    new Date(
      giveaway.startDate
    );

  const endDate =
    new Date(
      giveaway.endDate
    );

  const formattedStartDate =
    startDate.toLocaleDateString(
      "en-IN",
      {
        day: "numeric",
        month: "long",
        year: "numeric",
      }
    );

  const formattedEndDate =
    endDate.toLocaleDateString(
      "en-IN",
      {
        day: "numeric",
        month: "long",
        year: "numeric",
      }
    );

  // ==========================================
  // PRIZE DATA
  // ==========================================

  const prizeName =
    giveaway.prize?.name ||
    "Amazing Prize";

  const prizeValue =
    Number(
      giveaway.prize?.value
    ) || 0;

  const prizeImage =
    giveaway.prize?.image || "";

  // ==========================================
  // ENTRY FEE
  // ==========================================

  const entryFee =
    Number(
      giveaway.entryFee
    ) || 0;

  // ==========================================
  // MAX ENTRIES
  // ==========================================

  const maxEntries =
    giveaway.maxEntriesPerUser ||
    1;

  // ==========================================
  // GIVEAWAY STATUS
  // ==========================================

  const giveawayStatus =
    giveaway.status || "active";

  const isCompleted =
    giveawayStatus ===
    "completed";

  // ==========================================
  // MAIN UI
  // ==========================================

  return (
    <main className={styles.page}>

      <div className="container-veloop">

        {/* ==================================
            BACK BUTTON
        ================================== */}

        <Link
          to="/"
          className={styles.back}
        >
          ← Back to Giveaways
        </Link>

        {/* ==================================
            MAIN CARD
        ================================== */}

        <section className={styles.card}>

          {/* =================================
              PRIZE SECTION
          ================================= */}

          <div
            className={
              styles.prizeSection
            }
          >

            {prizeImage ? (
              <img
                src={prizeImage}
                alt={prizeName}
                className={
                  styles.prizeImage
                }
              />
            ) : (
              <div
                className={
                  styles.prizePlaceholder
                }
                aria-label="Giveaway prize"
              >
                🎁
              </div>
            )}

          </div>

          {/* =================================
              INFORMATION SECTION
          ================================= */}

          <div
            className={styles.info}
          >

            {/* STATUS */}

            <span
              className={
                styles.status
              }
            >
              {giveawayStatus}
            </span>

            {/* TITLE */}

            <h1>
              {giveaway.title}
            </h1>

            {/* DESCRIPTION */}

            <p
              className={
                styles.description
              }
            >
              {giveaway.description}
            </p>

            {/* =================================
                DETAILS
            ================================= */}

            <div
              className={
                styles.details
              }
            >

              {/* PRIZE */}

              <div
                className={
                  styles.detail
                }
              >

                <span
                  aria-hidden="true"
                >
                  🎁
                </span>

                <div>

                  <small>
                    Prize
                  </small>

                  <strong>
                    {prizeName}
                  </strong>

                </div>

              </div>

              {/* PRIZE VALUE */}

              <div
                className={
                  styles.detail
                }
              >

                <span
                  aria-hidden="true"
                >
                  💰
                </span>

                <div>

                  <small>
                    Prize Value
                  </small>

                  <strong>
                    ₹
                    {prizeValue.toLocaleString(
                      "en-IN"
                    )}
                  </strong>

                </div>

              </div>

              {/* ENTRY FEE */}

              <div
                className={
                  styles.detail
                }
              >

                <span
                  aria-hidden="true"
                >
                  🎟️
                </span>

                <div>

                  <small>
                    Entry Fee
                  </small>

                  <strong>
                    {entryFee} VE
                  </strong>

                </div>

              </div>

              {/* ENTRIES PER USER */}

              <div
                className={
                  styles.detail
                }
              >

                <span
                  aria-hidden="true"
                >
                  👥
                </span>

                <div>

                  <small>
                    Entries Per User
                  </small>

                  <strong>
                    {maxEntries}
                  </strong>

                </div>

              </div>

            </div>

            {/* =================================
                DATES
            ================================= */}

            <div
              className={
                styles.dates
              }
            >

              <div>

                <small>
                  Starts
                </small>

                <strong>
                  {formattedStartDate}
                </strong>

              </div>

              <div>

                <small>
                  Ends
                </small>

                <strong>
                  {formattedEndDate}
                </strong>

              </div>

            </div>

            {/* =================================
                COMPLETED MESSAGE
            ================================= */}

            {isCompleted && (
              <div
                className={
                  styles.success
                }
                role="status"
              >
                ✓ This giveaway has ended.
              </div>
            )}

            {/* =================================
                ENTRY SUCCESS MESSAGE
            ================================= */}

            {entryMessage && (
              <div
                className={
                  styles.success
                }
                role="status"
              >
                ✓ {entryMessage}
              </div>
            )}

            {/* =================================
                ERROR MESSAGE
            ================================= */}

            {error && giveaway && (
              <div
                className={
                  styles.error
                }
                role="alert"
              >
                {error}
              </div>
            )}

            {/* =================================
                ENTER BUTTON
            ================================= */}

            {isCompleted ? (

              <button
                type="button"
                disabled
                className={
                  styles.enteredButton
                }
              >
                Giveaway Ended
              </button>

            ) : hasEntered ? (

              <button
                type="button"
                disabled
                className={
                  styles.enteredButton
                }
                aria-label="Already entered this giveaway"
              >
                ✓ Already Entered
              </button>

            ) : (

              <button
                type="button"
                onClick={
                  handleEnterGiveaway
                }
                disabled={
                  entering ||
                  checkingEntry
                }
                className={
                  styles.enterButton
                }
              >

                {checkingEntry
                  ? "Checking..."
                  : entering
                  ? "Entering..."
                  : "Enter Giveaway →"}

              </button>

            )}

            {/* =================================
                LOGIN INFORMATION
            ================================= */}

            {!token &&
              !hasEntered &&
              !isCompleted && (
                <p
                  className={
                    styles.loginHint
                  }
                >
                  You need to login before
                  entering this giveaway.
                </p>
              )}

            {/* =================================
                ENTRY FEE INFORMATION
            ================================= */}

            <p
              className={
                styles.loginHint
              }
            >
              Entry fee:{" "}
              <strong>
                {entryFee} VE
              </strong>
            </p>

          </div>

        </section>

      </div>

    </main>
  );
}

export default GiveawayDetails;