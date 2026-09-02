import styles from "./Header.module.css";

function Header() {
  return (
    <header className={styles.header}>
      <div className="container-veloop">
        <div className={styles.navbar}>

          <a href="/" className={styles.logo}>
            VELOOP
            <span>Rewards</span>
          </a>

          <nav className={styles.nav}>
            <a href="#giveaway">Giveaway</a>
            <a href="#prizes">Prizes</a>
            <a href="#winners">Winners</a>
            <a href="#rules">Rules</a>
            <a href="#faq">FAQ</a>
          </nav>

          <button className={styles.loginButton}>
            <a href="/login">Login</a>
      
          </button>

        </div>
      </div>
    </header>
  );
}

export default Header;