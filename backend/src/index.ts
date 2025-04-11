import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import authRoutes from "./routes/auth";
import notesRoutes from "./routes/notes";

// Load environment variables
dotenv.config();

const app = express();

// Configurar e ativar o CORS - adicione isso antes de outras middlewares
app.use(
  cors({
    origin: "http://localhost:3000", // Substitua pela URL do seu frontend
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI as string)
  .then(() => console.log("Connected to MongoDB successfully"))
  .catch((error) => console.error("MongoDB connection error:", error));

// Middleware
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/notes", notesRoutes);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
