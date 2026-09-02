import styles from "./Footer.module.css";

function Footer() {
  return (
    <footer className={styles.footer}>
      <div className="container-veloop">

        <div className={styles.main}>

          {/* Brand */}

          <div className={styles.brand}>
            <a
              href="/"
              className={styles.logo}
            >
              VELOOP
            </a>

            <p>
              Rewards made simple. Participate in
              exciting giveaways and discover your
              chance to win.
            </p>
          </div>

          {/* Quick Links */}

          <div className={styles.column}>
            <h3>Explore</h3>

            <a href="#giveaway">
              Current Giveaway
            </a>

            <a href="#prizes">
              Prizes
            </a>

            <a href="#winners">
              Winners
            </a>
          </div>

          {/* Support */}

          <div className={styles.column}>
            <h3>Support</h3>

            <a href="#rules">
              Rules
            </a>

            <a href="#faq">
              FAQ
            </a>

            <a href="/contact">
              Contact
            </a>
          </div>

          {/* Account */}

          <div className={styles.column}>
            <h3>Account</h3>

            <a href="/login">
              Login
            </a>

            <a href="/register">
              Create Account
            </a>
          </div>

        </div>

        <div className={styles.bottom}>

          <span>
            © 2026 VELOOP Rewards. All rights reserved.
          </span>

          <div>
            <a href="/privacy">
              Privacy
            </a>

            <a href="/terms">
              Terms
            </a>
          </div>

        </div>

      </div>
    </footer>
  );
}

export default Footer;