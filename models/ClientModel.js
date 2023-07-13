import express from "express";
import mongoose from "mongoose";

const ClientSchema = mongoose.Schema({
  name: String,
  email: String,
  phone: String,
  address: String,
  userId: [String],
  createdAt: {
    type: Date,
    default: new Date(),
  },
  balance: {
    type: Number,
    default: 0,
  },
  notes: {
    type: String,
    default: "",
  },
});

const ClientModel = mongoose.model("ClientModel", ClientSchema);
export default ClientModel;
