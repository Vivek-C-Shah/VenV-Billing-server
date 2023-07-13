import express from "express";
import mongoose from "mongoose";

import ClientModel from "../models/ClientModel.js";
import InvoiceModel from "../models/InvoiceModel.js";

// export const getClients = async (req, res) => {
//     const userId = req.body

//     try {
//         const allClients = await ClientModel.find({userId: userId}).sort({_id:-1})
//         //find({}).sort({_id:-1}) to sort according to date of creation

//         res.status(200).json(allClients)

//     } catch (error) {
//         res.status(409).json(error.message)

//     }

// }

export const getInvoicesByClient = async (req, res) => {
  const { id } = req.params;

  try {
    const invoices = await InvoiceModel.findById(id);

    res.status(200).json(invoices);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const getClient = async (req, res) => {
  const { id } = req.params;

  try {
    const client = await ClientModel.findById(id);

    res.status(200).json(client);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const getClients = async (req, res) => {
  const { page } = req.query;

  try {
    const LIMIT = 8;
    const startIndex = (Number(page) - 1) * LIMIT; // get the starting index of every page

    const total = await ClientModel.countDocuments({});
    const clients = await ClientModel.find()
      .sort({ _id: -1 })
      .limit(LIMIT)
      .skip(startIndex);

    res.json({
      data: clients,
      currentPage: Number(page),
      numberOfPages: Math.ceil(total / LIMIT),
    });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const createClient = async (req, res) => {
  const client = req.body;

  const newClient = new ClientModel({
    ...client,
    createdAt: new Date().toISOString(),
  });

  try {
    await newClient.save();
    res.status(201).json(newClient);
  } catch (error) {
    res.status(409).json(error.message);
  }
};

export const updateClient = async (req, res) => {
  const { id: _id } = req.params;
  const client = req.body;

  if (!mongoose.Types.ObjectId.isValid(_id))
    return res.status(404).send("No client with that id");

  const updatedClient = await ClientModel.findByIdAndUpdate(
    _id,
    { ...client, _id },
    { new: true }
  );

  res.json(updatedClient);
};

export const postbanktransfer = async (req, res) => {
  try {
    const { clientName, amount, notes } = req.body;

    // find client by name and then fetch the id of the client
    const client = await ClientModel.findOne({ name: clientName });

    if (!client) {
      return res.status(404).json({ message: "Client not found" });
    }
    client.balance += parseInt(amount);
    client.notes += `•Amount of ${amount} recieved from ${notes}\n`;
    await client.save();

    return res.status(200).json({ message: "Cash transfer successful" });
  } catch (error) {
    console.error("Error transferring cash:", error);
    return res.status(500).json({ message: "Failed to transfer cash" });
  }
};

export const getbanktransfer = async (req, res) => {
  const { id } = req.params;
  try {
    // Retrieve the client from the database
    const client = await ClientModel.findById(id);

    if (!client) {
      return res.status(404).json({ message: "Client not found" });
    }

    // Retrieve bank transfers from the client
    const bankTransfers = client.balance;
    const notes = client.notes;

    return res.status(200).json({ bankTransfers, notes });
  } catch (error) {
    console.error("Error retrieving bank transfers:", error);
    return res
      .status(500)
      .json({ message: "Failed to retrieve bank transfers" });
  }
};

export const deleteClient = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id))
    return res.status(404).send("No Client with that id");

  await ClientModel.findByIdAndRemove(id);

  res.json({ message: "Client deleted successfully" });
};

export const getClientsByUser = async (req, res) => {
  const { searchQuery } = req.query;

  try {
    const clients = await ClientModel.find({ userId: searchQuery });

    res.json({ data: clients });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const getClientInvoiceSummary = async (req, res) => {
  const { id } = req.params;

  try {
    // Check if the client exists
    const client = await ClientModel.findById(id);
    if (!client) {
      return res.status(404).json({ message: "Client not found" });
    }

    // Get invoices for the client
    const invoices = await InvoiceModel.find({ "client.email": client.email });

    // Calculate the invoice summary
    const totalInvoices = invoices.length;
    const totalAmount = invoices.reduce(
      (total, invoice) => total + invoice.total,
      0
    );
    const totalAmountPaid = invoices.reduce(
      (total, invoice) => total + invoice.totalAmountReceived,
      0
    );
    const totalAmountRemaining = totalAmount - totalAmountPaid;

    const summary = {
      balance: client.balance,
      notes: client.notes,
      name: client.name,
      invoices,
      totalInvoices,
      totalAmount,
      totalAmountPaid,
      totalAmountRemaining,
    };

    res.status(200).json(summary);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};
