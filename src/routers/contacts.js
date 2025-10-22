import { Router } from "express";
import {
  handleGetAllContacts,
  handleGetContactById,
  createContactController,
  patchContactController,
  deleteContactController,
} from "../controllers/contacts.js";
import { ctrlWrapper } from "../utils/ctrlWrapper.js";
import { validateBody } from "../middlewares/validateBody.js";
import {
  createContactSchema,
  updateContactSchema,
} from "../validation/contactSchema.js";
import { isValidId } from "../middlewares/isValidId.js";

const router = Router();

router.get("/", ctrlWrapper(handleGetAllContacts));

router.get("/:contactId", isValidId, ctrlWrapper(handleGetContactById));

router.post(
  "/",
  validateBody(createContactSchema),
  ctrlWrapper(createContactController)
);

router.patch(
  "/:contactId",
  isValidId,
  validateBody(updateContactSchema),
  ctrlWrapper(patchContactController)
);

router.delete("/:contactId", isValidId, ctrlWrapper(deleteContactController));

export default router;
