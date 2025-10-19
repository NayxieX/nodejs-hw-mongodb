import {
  deleteContact,
  getAllContacts,
  getContactById,
  patchContact,
} from "../services/contacts.js";
import createHttpError from "http-errors";
import { createContact } from "../services/contacts.js";
import { parsePaginationParams } from "../utils/parsePaginationParams.js";
import { parseSortParams } from "../utils/parseSortParams.js";

export const handleGetAllContacts = async (req, res, next) => {
  try {
    const { page, perPage } = parsePaginationParams(req.query);
    const { sortBy, sortOrder } = parseSortParams(req.query);
    const contacts = await getAllContacts({ page, perPage, sortBy, sortOrder });
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
  const { contactId } = req.params;
  const contact = await getContactById(contactId);

  if (!contact) {
    return next(createHttpError(404, "Contact not found"));
  }

  res.json({
    status: 200,
    message: "Successfully found contact!",
    data: contact,
  });
};

export const createContactController = async (req, res) => {
  const cantact = await createContact(req.body);
  res.status(201).json({
    status: 201,
    message: `Successfully created a contact!`,
    data: cantact,
  });
};

export const patchContactController = async (req, res, next) => {
  try {
    const { contactId } = req.params;
    const result = await patchContact(contactId, req.body);

    if (!result) {
      return next(createHttpError(404, "Contact not found"));
    }
    res.json({
      status: 200,
      message: `Successfully patched a contact!`,
      data: result.contact,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteContactController = async (req, res, next) => {
  const { contactId } = req.params;
  const contact = await deleteContact(contactId);

  if (!contact) {
    next(createHttpError(404, "Contact not found"));
    return;
  }
  res.status(204).send();
};
