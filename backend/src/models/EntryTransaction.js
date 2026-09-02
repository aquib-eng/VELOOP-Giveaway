const mongoose = require("mongoose");

const entryTransactionSchema =
  new mongoose.Schema(
    {
      user: {
        type:
          mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true,
      },

      giveaway: {
        type:
          mongoose.Schema.Types.ObjectId,
        ref: "Giveaway",
        required: true,
        index: true,
      },

      entry: {
        type:
          mongoose.Schema.Types.ObjectId,
        ref: "GiveawayEntry",
        default: null,
        index: true,
      },

      type: {
        type: String,
        enum: ["entry_fee"],
        default: "entry_fee",
        required: true,
      },

      currency: {
        type: String,
        required: true,
        default: "VE",
        uppercase: true,
        trim: true,
      },

      amount: {
        type: Number,
        required: true,
        min: 0,
      },

      balanceBefore: {
        type: Number,
        required: true,
        min: 0,
      },

      balanceAfter: {
        type: Number,
        required: true,
        min: 0,
      },

      status: {
        type: String,
        enum: [
          "pending",
          "completed",
          "failed",
          "reversed",
        ],
        default: "pending",
        required: true,
      },

      /*
       * Unique request identifier.
       */
      requestId: {
        type: String,
        required: true,
        trim: true,
      },

      /*
       * Client-generated idempotency key.
       *
       * Same key + same user + same giveaway
       * must never cause another deduction.
       */
      idempotencyKey: {
        type: String,
        default: null,
        trim: true,
      },
    },
    {
      timestamps: true,
    }
  );


/*
|--------------------------------------------------------------------------
| INDEXES
|--------------------------------------------------------------------------
*/

/*
 * Request ID lookup.
 */
entryTransactionSchema.index({
  requestId: 1,
});


/*
 * True idempotency protection.
 *
 * Sparse means transactions without an
 * idempotency key are allowed.
 */
entryTransactionSchema.index(
  {
    user: 1,
    giveaway: 1,
    idempotencyKey: 1,
  },
  {
    unique: true,
    sparse: true,
  }
);


/*
 * User transaction history.
 */
entryTransactionSchema.index({
  user: 1,
  createdAt: -1,
});


/*
 * Giveaway transaction history.
 */
entryTransactionSchema.index({
  giveaway: 1,
  createdAt: -1,
});


const EntryTransaction =
  mongoose.model(
    "EntryTransaction",
    entryTransactionSchema
  );

module.exports =
  EntryTransaction;