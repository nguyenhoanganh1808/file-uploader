const express = require("express");
const router = express.Router();
const shareController = require("../controllers/shareController");

router.get("/:id", shareController.folder_detail_share_get);

router.get("/:id/new", shareController.share_create_get);

router.post("/:id/new", shareController.share_create_post);

module.exports = router;
