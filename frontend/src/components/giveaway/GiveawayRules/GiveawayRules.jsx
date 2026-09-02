import styles from "./GiveawayRules.module.css";

function GiveawayRules() {
  return (
    <section
      id="rules"
      className={styles.section}
    >
      <div className="container-veloop">

        {/* Heading */}

        <div className={styles.heading}>
          <span className={styles.eyebrow}>
            RULES & ELIGIBILITY
          </span>

          <h2>
            Everything You Need to Know
          </h2>

          <p>
            Please review the participation requirements
            and giveaway rules before joining.
          </p>
        </div>

        {/* Rules Grid */}

        <div className={styles.grid}>

          {/* Eligibility */}

          <div className={styles.card}>
            <div className={styles.icon}>
              ✓
            </div>

            <h3>
              Eligibility
            </h3>

            <ul>
              <li>
                You must have an eligible VELOOP account.
              </li>

              <li>
                You must meet the requirements of the
                specific giveaway.
              </li>

              <li>
                Participation is subject to the giveaway
                terms and conditions.
              </li>
            </ul>
          </div>

          {/* Participation */}

          <div className={styles.card}>
            <div className={styles.icon}>
              🎟️
            </div>

            <h3>
              Participation
            </h3>

            <ul>
              <li>
                Review the giveaway details before joining.
              </li>

              <li>
                Make sure you have sufficient balance for
                the required entry fee.
              </li>

              <li>
                Confirm your participation before submitting
                an entry.
              </li>
            </ul>
          </div>

          {/* Winner Rules */}

          <div className={styles.card}>
            <div className={styles.icon}>
              🏆
            </div>

            <h3>
              Winner Selection
            </h3>

            <ul>
              <li>
                Winners are selected after the giveaway
                closes.
              </li>

              <li>
                Winner selection is handled by the
                platform.
              </li>

              <li>
                Winners are notified through the appropriate
                notification channel.
              </li>
            </ul>
          </div>

        </div>

        {/* Notice */}

        <div className={styles.notice}>
          <span className={styles.noticeIcon}>
            ℹ️
          </span>

          <div>
            <strong>
              Important
            </strong>

            <p>
              Always check the individual giveaway page for
              the latest entry fee, currency, eligibility,
              dates and specific rules before participating.
            </p>
          </div>
        </div>

      </div>
    </section>
  );
}

export default GiveawayRules;