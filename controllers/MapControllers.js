import {
  getAllAreas,
  getAreaById,
  createArea,
  updateArea,
  deleteArea,
  findAreasContainingPoint,
} from "../services/Area/AreaServices.js";
import { returnStatus } from "../utils/ReturnStatus.js";

export const allAreasController = async (req, res) => {
  try {
    const allAreas = await getAllAreas();
    return returnStatus({ status: 200, data: allAreas, res });
  } catch (error) {
    console.error(error);
    return returnStatus({ status: 500, res });
  }
};

export const getAreaByIdController = async (req, res) => {
  try {
    const { id } = req.params;
    const area = await getAreaById(id);
    return returnStatus({ status: 200, data: area, res });
  } catch (error) {
    console.error(error);
    if (error.message === "Area not found") {
      return returnStatus({ status: 404, message: "Area not found", res });
    }
    return returnStatus({ status: 500, res });
  }
};

export const createAreaController = async (req, res) => {
  try {
    const areaData = req.body;
    const newArea = await createArea(areaData);
    return returnStatus({
      status: 201,
      data: newArea,
      message: "Area created successfully",
      res,
    });
  } catch (error) {
    console.error(error);
    if (error.name === "ValidationError") {
      return returnStatus({
        status: 400,
        message: "Invalid area data: " + error.message,
        res,
      });
    }
    return returnStatus({ status: 500, res });
  }
};

export const updateAreaController = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    const updatedArea = await updateArea(id, updateData);
    return returnStatus({
      status: 200,
      data: updatedArea,
      message: "Area updated successfully",
      res,
    });
  } catch (error) {
    console.error(error);
    if (error.message === "Area not found") {
      return returnStatus({ status: 404, message: "Area not found", res });
    }
    if (error.name === "ValidationError") {
      return returnStatus({
        status: 400,
        message: "Invalid area data: " + error.message,
        res,
      });
    }
    return returnStatus({ status: 500, res });
  }
};

export const deleteAreaController = async (req, res) => {
  try {
    const { id } = req.params;
    await deleteArea(id);
    return returnStatus({
      status: 200,
      message: "Area deleted successfully",
      res,
    });
  } catch (error) {
    console.error(error);
    if (error.message === "Area not found") {
      return returnStatus({ status: 404, message: "Area not found", res });
    }
    return returnStatus({ status: 500, res });
  }
};

export const findAreasForPointController = async (req, res) => {
  try {
    const { longitude, latitude } = req.query;

    if (!longitude || !latitude) {
      return returnStatus({
        status: 400,
        message: "Both longitude and latitude are required",
        res,
      });
    }

    const coordinates = [parseFloat(longitude), parseFloat(latitude)];
    const areas = await findAreasContainingPoint(coordinates);

    return returnStatus({
      status: 200,
      data: areas,
      res,
    });
  } catch (error) {
    console.error(error);
    return returnStatus({ status: 500, res });
  }
};
