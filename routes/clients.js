// /clients is the path for all routes in this file
import express from "express";
import {
  getClients,
  createClient,
  updateClient,
  deleteClient,
  getClientsByUser,
  getInvoicesByClient,
  getClientInvoiceSummary,
  postbanktransfer,
  getbanktransfer,
} from "../controllers/clients.js";

const router = express.Router();

router.get("/", getClients);
router.get("/user", getClientsByUser);
router.post("/", createClient);
router.patch("/:id", updateClient);
router.delete("/:id", deleteClient);
router.get("/:id/invoices", getInvoicesByClient);
router.get("/:id/invoices/summary", getClientInvoiceSummary);
router.post("/transfer", postbanktransfer);
router.get("/:id/transfer", getbanktransfer);

export default router;
