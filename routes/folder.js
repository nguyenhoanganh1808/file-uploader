const express = require("express");
const router = express.Router();
const foldersController = require("../controllers/foldersController");
const {
  isAuth,
  isAuthAndRedirect,
  isFolderIsSharingOrAuth,
} = require("./authMiddleware");

router.get("/my-drive", isAuthAndRedirect, foldersController.root_folders_get);

router.get(
  "/:id",
  isFolderIsSharingOrAuth,
  foldersController.folder_detail_get
);

router.get("/:id/new", isAuth, foldersController.folder_create_get);

router.post("/:id/new", isAuth, foldersController.folder_create_post);

router.get("/:id/update", isAuth, foldersController.folder_update_get);

router.post("/:id/update", isAuth, foldersController.folder_update_post);

router.get("/:id/delete", isAuth, foldersController.folder_delete_get);

router.post("/:id/delete", isAuth, foldersController.folder_delete_post);

module.exports = router;
