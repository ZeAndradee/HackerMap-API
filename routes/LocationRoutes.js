import express from "express";
import {
  saveUserLocationController,
  updateUserLocationController,
  getUserLocationsController,
  getAllLocationsController,
  getLocationsInAreaController,
} from "../controllers/LocationControllers.js";

const router = express.Router();

// POST - Save user location
router.post("/locations", saveUserLocationController);

// PATCH - Update user location
router.patch("/locations/user/:userId", updateUserLocationController);

// GET - Get user locations
router.get("/locations/user/:userId", getUserLocationsController);

// GET - Get all locations
router.get("/locations", getAllLocationsController);

// GET - Get locations in a specific area
router.get("/locations/area/:areaId", getLocationsInAreaController);

export default router;
