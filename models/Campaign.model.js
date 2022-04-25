const { Schema, model } = require("mongoose");

const campaignSchema = new Schema({
    name: { type: String },
    description: { type: String },
    imageUrl: { type: String },
    owner: { type: Schema.Types.ObjectId, ref: "User" },
    reviews: [{ type: Schema.Types.ObjectId, ref: "Review" }] // we will update this field a bit later when we create review model
  });

const Campaign = model("Campaign", campaignSchema);

module.exports = Campaign;