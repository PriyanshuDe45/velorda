const mongoose = require("mongoose");

const rentalConditionSchema = new mongoose.Schema(
  {
    weather: {
      type: [{ type: String, enum: ["Clear", "Fog", "Rain", "Snow"] }],
      default: [],
    },
    weatherEnabled: { type: Boolean, default: false },
    minRating: { type: Number, default: null },
    ratingEnabled: { type: Boolean, default: false },
  },
  { _id: false },
);

const categorySchema = new mongoose.Schema(
  {
    key: { type: String, unique: true },
    name: { type: String, required: true },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    rentCondition: { type: rentalConditionSchema, default: () => ({}) },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Category", categorySchema);