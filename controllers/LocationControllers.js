import {
  saveUserLocation,
  updateUserLocation,
  getUserLocations,
  getAllLocations,
  getLocationsInArea,
} from "../services/Location/LocationServices.js";
import { returnStatus } from "../utils/ReturnStatus.js";

export const saveUserLocationController = async (req, res) => {
  try {
    const { latitude, longitude, accuracy, timestamp, userId, ...otherData } =
      req.body;

    // Validate required fields
    if (!latitude || !longitude) {
      return returnStatus({
        status: 400,
        message: "Missing required fields: latitude and longitude are required",
        res,
      });
    }

    // Check for userId - it might come from authentication token or request body
    const effectiveUserId =
      userId || (req.user && req.user.id) || (req.user && req.user._id);

    if (!effectiveUserId) {
      return returnStatus({
        status: 400,
        message: "User ID is required in the request or through authentication",
        res,
      });
    }

    // Transform data into the expected format
    // IMPORTANT: In GeoJSON, coordinates are [longitude, latitude] (not latitude, longitude)
    const locationData = {
      coordinates: {
        type: "Point",
        coordinates: [longitude, latitude], // GeoJSON expects [longitude, latitude]
      },
      accuracy,
      timestamp,
      userId: effectiveUserId,
      ...otherData,
    };

    const newLocation = await saveUserLocation(locationData);
    return returnStatus({
      status: 201,
      data: newLocation,
      message: "Location saved successfully",
      res,
    });
  } catch (error) {
    console.error("Error in saveUserLocationController:", error);
    if (error.name === "ValidationError") {
      return returnStatus({
        status: 400,
        message: "Invalid location data: " + error.message,
        res,
      });
    }
    return returnStatus({ status: 500, res });
  }
};

export const updateUserLocationController = async (req, res) => {
  try {
    const { userId } = req.params;
    const { latitude, longitude, accuracy, timestamp, ...otherData } = req.body;

    // Validate required fields
    if (!latitude || !longitude) {
      return returnStatus({
        status: 400,
        message: "Missing required fields: latitude and longitude are required",
        res,
      });
    }

    // Transform data into the expected format
    // IMPORTANT: In GeoJSON, coordinates are [longitude, latitude] (not latitude, longitude)
    const locationData = {
      coordinates: {
        type: "Point",
        coordinates: [longitude, latitude], // GeoJSON expects [longitude, latitude]
      },
      accuracy,
      timestamp,
      ...otherData,
    };

    const updatedLocation = await updateUserLocation(userId, locationData);
    return returnStatus({
      status: 200,
      data: updatedLocation,
      message: "Location updated successfully",
      res,
    });
  } catch (error) {
    console.error(
      `Error in updateUserLocationController for user ${req.params.userId}:`,
      error
    );
    if (error.message === "User location not found") {
      return returnStatus({
        status: 404,
        message: "User location not found",
        res,
      });
    }
    if (error.name === "ValidationError") {
      return returnStatus({
        status: 400,
        message: "Invalid location data: " + error.message,
        res,
      });
    }
    return returnStatus({ status: 500, res });
  }
};

export const getUserLocationsController = async (req, res) => {
  try {
    const { userId } = req.params;
    const locations = await getUserLocations(userId);
    return returnStatus({
      status: 200,
      data: locations,
      res,
    });
  } catch (error) {
    console.error(
      `Error in getUserLocationsController for user ${req.params.userId}:`,
      error
    );
    return returnStatus({ status: 500, res });
  }
};

export const getAllLocationsController = async (req, res) => {
  try {
    const locations = await getAllLocations();
    return returnStatus({
      status: 200,
      data: locations,
      res,
    });
  } catch (error) {
    console.error("Error in getAllLocationsController:", error);
    return returnStatus({ status: 500, res });
  }
};

export const getLocationsInAreaController = async (req, res) => {
  try {
    const { areaId } = req.params;
    const locations = await getLocationsInArea(areaId);
    return returnStatus({
      status: 200,
      data: locations,
      res,
    });
  } catch (error) {
    console.error(
      `Error in getLocationsInAreaController for area ${req.params.areaId}:`,
      error
    );
    if (error.message === "Area not found") {
      return returnStatus({
        status: 404,
        message: "Area not found",
        res,
      });
    }
    return returnStatus({ status: 500, res });
  }
};
