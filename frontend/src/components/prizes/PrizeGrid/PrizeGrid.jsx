import PrizeCard from "../PrizeCard/PrizeCard";
import styles from "./PrizeGrid.module.css";

const prizes = [
  {
    id: 1,
    name: "iPhone",
    type: "Physical Prize",
    description: "Premium smartphone reward for a lucky winner.",
    entryFee: 250,
    currency: "VEs",
    image: "📱",
    featured: true,
  },
  {
    id: 2,
    name: "Apple Watch",
    type: "Physical Prize",
    description: "A premium smartwatch for the selected winner.",
    entryFee: 200,
    currency: "VEs",
    image: "⌚",
  },
  {
    id: 3,
    name: "AirPods",
    type: "Physical Prize",
    description: "Wireless earbuds with an exciting reward experience.",
    entryFee: 500,
    currency: "SVEs",
    image: "🎧",
  },
  {
    id: 4,
    name: "₹2,000 Amazon Gift Card",
    type: "Gift Card",
    description: "Redeemable digital gift card reward.",
    entryFee: 500,
    currency: "VEs",
    image: "🎫",
  },
  {
    id: 5,
    name: "₹500 Amazon Gift Card",
    type: "Gift Card",
    description: "A convenient digital reward for the winner.",
    entryFee: 300,
    currency: "VEs",
    image: "🎁",
  },
  {
    id: 6,
    name: "₹20 Voucher",
    type: "Voucher",
    description: "Small-value voucher reward for eligible winners.",
    entryFee: 2000,
    currency: "Tokens",
    image: "💳",
  },
];

function PrizeGrid() {
  return (
    <section id="prizes" className={styles.section}>
      <div className="container-veloop">

        <div className={styles.heading}>
          <span>PRIZES</span>

          <h2>Choose Your Chance to Win</h2>

          <p>
            Explore the rewards available in the VELOOP
            giveaway.
          </p>
        </div>

        <div className={styles.grid}>
          {prizes.map((prize) => (
            <PrizeCard
              key={prize.id}
              prize={prize}
            />
          ))}
        </div>

      </div>
    </section>
  );
}

export default PrizeGrid;