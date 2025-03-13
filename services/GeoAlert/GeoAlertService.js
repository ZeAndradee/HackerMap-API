import Location from "../../models/Location.js";
import Area from "../../models/Area.js";

/**
 * Check if a user is inside any monitored areas and trigger alerts if needed
 * @param {String} userId - The user ID
 * @param {Object} location - The user's location data
 * @returns {Promise<Array>} - Array of areas the user is currently in
 */
export const checkUserInAreas = async (userId, location) => {
  try {
    if (!location.coordinates.coordinates) {
      console.error("Invalid location data for user alert check");
      return [];
    }

    // Get all active areas
    const areas = await Area.find({ status: "active" });
    console.log("userId", userId);
    console.log("userlocation", location.coordinates.coordinates);
    console.log("Number of active areas found:", areas.length);

    // Log the full structure of the first area to see exactly how data is stored
    if (areas.length > 0) {
      console.log("First area structure:", JSON.stringify(areas[0]));
    }

    // Check if user's location is within any of the areas using MongoDB's geospatial query
    const userPoint = {
      type: "Point",
      coordinates: location.coordinates.coordinates,
    };

    console.log("User point for geospatial query:", JSON.stringify(userPoint));

    // Store areas that user is in
    const areasUserIsIn = [];

    // Try different geospatial query approach - first with $geoWithin
    console.log("Attempting $geoWithin query...");
    const withinAreas = await Area.find({
      status: "active",
      geometry: {
        $geoIntersects: {
          $geometry: userPoint,
        },
      },
    });

    console.log(
      `$geoIntersects with geometry field: Found ${withinAreas.length} areas`
    );

    // Third approach - try direct coordinate matching
    console.log("Attempting direct polygon matching...");
    const userLong = location.coordinates.coordinates[0];
    const userLat = location.coordinates.coordinates[1];

    // Manually check if user is inside any polygons
    let manuallyFoundAreas = [];
    for (const area of areas) {
      console.log(`Checking area: ${area.name}`);

      if (area.geometry && area.geometry.type === "Polygon") {
        const isInside = isPointInPolygon(
          userLong,
          userLat,
          area.geometry.coordinates[0]
        );
        console.log(`Is inside ${area.name}? ${isInside}`);

        if (isInside) {
          manuallyFoundAreas.push(area);
        }
      } else {
        console.log(`Area ${area.name} does not have proper polygon geometry`);
      }
    }

    console.log(
      `Manual polygon check: Found ${manuallyFoundAreas.length} areas`
    );

    // If we found areas manually but not with MongoDB query, use those results
    let matchingAreas = [];
    if (manuallyFoundAreas.length > 0) {
      matchingAreas = manuallyFoundAreas;
      console.log("Using manual polygon check results");
    } else {
      // Original query as fallback
      matchingAreas = await Area.find({
        status: "active",
        "geometry.coordinates": {
          $geoIntersects: {
            $geometry: userPoint,
          },
        },
      });
      console.log("Using original MongoDB query results");
    }

    console.log(`User ${userId} is in ${matchingAreas.length} areas`);
    console.log(
      "Matching areas:",
      JSON.stringify(matchingAreas.map((a) => a.name))
    );

    // For each matching area, check if this is a new entry
    for (const area of matchingAreas) {
      const isNewEntry = await checkIfNewAreaEntry(userId, area._id);

      if (isNewEntry) {
        // Trigger an alert for new entries
        const alert = await triggerAreaEntryAlert(userId, area);
        console.log("New area entry alert triggered:", alert);
      }

      areasUserIsIn.push(area);
    }

    return areasUserIsIn;
  } catch (error) {
    console.error("Error checking if user is in areas:", error);
    return [];
  }
};

/**
 * Check if this is a new entry into an area for a user
 * @param {String} userId - The user ID
 * @param {String} areaId - The area ID
 * @returns {Promise<Boolean>} - True if this is a new entry
 */
