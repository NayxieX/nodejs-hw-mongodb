import { Router } from "express";
import {
  handleGetAllContacts,
  handleGetContactById,
  createContactController,
  patchContactController,
  deleteContactController,
} from "../controllers/contacts.js";
import { ctrlWrapper } from "../utils/ctrlWrapper.js";

const router = Router();

router.get("/", ctrlWrapper(handleGetAllContacts));
router.get("/:contactId", ctrlWrapper(handleGetContactById));
router.post("/", ctrlWrapper(createContactController));
router.patch("/:contactId", ctrlWrapper(patchContactController));
router.delete("/:contactId", ctrlWrapper(deleteContactController));

export default router;
