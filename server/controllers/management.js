import mongoose from "mongoose";
import User from "../models/User.js";

export const getAdmins = async (req, res) => {
  try {
    const admins = await User.find({ role: "admin" }).select("-password");
    res.status(200).json(admins);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const getUserPerformance = async (req, res) => {
  try {
    const { id } = req.params;

    const userWithStats = await User.aggregate([
      {
        $match: { _id: new mongoose.Types.ObjectId(id) },
      },
      {
        $lookup: {
          from: "performance",
          localField: "_id",
          foreignField: "userId",
          as: "performance",
        },
      },
      {
        $unwind: "$performance",
      },
    ]);

    // The aggregation returns an array. If a user is found and unwound,
    // the array will contain one element.
    const user = userWithStats[0];

    if (!user) {
      return res
        .status(404)
        .json({ message: "User or performance data not found" });
    }

    res.status(200).json(user);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};
