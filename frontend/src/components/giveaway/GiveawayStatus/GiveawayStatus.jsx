import styles from "./GiveawayStatus.module.css";

const STATUS_CONFIG = {
  upcoming: {
    label: "UPCOMING",
    className: styles.upcoming,
  },

  active: {
    label: "LIVE NOW",
    className: styles.active,
  },

  ended: {
    label: "ENDED",
    className: styles.ended,
  },
};

function GiveawayStatus({ status = "upcoming" }) {
  const normalizedStatus = status.toLowerCase();

  const currentStatus =
    STATUS_CONFIG[normalizedStatus] ||
    STATUS_CONFIG.upcoming;

  return (
    <span
      className={`${styles.status} ${currentStatus.className}`}
    >
      <span className={styles.dot}></span>

      {currentStatus.label}
    </span>
  );
}

export default GiveawayStatus;