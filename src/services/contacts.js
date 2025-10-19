import { Contact } from "../db/models/contacts.js";
import { calculatePaginationData } from "../utils/calculatePaginationData.js";
import { SORT_ORDER } from "../index.js";

export const getAllContacts = async ({
  page = 1,
  perPage = 10,
  sortOrder = SORT_ORDER.ASC,
  sortBy = "_id",
}) => {
  const limit = perPage;
  const skip = (page - 1) * perPage;

  const totalItems = await Contact.countDocuments();

  const sortOptions = {
    [sortBy]: sortOrder === SORT_ORDER.DESC ? -1 : 1,
  };

  const contacts = await Contact.find()
    .sort(sortOptions)
    .skip(skip)
    .limit(limit)
    .exec();

  const paginationData = calculatePaginationData({
    totalItems,
    perPage,
    page,
  });

  return { data: contacts, ...paginationData };
};

export const getContactById = async (id) => {
  return await Contact.findById(id);
};

export const createContact = async (payload) => {
  const contact = await Contact.create(payload);
  return contact;
};

export const patchContact = async (contactId, payload, options = {}) => {
  const updateContact = await Contact.findOneAndUpdate(
    { _id: contactId },
    payload,
    {
      new: true,
      includeResultMetadata: true,
      ...options,
    }
  );
  if (!updateContact || !updateContact.value) {
    return null;
  }
  return {
    contact: updateContact.value,
    isNew: false,
  };
};

export const deleteContact = async (contactId) => {
  const contact = await Contact.findOneAndDelete({
    _id: contactId,
  });
  return contact;
};
