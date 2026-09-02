import {
  useEffect,
  useState,
} from "react";

import {
  Link,
} from "react-router-dom";

import {
  getCurrentGiveaway,
} from "../../services/giveawayApi";

const Home = () => {
  const [
    giveaway,
    setGiveaway,
  ] = useState(null);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState("");

  // ========================================
  // LOAD CURRENT GIVEAWAY
  // ========================================

  useEffect(() => {
    loadCurrentGiveaway();
  }, []);

  const loadCurrentGiveaway =
    async () => {
      try {
        setLoading(true);

        setError("");

        const response =
          await getCurrentGiveaway();

        /*
          Backend responses can sometimes
          use different property names.

          We support the common formats:
          response.giveaway
          response.data
          response.data.giveaway
        */

        const current =
          response?.giveaway ||
          response?.data?.giveaway ||
          response?.data ||
          null;

        setGiveaway(current);
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

  // ========================================
  // LOADING
  // ========================================

  if (loading) {
    return (
      <main>
        <section>
          <h1>
            VELOOP Giveaway
          </h1>

          <p>
            Loading current giveaway...
          </p>
        </section>
      </main>
    );
  }

  // ========================================
  // ERROR
  // ========================================

  if (error) {
    return (
      <main>
        <section>
          <h1>
            VELOOP Giveaway
          </h1>

          <p>
            {error}
          </p>

          <button
            type="button"
            onClick={
              loadCurrentGiveaway
            }
          >
            Try Again
          </button>
        </section>
      </main>
    );
  }

  // ========================================
  // EMPTY
  // ========================================

  if (!giveaway) {
    return (
      <main>
        <section>
          <h1>
            VELOOP Giveaway
          </h1>

          <h2>
            No Active Giveaway
          </h2>

          <p>
            There is no active giveaway
            available right now.
          </p>

          <Link
            to="/giveaways"
          >
            View Previous Giveaways
          </Link>
        </section>
      </main>
    );
  }

  // ========================================
  // PRIZE
  // ========================================

  const prize =
    giveaway.prize || {};

  const prizeName =
    prize.name ||
    "Prize";

  const prizeImage =
    prize.image || "";

  const prizeValue =
    prize.value ?? 0;

  // ========================================
  // GIVEAWAY ID
  // ========================================

  const giveawayId =
    giveaway._id ||
    giveaway.id;

  // ========================================
  // HOME PAGE
  // ========================================

  return (
    <main>
      {/* ================================== */}
      {/* HERO */}
      {/* ================================== */}

      <section>
        <div>
          <p>
            🎁 VELOOP GIVEAWAY
          </p>

          <h1>
            {giveaway.title}
          </h1>

          <p>
            {giveaway.description}
          </p>

          <Link
            to={`/giveaway/${giveawayId}`}
          >
            View Giveaway
          </Link>
        </div>

        {/* ================================= */}
        {/* PRIZE IMAGE */}
        {/* ================================= */}

        {prizeImage && (
          <div>
            <img
              src={prizeImage}
              alt={prizeName}
            />
          </div>
        )}
      </section>

      {/* ================================== */}
      {/* PRIZE INFORMATION */}
      {/* ================================== */}

      <section>
        <h2>
          Prize
        </h2>

        <h3>
          {prizeName}
        </h3>

        {prizeValue > 0 && (
          <p>
            Prize Value:{" "}
            {prizeValue}
          </p>
        )}

        <p>
          Prize Type:{" "}
          {prize.type ||
            "physical"}
        </p>
      </section>

      {/* ================================== */}
      {/* ENTRY FEE */}
      {/* ================================== */}

      <section>
        <h2>
          Entry Fee
        </h2>

        <p>
          {giveaway.entryFee} VE
        </p>

        <p>
          Entry fee is verified
          by the backend before
          participation.
        </p>
      </section>

      {/* ================================== */}
      {/* GIVEAWAY DATES */}
      {/* ================================== */}

      <section>
        <h2>
          Giveaway Period
        </h2>

        <p>
          Starts:{" "}
          {giveaway.startDate
            ? new Date(
                giveaway.startDate
              ).toLocaleString()
            : "N/A"}
        </p>

        <p>
          Ends:{" "}
          {giveaway.endDate
            ? new Date(
                giveaway.endDate
              ).toLocaleString()
            : "N/A"}
        </p>
      </section>

      {/* ================================== */}
      {/* JOIN */}
      {/* ================================== */}

      <section>
        <h2>
          Ready to Participate?
        </h2>

        <p>
          View the giveaway details
          before joining.
        </p>

        <Link
          to={`/giveaway/${giveawayId}`}
        >
          Join Now
        </Link>
      </section>
    </main>
  );
};

export default Home;