import mongoose from "mongoose";

const AreaSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Area name is required"],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    geometry: {
      type: {
        type: String,
        enum: ["Polygon", "MultiPolygon"],
        required: true,
      },
      coordinates: {
        type: [[[Number]]],
        required: true,
      },
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
    alertType: {
      type: String,
      enum: ["info", "warning", "danger", "standard"],
      default: "standard",
    },
    properties: {
      type: Map,
      of: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  { timestamps: true }
);

AreaSchema.index({ geometry: "2dsphere" });

const Area = mongoose.model("Area", AreaSchema);

export default Area;
