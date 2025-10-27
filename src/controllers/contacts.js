import * as fs from "node:fs/promises";
import path from "node:path";

import createHttpError from "http-errors";
import {
  getAllContacts,
  getContactById,
  createContact,
  // patchContact,
  deleteContact,
} from "../services/contacts.js";
import { parsePaginationParams } from "../utils/parsePaginationParams.js";
import { parseSortParams } from "../utils/parseSortParams.js";
import { saveFileToCloudinary } from "../utils/saveFileToCloudinary.js";
import { getEnvVar } from "../utils/getEnvVar.js";
import { Contact } from "../db/models/contacts.js";

export const handleGetAllContacts = async (req, res, next) => {
  try {
    const { page, perPage } = parsePaginationParams(req.query);
    const { sortBy, sortOrder } = parseSortParams(req.query);
    const userId = req.user._id;

    const contacts = await getAllContacts({
      page,
      perPage,
      sortBy,
      sortOrder,
      userId,
    });

    res.json({
      status: 200,
      message: "Successfully found contacts!",
      data: contacts,
    });
  } catch (error) {
    next(error);
  }
};

export const handleGetContactById = async (req, res, next) => {
  try {
    const { contactId } = req.params;
    const userId = req.user._id;

    const contact = await getContactById(contactId, userId);

    if (!contact) {
      return next(createHttpError(404, "Contact not found"));
    }

    res.json({
      status: 200,
      message: "Successfully found contact!",
      data: contact,
    });
  } catch (error) {
    next(error);
  }
};

export const createContactController = async (req, res, next) => {
  try {
    const userId = req.user._id;
    let photo = null;

    const tempPath = req.file.path;

    if (getEnvVar("UPLOAD_TO_CLOUDINARY") === "true") {
      const result = await saveFileToCloudinary(tempPath);
      await fs.unlink(tempPath); // Видаляємо файл з tmp
      photo = result.secure_url;
    } else {
      const newPath = path.resolve(
        "src",
        "uploads",
        "photo",
        req.file.filename
      );

      await fs.mkdir(path.dirname(newPath), { recursive: true });

      await fs.rename(tempPath, newPath);
      photo = `http://localhost:3000/photo/${req.file.filename}`;
    }

    const contact = await createContact({
      ...req.body,
      userId,
      photo,
    });

    res.status(201).json({
      status: 201,
      message: "Successfully created a contact!",
      data: contact,
    });
  } catch (error) {
    next(error);
  }
};

export const patchContactController = async (req, res, next) => {
  try {
    const { contactId } = req.params;
    const updatedData = { ...req.body };

    if (req.file) {
      const tempPath = req.file.path;

      if (getEnvVar("UPLOAD_TO_CLOUDINARY") === "true") {
        const result = await saveFileToCloudinary(tempPath);
        await fs.unlink(tempPath);
        updatedData.photo = result.secure_url;
      } else {
        const newPath = path.resolve(
          "src",
          "uploads",
          "photo",
          req.file.filename
        );
        await fs.mkdir(path.dirname(newPath), { recursive: true });
        await fs.rename(tempPath, newPath);
        updatedData.photo = `http://localhost:3000/photo/${req.file.filename}`;
      }
    }

    // const result = await patchContact({ contactId, userId, ...updatedData });
    const result = await Contact.findByIdAndUpdate(contactId, updatedData, {
      new: true,
    });

    if (!result) {
      return next(createHttpError(404, "Contact not found"));
    }

    res.json({
      status: 200,
      message: "Successfully patched a contact!",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteContactController = async (req, res, next) => {
  try {
    const { contactId } = req.params;
    const userId = req.user._id;

    const deleted = await deleteContact({ contactId, userId });

    if (!deleted) {
      return next(createHttpError(404, "Contact not found"));
    }

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
