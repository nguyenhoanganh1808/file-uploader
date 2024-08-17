const express = require("express");
const router = express.Router();
const multer = require("multer");
const filesController = require("../controllers/filesController");
const upload = multer({ dest: "uploads/" });

const { isAuth, isFileParentFolderSharingOrAuth } = require("./authMiddleware");

router.get(
  "/:id",
  isFileParentFolderSharingOrAuth,
  filesController.file_detail_get
);

router.get("/:id/new", isAuth, filesController.file_upload_get);

router.post(
  "/:id/new",
  upload.single("file"),
  filesController.file_upload_post
);

router.get("/:id/update", filesController.file_update_get);

router.post("/:id/update", filesController.file_update_post);

router.get("/:id/delete", filesController.file_delete_get);

router.post("/:id/delete", filesController.file_delete_post);

module.exports = router;
