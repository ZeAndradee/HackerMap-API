import mongoose from "mongoose";

const locationSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    coordinates: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
        required: true,
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true,
      },
    },
    accuracy: {
      type: Number,
    },
    altitude: {
      type: Number,
    },
    heading: {
      type: Number,
    },
    speed: {
      type: Number,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    deviceInfo: {
      type: Object,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Create a 2dsphere index on the coordinates field for geospatial queries
locationSchema.index({ coordinates: "2dsphere" });

const Location = mongoose.model("Location", locationSchema);

export default Location;
