import { useEffect, useState } from "react";
import styles from "./Countdown.module.css";

function Countdown({ endDate }) {
  const calculateTimeLeft = () => {
    const difference =
      new Date(endDate).getTime() - new Date().getTime();

    if (difference <= 0) {
      return {
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
      };
    }

    return {
      days: Math.floor(
        difference / (1000 * 60 * 60 * 24)
      ),

      hours: Math.floor(
        (difference / (1000 * 60 * 60)) % 24
      ),

      minutes: Math.floor(
        (difference / (1000 * 60)) % 60
      ),

      seconds: Math.floor(
        (difference / 1000) % 60
      ),
    };
  };

  const [timeLeft, setTimeLeft] = useState(
    calculateTimeLeft()
  );

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => {
      clearInterval(timer);
    };
  }, [endDate]);

  const isFinished =
    timeLeft.days === 0 &&
    timeLeft.hours === 0 &&
    timeLeft.minutes === 0 &&
    timeLeft.seconds === 0;

  return (
    <div className={styles.countdown}>
      <TimeBox
        value={timeLeft.days}
        label="Days"
      />

      <TimeBox
        value={timeLeft.hours}
        label="Hours"
      />

      <TimeBox
        value={timeLeft.minutes}
        label="Minutes"
      />

      <TimeBox
        value={timeLeft.seconds}
        label="Seconds"
      />

      {isFinished && (
        <p className={styles.finished}>
          Giveaway has ended
        </p>
      )}
    </div>
  );
}

function TimeBox({ value, label }) {
  return (
    <div className={styles.timeBox}>
      <strong>
        {String(value).padStart(2, "0")}
      </strong>

      <span>{label}</span>
    </div>
  );
}

export default Countdown;