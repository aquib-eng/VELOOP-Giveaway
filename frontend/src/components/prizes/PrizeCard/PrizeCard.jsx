import styles from "./PrizeCard.module.css";

function PrizeCard({ prize }) {
  return (
    <article className={styles.card}>
      <div className={styles.imageBox}>
        <span className={styles.emoji}>{prize.image}</span>

        {prize.featured && (
          <span className={styles.featured}>
            Featured
          </span>
        )}
      </div>

      <div className={styles.content}>
        <span className={styles.type}>
          {prize.type}
        </span>

        <h3>{prize.name}</h3>

        <p>{prize.description}</p>

        <div className={styles.footer}>
          <div>
            <small>Entry</small>
            <strong>
              {prize.entryFee} {prize.currency}
            </strong>
          </div>

          <button className={styles.button}>
            View
          </button>
        </div>
      </div>
    </article>
  );
}

export default PrizeCard;