import { useState } from "react";
import styles from "./FAQ.module.css";

const faqs = [
  {
    question: "What is VELOOP Rewards?",
    answer:
      "VELOOP Rewards is a platform where eligible users can participate in giveaways and get a chance to win rewards.",
  },
  {
    question: "How do I participate in a giveaway?",
    answer:
      "Open the giveaway details, review the eligibility and entry requirements, and follow the participation process shown on the giveaway page.",
  },
  {
    question: "What currencies can be used for entry?",
    answer:
      "The applicable entry currency and amount are defined by the specific giveaway. Always check the giveaway details before participating.",
  },
  {
    question: "Can I participate more than once?",
    answer:
      "Participation limits depend on the specific giveaway rules. The platform validates duplicate participation on the server.",
  },
  {
    question: "How are winners selected?",
    answer:
      "Winner selection takes place after the giveaway closes according to the giveaway's configured rules.",
  },
  {
    question: "How will I know if I win?",
    answer:
      "Winners are notified through the notification mechanism provided by the platform.",
  },
];

function FAQ() {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleFAQ = (index) => {
    setOpenIndex(
      openIndex === index ? null : index
    );
  };

  return (
    <section
      id="faq"
      className={styles.section}
    >
      <div className="container-veloop">

        <div className={styles.heading}>
          <span className={styles.eyebrow}>
            FAQ
          </span>

          <h2>
            Frequently Asked Questions
          </h2>

          <p>
            Find answers to common questions about
            VELOOP giveaways.
          </p>
        </div>

        <div className={styles.faqList}>
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;

            return (
              <div
                key={faq.question}
                className={`${styles.item} ${
                  isOpen ? styles.open : ""
                }`}
              >
                <button
                  type="button"
                  className={styles.question}
                  onClick={() => toggleFAQ(index)}
                  aria-expanded={isOpen}
                >
                  <span>{faq.question}</span>

                  <span className={styles.icon}>
                    {isOpen ? "−" : "+"}
                  </span>
                </button>

                {isOpen && (
                  <div className={styles.answer}>
                    <p>{faq.answer}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}

export default FAQ;