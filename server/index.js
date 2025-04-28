import express from "express";
import mongoose from "mongoose";
import bodyParser from "body-parser";
import morgan from "morgan";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import clientRoutes from "./routes/client.js";
import generalRoutes from "./routes/general.js";
import managementRoutes from "./routes/management.js";
import salesRoutes from "./routes/sales.js";

// Data Imports
import User from "./models/User.js";
import Product from "./models/Product.js";
import ProductStat from "./models/ProductStat.js";
import Transaction from "./models/Transaction.js";
import OverallStat from "./models/OverallStat.js";
import AffilateStat from "./models/AffilateStat.js";
import {
  dataUser,
  dataProduct,
  dataProductStat,
  dataTransaction,
  dataOverallStat,
  dataAffiliateStat,
} from "./data/index.js";

/* CONFIGURATION */
dotenv.config();
const app = express();
app.use(express.json());
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));
app.use(morgan("common"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors());

// Add this with your other routes
app.get("/", (req, res) => {
  res.send(
    "API server is running. Use /client, /general, /management, or /sales routes.",
  );
});

/* ROUTES */
app.use("/client", clientRoutes);
app.use("/general", generalRoutes);
app.use("/management", managementRoutes);
app.use("/sales", salesRoutes);

/* MONGODB SETUP */
const PORT = process.env.PORT || 9000;
dotenv.config();

const dbUrl = process.env.MONGO_URI;

// Configure Mongoose Options
mongoose.set("strictQuery", false);

async function connectToMongoDB() {
  try {
    await mongoose.connect(dbUrl, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log("Connected successfully to local MONGO_DB");
  } catch (error) {
    console.error("Failed to connect to MONGODB:", error);
    process.exit(1);
  }
}

// Handle cleanup on app termination
process.on("SIGINT", async () => {
  try {
    await mongoose.connection.close();
    console.log("MONGODB connection closed");
    process.exit(0);
  } catch (error) {
    console.error("Error while closing MONGODB connection:", error);
    process.exit(1);
  }
});

// Handle connection errors after initial connection
mongoose.connection.on("error", (error) => {
  console.error("MONGODB connection error:", error);
});

mongoose.connection.on("disconnected", () => {
  console.log("MONGODB disconnected");
});

export default {
  connectToMongoDB,
  getConnection: () => mongoose.connection,
};

connectToMongoDB().catch(console.error);

/* ONLY ADD DATA ONE TIME */
async function insertInitialData() {
  try {
    // Check if data already exists before inserting
    const productsCount = await Product.countDocuments();
    if (productsCount === 0) {
      await AffilateStat.insertMany(dataAffiliateStat);
      await OverallStat.insertMany(dataOverallStat);
      await Product.insertMany(dataProduct);
      await ProductStat.insertMany(dataProductStat);
      await Transaction.insertMany(dataTransaction);
      await User.insertMany(dataUser);
      console.log("Initial data inserted successfully");
    } else {
      console.log("Data already exists, skipping insertion");
    }
  } catch (error) {
    console.error("Error inserting initial data:", error);
  }
}

// Start the server
async function startServer() {
  try {
    // First connect to MongoDB
    await connectToMongoDB();

    // Then insert initial data if needed
    await insertInitialData();

    // Finally start the express server
    app.listen(PORT, () => {
      console.log(`Server listening on ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

// Remove the duplicate connection attempt and just call startServer
startServer().catch(console.error);
