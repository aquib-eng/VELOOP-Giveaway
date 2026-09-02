import styles from "./GiveawayHero.module.css";

function GiveawayHero() {
  return (
    <section className={styles.hero}>
      <div className="container-veloop">
        <div className={styles.heroContent}>

          <div className={styles.textContent}>
            <span className={styles.badge}>
              🎁 VELOOP REWARDS
            </span>

            <h1>
              Your Chance to Win
              <span> Amazing Rewards</span>
            </h1>

            <p>
              Participate in the latest VELOOP giveaway and get a
              chance to win exciting rewards.
            </p>

            <div className={styles.actions}>
              <a href="#giveaway" className={styles.primaryButton}>
                Explore Giveaway
              </a>

              <a href="#prizes" className={styles.secondaryButton}>
                View Prizes
              </a>
            </div>

            <div className={styles.trust}>
              <span>✓ Secure Participation</span>
              <span>✓ Fair Winner Selection</span>
              <span>✓ Trusted Rewards</span>
            </div>
          </div>

          <div className={styles.visual}>
            <div className={styles.glow}></div>

            <div className={styles.giftCard}>
              <div className={styles.giftIcon}>🎁</div>

              <p>WIN BIG</p>

              <h2>VELOOP</h2>

              <span>REWARDS</span>
            </div>

            <div className={`${styles.floatingCard} ${styles.cardOne}`}>
              🏆
              <span>Lucky Winners</span>
            </div>

            <div className={`${styles.floatingCard} ${styles.cardTwo}`}>
              🎟️
              <span>Easy Entry</span>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

export default GiveawayHero;