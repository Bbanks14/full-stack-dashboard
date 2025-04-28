import mongoose from "mongoose";

const AffilateStatSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Types.ObjectId, ref: "User" },
    affilateStats: {
      type: [mongoose.Types.ObjectId],
      ref: "Transaction",
    },
  },
  {
    timestamps: true,
  },
);

const AffilateStat = mongoose.model("ProductStat", AffilateStatSchema);
export default AffilateStat;
