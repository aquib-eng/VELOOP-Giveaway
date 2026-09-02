import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import Countdown from "../Countdown/Countdown";
import GiveawayStatus from "../GiveawayStatus/GiveawayStatus";

import styles from "./CurrentGiveaway.module.css";

function CurrentGiveaway() {
  const [giveaway, setGiveaway] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ======================================
  // FETCH CURRENT GIVEAWAY
  // ======================================

  useEffect(() => {
    const fetchCurrentGiveaway = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          "http://localhost:5000/api/giveaways/current"
        );

        const data = await response.json();

        console.log(
          "Current Giveaway API Response:",
          data
        );

        if (!response.ok) {
          throw new Error(
            data.message ||
              "Failed to load giveaway."
          );
        }

        // ==================================
        // BACKEND RESPONSE FORMAT
        // {
        //   success: true,
        //   data: {
        //      _id,
        //      title,
        //      description,
        //      prize,
        //      ...
        //   }
        // }
        // ==================================

        setGiveaway(data.data || null);
      } catch (error) {
        console.error(
          "Current giveaway error:",
          error
        );

        setError(
          error.message ||
            "Unable to load giveaway."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchCurrentGiveaway();
  }, []);

  // ======================================
  // LOADING
  // ======================================

  if (loading) {
    return (
      <section
        id="giveaway"
        className={styles.section}
      >
        <div className="container-veloop">
          <div className={styles.heading}>
            <span className={styles.eyebrow}>
              CURRENT GIVEAWAY
            </span>

            <h2>
              Loading Giveaway...
            </h2>

            <p>
              Please wait while we load the
              current giveaway.
            </p>
          </div>
        </div>
      </section>
    );
  }

  // ======================================
  // ERROR
  // ======================================

  if (error) {
    return (
      <section
        id="giveaway"
        className={styles.section}
      >
        <div className="container-veloop">
          <div className={styles.heading}>
            <span className={styles.eyebrow}>
              CURRENT GIVEAWAY
            </span>

            <h2>
              No Current Giveaway
            </h2>

            <p>{error}</p>

            <button
              type="button"
              onClick={() => {
                window.location.reload();
              }}
            >
              Try Again
            </button>
          </div>
        </div>
      </section>
    );
  }

  // ======================================
  // NO GIVEAWAY
  // ======================================

  if (!giveaway) {
    return (
      <section
        id="giveaway"
        className={styles.section}
      >
        <div className="container-veloop">
          <div className={styles.heading}>
            <span className={styles.eyebrow}>
              CURRENT GIVEAWAY
            </span>

            <h2>
              No Current Giveaway
            </h2>

            <p>
              There is currently no active
              giveaway available.
            </p>
          </div>
        </div>
      </section>
    );
  }

  // ======================================
  // GIVEAWAY DATA
  // ======================================

  const giveawayId =
    giveaway._id;

  const prize =
    giveaway.prize || {};

  const prizeName =
    prize.name || "Prize";

  const prizeValue =
    Number(prize.value || 0);

  // ======================================
  // GIVEAWAY UI
  // ======================================

  return (
    <section
      id="giveaway"
      className={styles.section}
    >
      <div className="container-veloop">

        {/* ================================= */}
        {/* HEADING */}
        {/* ================================= */}

        <div className={styles.heading}>
          <span className={styles.eyebrow}>
            CURRENT GIVEAWAY
          </span>

          <h2>
            Win Amazing Rewards
          </h2>

          <p>
            Participate in the current VELOOP
            giveaway and get your chance to win
            exciting prizes.
          </p>
        </div>

        {/* ================================= */}
        {/* GIVEAWAY CARD */}
        {/* ================================= */}

        <div className={styles.card}>

          {/* =============================== */}
          {/* LEFT SIDE */}
          {/* =============================== */}

          <div className={styles.info}>

            {/* Giveaway Status */}

            <GiveawayStatus
              status={giveaway.status}
            />

            {/* Title */}

            <h3>
              {giveaway.title}
            </h3>

            {/* Description */}

            <p
              className={
                styles.description
              }
            >
              {giveaway.description}
            </p>

            {/* ============================= */}
            {/* DETAILS */}
            {/* ============================= */}

            <div className={styles.details}>

              {/* Prize */}

              <div
                className={
                  styles.detail
                }
              >
                <span>
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

              {/* Prize Value */}

              <div
                className={
                  styles.detail
                }
              >
                <span>
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

              {/* Participation */}

              <div
                className={
                  styles.detail
                }
              >
                <span>
                  👥
                </span>

                <div>
                  <small>
                    Participation
                  </small>

                  <strong>
                    {giveaway.maxEntriesPerUser ||
                      1}{" "}
                    Entry
                  </strong>
                </div>
              </div>

            </div>

            {/* ============================= */}
            {/* VIEW GIVEAWAY BUTTON */}
            {/* ============================= */}

            <Link
              to={`/giveaway/${giveawayId}`}
              className={styles.button}
            >
              View Giveaway

              <span>
                →
              </span>
            </Link>

          </div>

          {/* =============================== */}
          {/* RIGHT SIDE */}
          {/* =============================== */}

          <div
            className={
              styles.countdownBox
            }
          >

            <p>
              GIVEAWAY ENDS IN
            </p>

            <Countdown
              endDate={
                giveaway.endDate
              }
            />

            {/* Progress */}

            <div
              className={
                styles.progress
              }
            >
              <div
                className={
                  styles.progressBar
                }
              />
            </div>

            <small>
              Don't miss your chance to
              participate.
            </small>

          </div>

        </div>

      </div>
    </section>
  );
}

export default CurrentGiveaway;