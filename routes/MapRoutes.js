import express from "express";
import {
  allAreasController,
  getAreaByIdController,
  createAreaController,
  updateAreaController,
  deleteAreaController,
  findAreasForPointController,
} from "../controllers/MapControllers.js";

const router = express.Router();

// GET all areas
router.get("/areas", allAreasController);

// GET areas containing a point (must come before /:id route to avoid conflict)
router.get("/areas/point", findAreasForPointController);

// GET area by ID
router.get("/areas/:id", getAreaByIdController);

// POST new area
router.post("/areas", createAreaController);

// PUT update area
router.put("/areas/:id", updateAreaController);

// DELETE area (soft delete)
router.delete("/areas/:id", deleteAreaController);

export default router;
