const { Schema, model } = require("mongoose");

const campaignSchema = new Schema({
    name: { type: String },
    description: { type: String },
    imageUrl: { type: String },
    duration: { type: Number },
    deadline: { type: String },
    timeLeft: { type: Object },
    rawDeadline: { type: Date },
    goal: {type: Number},
    percent: {type: Number},
    donations: {type: Number},
    owner: { type: Schema.Types.ObjectId, ref: "User" },
    pledges: [{ type: Schema.Types.ObjectId, ref: "Pledge" }],
    currentTotal:  {type: Number, default: 0},
    readableTotal: {type: String}
    // we will update this field a bit later when we create review model
  },
  {
    timestamps: true
  });

const Campaign = model("Campaign", campaignSchema);

module.exports = Campaign;