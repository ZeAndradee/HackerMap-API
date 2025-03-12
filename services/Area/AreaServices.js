import Area from "../../models/Area.js";

/**
 * Get all areas from the database
 * @returns {Promise<Array>} Array of area objects
 */
export const getAllAreas = async () => {
  try {
    const areas = await Area.find({ status: "active" });
    return areas;
  } catch (error) {
    console.error("Error in getAllAreas service:", error);
    throw error;
  }
};

/**
 * Get a single area by ID
 * @param {string} areaId - The ID of the area to retrieve
 * @returns {Promise<Object>} Area object
 */
export const getAreaById = async (areaId) => {
  try {
    const area = await Area.findById(areaId);
    if (!area) {
      throw new Error("Area not found");
    }
    return area;
  } catch (error) {
    console.error(`Error in getAreaById service: ${error.message}`);
    throw error;
  }
};

/**
 * Create a new area
 * @param {Object} areaData - Data for the new area
 * @returns {Promise<Object>} Newly created area object
 */
export const createArea = async (areaData) => {
  try {
    const newArea = new Area(areaData);
    await newArea.save();
    return newArea;
  } catch (error) {
    console.error(`Error in createArea service: ${error.message}`);
    throw error;
  }
};

/**
 * Update an existing area
 * @param {string} areaId - The ID of the area to update
 * @param {Object} updateData - The data to update
 * @returns {Promise<Object>} Updated area object
 */
export const updateArea = async (areaId, updateData) => {
  try {
    const updatedArea = await Area.findByIdAndUpdate(areaId, updateData, {
      new: true,
      runValidators: true,
    });

    if (!updatedArea) {
      throw new Error("Area not found");
    }

    return updatedArea;
  } catch (error) {
    console.error(`Error in updateArea service: ${error.message}`);
    throw error;
  }
};

/**
 * Delete an area (set status to inactive)
 * @param {string} areaId - The ID of the area to delete
 * @returns {Promise<Object>} Result of the operation
 */
export const deleteArea = async (areaId) => {
  try {
    const result = await Area.findByIdAndUpdate(
      areaId,
      { status: "inactive" },
      { new: true }
    );

    if (!result) {
      throw new Error("Area not found");
    }

    return result;
  } catch (error) {
    console.error(`Error in deleteArea service: ${error.message}`);
    throw error;
  }
};

/**
 * Find areas that contain a specific point
 * @param {Array} coordinates - [longitude, latitude] of the point
 * @returns {Promise<Array>} Array of areas containing the point
 */
export const findAreasContainingPoint = async (coordinates) => {
  try {
    const [longitude, latitude] = coordinates;

    const areas = await Area.find({
      coordinates: {
        $geoIntersects: {
          $geometry: {
            type: "Point",
            coordinates: [longitude, latitude],
          },
        },
      },
      status: "active",
    });

    return areas;
  } catch (error) {
    console.error(
      `Error in findAreasContainingPoint service: ${error.message}`
    );
    throw error;
  }
};