const checkIfNewAreaEntry = async (userId, areaId) => {
  try {
    // Get the user's previous location
    const previousLocations = await Location.find(
      { userId },
      {},
      { sort: { timestamp: -1 }, limit: 2 }
    );

    console.log(
      `Previous locations for user ${userId}:`,
      JSON.stringify(
        previousLocations.map((loc) => ({
          timestamp: loc.timestamp,
          coordinates: loc.coordinates.coordinates,
        }))
      )
    );

    // If this is the first location entry, it's a new entry
    if (previousLocations.length <= 1) {
      console.log("First location entry detected - marking as new entry");
      return true;
    }

    // Get the second most recent location
    const prevLocation = previousLocations[1];

    // Simplified check - directly check if previous location was in this area
    const wasInArea = await Area.findOne({
      _id: areaId,
      "geometry.coordinates": {
        $geoIntersects: {
          $geometry: {
            type: "Point",
            coordinates: prevLocation.coordinates.coordinates,
          },
        },
      },
    });

    console.log(
      `Was user previously in area ${areaId}?`,
      wasInArea ? "Yes" : "No"
    );

    // If the previous location wasn't in this area, this is a new entry
    return !wasInArea;
  } catch (error) {
    console.error(
      `Error checking if new area entry for user ${userId}:`,
      error
    );
    return false;
  }
};

/**
 * Trigger an alert when a user enters an area
 * @param {String} userId - The user ID
 * @param {Object} area - The area the user entered
 */
const triggerAreaEntryAlert = async (userId, area) => {
  const timestamp = new Date().toISOString();
  console.log("AREA", area);

  // Correctly access description from the Map object
  let messageContent =
    area.properties && area.properties.get
      ? area.properties.get("description")
      : `Você acaba de entrar em ${area.name}`;

  // Make a WhatsApp API request
  try {
    console.log(`Sending WhatsApp message about area: ${area.name}`);
    console.log(
      `Description from Map: ${
        area.properties && area.properties.get
          ? area.properties.get("description")
          : "not available"
      }`
    );
    console.log(`Message content: ${messageContent}`);

    // Validate that we have required fields
    if (!messageContent) {
      console.error(
        "Message content is missing - cannot send WhatsApp message"
      );
      return {
        userId,
        areaId: area._id,
        areaName: area.name,
        timestamp,
        alertType: area.alertType || "entry",
        status: "failed",
        reason: "Missing message content",
      };
    }

    const requestBody = {
      to: "5581992673394",
      message: messageContent,
    };

    console.log("WhatsApp API request body:", JSON.stringify(requestBody));

    const response = await fetch(
      "https://whatsapp-api-ai-groq.onrender.com/api/send-message",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      }
    );

    const responseData = await response.json().catch(() => null);

    if (!response.ok) {
      console.error(`WhatsApp API error: ${response.status}`, responseData);
      return {
        userId,
        areaId: area._id,
        areaName: area.name,
        timestamp,
        alertType: area.alertType || "entry",
        status: "failed",
        error: responseData,
      };
    } else {
      console.log("WhatsApp message sent successfully");
    }
  } catch (error) {
    console.error("Error sending WhatsApp notification:", error);
    return {
      userId,
      areaId: area._id,
      areaName: area.name,
      timestamp,
      alertType: area.alertType || "entry",
      status: "failed",
      error: error.message,
    };
  }

  // Return the alert information (could be stored in a database later)
  return {
    userId,
    areaId: area._id,
    areaName: area.name,
    timestamp,
    alertType: area.alertType || "entry",
    status: "success",
  };
};

/**
 * Track and log when users exit areas as well
 * @param {String} userId - The user ID
 * @param {Object} location - The user's current location
 */
export const checkUserExitAreas = async (userId, location) => {
  try {
    // This would be similar to the entry function but checking for exits
    // For now we're just implementing the entry alerts
    console.log("Exit alerts could be implemented here");
  } catch (error) {
    console.error("Error checking area exits:", error);
  }
};

/**
 * Helper function to check if a point is inside a polygon using the ray casting algorithm
 * @param {Number} longitude - Point longitude
 * @param {Number} latitude - Point latitude
 * @param {Array} polygon - Array of polygon coordinates
 * @returns {Boolean} - True if point is inside polygon
 */
function isPointInPolygon(longitude, latitude, polygon) {
  // Implementation of the ray casting algorithm
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i][0];
    const yi = polygon[i][1];
    const xj = polygon[j][0];
    const yj = polygon[j][1];

    const intersect =
      yi > latitude != yj > latitude &&
      longitude < ((xj - xi) * (latitude - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }

  return inside;
}
