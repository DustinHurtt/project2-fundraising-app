const { Schema, model } = require("mongoose");

const pledgeSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: "User" },
    comment: { type: String, maxlength: 200 },
    amount: { type: Number},

  },
  {
    timestamps: true
  }
  );

const Pledge = model("Pledge", pledgeSchema);

module.exports = Pledge;