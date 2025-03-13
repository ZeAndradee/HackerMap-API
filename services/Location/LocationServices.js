import Location from "../../models/Location.js";
import { checkUserInAreas } from "../GeoAlert/GeoAlertService.js";

/**
 * Save a new user location
 * @param {Object} locationData - Location data including userId and coordinates
 * @returns {Promise<Object>} - The saved location document
 */
export const saveUserLocation = async (locationData) => {
  try {
    // Debug logging to verify coordinate order
    if (locationData.coordinates && locationData.coordinates.coordinates) {
      console.log(
        `Saving location with coordinates [longitude, latitude]: [${locationData.coordinates.coordinates[0]}, ${locationData.coordinates.coordinates[1]}]`
      );
    }

    const newLocation = new Location(locationData);
    await newLocation.save();

    // After saving, check if the user is in any monitored areas
    const userId = locationData.userId;
    if (userId) {
      await checkUserInAreas(userId, newLocation);
    }

    return newLocation;
  } catch (error) {
    console.error("Error saving location:", error);
    throw error;
  }
};

/**
 * Update the latest location for a specific user
 * @param {String} userId - The user ID
 * @param {Object} locationData - Updated location data
 * @returns {Promise<Object>} - The updated location document
 */
export const updateUserLocation = async (userId, locationData) => {
  try {
    // Debug logging to verify coordinate order
    if (locationData.coordinates && locationData.coordinates.coordinates) {
      console.log(
        `Updating location for user ${userId} with coordinates [longitude, latitude]: [${locationData.coordinates.coordinates[0]}, ${locationData.coordinates.coordinates[1]}]`
      );
    }

    // Find the latest location entry for this user
    const latestLocation = await Location.findOne(
      { userId },
      {},
      { sort: { timestamp: -1 } }
    );

    // If no location exists for this user, create a new one
    if (!latestLocation) {
      console.log(`No location found for user ${userId}, creating a new one`);
      const newLocation = new Location({
        userId,
        ...locationData,
      });
      await newLocation.save();

      // Check if the new location is in any monitored areas
      await checkUserInAreas(userId, newLocation);

      return newLocation;
    }

    // Update the location
    Object.keys(locationData).forEach((key) => {
      if (key !== "userId") {
        // Don't allow changing userId
        latestLocation[key] = locationData[key];
      }
    });

    // Update timestamp
    latestLocation.timestamp = new Date();

    await latestLocation.save();

    // Check if the updated location is in any monitored areas
    await checkUserInAreas(userId, latestLocation);

    return latestLocation;
  } catch (error) {
    console.error(`Error updating location for user ${userId}:`, error);
    throw error;
  }
};

/**
 * Get all locations for a specific user
 * @param {String} userId - The user ID
 * @returns {Promise<Array>} - Array of location documents
 */
export const getUserLocations = async (userId) => {
  try {
    return await Location.find({ userId }).sort({ timestamp: -1 });
  } catch (error) {
    console.error(`Error fetching locations for user ${userId}:`, error);
    throw error;
  }
};

/**
 * Get all locations
 * @returns {Promise<Array>} - Array of all location documents
 */
export const getAllLocations = async () => {
  try {
    return await Location.find().sort({ timestamp: -1 });
  } catch (error) {
    console.error("Error fetching all locations:", error);
    throw error;
  }
};

/**
 * Get all locations within a specific area
 * @param {String} areaId - The area ID
 * @returns {Promise<Array>} - Array of location documents within the area
 */
export const getLocationsInArea = async (areaId) => {
  try {
    // This implementation depends on how areas are defined in your database
    // Here's a simple implementation assuming areas are stored with their boundaries
    const Area = (await import("../../models/Area.js")).default;

    const area = await Area.findById(areaId);
    if (!area) {
      throw new Error("Area not found");
    }

    // If your area has a GeoJSON polygon, you can use MongoDB's $geoWithin operator
    return await Location.find({
      coordinates: {
        $geoWithin: {
          $geometry: area.geometry,
        },
      },
    }).sort({ timestamp: -1 });
  } catch (error) {
    console.error(`Error fetching locations in area ${areaId}:`, error);
    throw error;
  }
};
