import { Contact } from "../db/models/contacts.js";
import { calculatePaginationData } from "../utils/calculatePaginationData.js";
import { SORT_ORDER } from "../index.js";

export const getAllContacts = async ({
  page = 1,
  perPage = 10,
  sortOrder = SORT_ORDER.ASC,
  sortBy = "_id",
  userId,
}) => {
  const limit = perPage;
  const skip = (page - 1) * perPage;

  const sortOptions = {
    [sortBy]: sortOrder === SORT_ORDER.DESC ? -1 : 1,
  };

  const filter = { userId };
  const totalItems = await Contact.countDocuments(filter);

  const contacts = await Contact.find(filter)
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

export const getContactById = async (contactId, userId) => {
  return await Contact.findOne({ _id: contactId, userId });
};

export const createContact = async (payload) => {
  return await Contact.create(payload);
};

// export const patchContact = async ({ contactId, userId, ...payload }) => {
//   const updated = await Contact.findOneAndUpdate(
//     { _id: contactId, userId },
//     payload,
//     { new: true },
//   );

//   if (!updated) {
//     return null;
//   }

//   return {
//     contact: updated,
//     isNew: false,
//   };
// };

export const deleteContact = async ({ contactId, userId }) => {
  return await Contact.findOneAndDelete({
    _id: contactId,
    userId,
  });
};
