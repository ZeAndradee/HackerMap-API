import { checkUserInAreas } from "../services/GeoAlert/GeoAlertService.js";
import { returnStatus } from "../utils/ReturnStatus.js";

/**
 * Check if a user is in any monitored areas
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const checkUserInAreasController = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return returnStatus({
        status: 400,
        message: "User ID is required",
        res,
      });
    }

    // Get the user's latest location from the database
    const Location = (await import("../models/Location.js")).default;
    const latestLocation = await Location.findOne(
      { userId },
      {},
      { sort: { timestamp: -1 } }
    );

    if (!latestLocation) {
      return returnStatus({
        status: 404,
        message: "No location found for this user",
        res,
      });
    }

    // Check if the user is in any areas
    const areasUserIsIn = await checkUserInAreas(userId, latestLocation);

    return returnStatus({
      status: 200,
      data: {
        inAreas: areasUserIsIn.length > 0,
        areas: areasUserIsIn,
        userLocation: latestLocation,
      },
      message:
        areasUserIsIn.length > 0
          ? `User is in ${areasUserIsIn.length} area(s)`
          : "User is not in any monitored areas",
      res,
    });
  } catch (error) {
    console.error(
      `Error in checkUserInAreasController for user ${req.params.userId}:`,
      error
    );
    return returnStatus({ status: 500, res });
  }
};

/**
 * Manual endpoint to test area alerts for a specific location
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const testAreaAlertController = async (req, res) => {
  try {
    const { userId } = req.params;
    const { latitude, longitude } = req.body;

    if (!userId || !latitude || !longitude) {
      return returnStatus({
        status: 400,
        message: "User ID, latitude, and longitude are required",
        res,
      });
    }

    // Create a mock location object
    // IMPORTANT: In GeoJSON, coordinates are [longitude, latitude] (not latitude, longitude)
    const mockLocation = {
      userId,
      coordinates: {
        type: "Point",
        coordinates: [longitude, latitude], // GeoJSON expects [longitude, latitude]
      },
    };

    // Check if this location would trigger any area alerts
    const areasUserIsIn = await checkUserInAreas(userId, mockLocation);

    return returnStatus({
      status: 200,
      data: {
        inAreas: areasUserIsIn.length > 0,
        areas: areasUserIsIn,
        testedLocation: mockLocation,
      },
      message:
        areasUserIsIn.length > 0
          ? `Test location is in ${areasUserIsIn.length} area(s)`
          : "Test location is not in any monitored areas",
      res,
    });
  } catch (error) {
    console.error(
      `Error in testAreaAlertController for user ${req.params.userId}:`,
      error
    );
    return returnStatus({ status: 500, res });
  }
};
