import express from "express";
import cors from "cors";
import { connectMongoDB } from "./config/mongoConfig.js";
import mapRoutes from "./routes/MapRoutes.js";
import cookieParser from "cookie-parser";
connectMongoDB();
const app = express();

const isProduction = process.env.NODE_ENV === "production";

const allowedOrigins = isProduction
  ? ["https://infocidadao.vercel.app", "http://localhost:5173"]
  : [
      "http://localhost:5174",
      "http://localhost:5173",
      "https://infocidadao.vercel.app",
    ];

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
// Rotas de autenticação

// Outras rotas
app.use("/", mapRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, (err) => {
  if (err) {
    console.error("Failed to start server:", err);
    return;
  }
  console.log(`Server is running on port ${PORT}`);
});
