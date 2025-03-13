import express from "express";
import {
  checkUserInAreasController,
  testAreaAlertController,
} from "../controllers/GeoAlertControllers.js";

const router = express.Router();

// GET - Check if user is in any areas
router.get("/alerts/areas/user/:userId", checkUserInAreasController);

// POST - Test if a specific location would trigger area alerts for a user
router.post("/alerts/areas/test/:userId", testAreaAlertController);

export default router;
