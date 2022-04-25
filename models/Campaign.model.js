const { Schema, model } = require("mongoose");

const campaignSchema = new Schema({
    name: { type: String },
    description: { type: String },
    imageUrl: { type: String },
    duration: { type: Number },
    deadline: { type: Date },
    goal: {type: Number},
    owner: { type: Schema.Types.ObjectId, ref: "User" },
    pledges: [{ type: Schema.Types.ObjectId, ref: "Pledge" }] // we will update this field a bit later when we create review model
  },
  {
    timestamps: true
  });

const Campaign = model("Campaign", campaignSchema);

module.exports = Campaign;