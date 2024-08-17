const asyncHandler = require("express-async-handler");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const { uploadFile } = require("../utils/uploadFile");

exports.file_upload_get = asyncHandler(async (req, res) => {
  const isRoot = req.params.id === "my-drive";

  let folder;
  if (!isRoot) {
    folder = await prisma.folder.findUnique({
      where: { id: parseInt(req.params.id) },
    });
  }
  res.render("upload_file_form", { isRoot: isRoot, folder: folder });
});

exports.file_upload_post = asyncHandler(async (req, res) => {
  const imageUrl = await uploadFile(req.file.path);
  const isRoot = req.query.isRoot;

  const file = await prisma.file.create({
    data: {
      name: req.file.originalname,
      creatorId: req.user.id,
      size: req.file.size,
      url: imageUrl,
      parentFolderId: isRoot === true ? null : parseInt(req.params.id),
    },
  });

  res.redirect(`/folders/${req.params.id}`);
});

exports.file_detail_get = asyncHandler(async (req, res) => {
  const fileId = parseInt(req.params.id);
  const file = await prisma.file.findUnique({ where: { id: fileId } });
  res.render("file_detail", {
    file: file,
    isRoot: file.parentFolderId === null,
    folder: {},
  });
});

exports.file_update_get = asyncHandler(async (req, res) => {
  const fileId = parseInt(req.params.id);
  const file = await prisma.file.findUnique({ where: { id: fileId } });
  let parentFolder;
  if (file.parentFolderId !== null) {
    parentFolder = await prisma.folder.findUnique({
      where: { id: file.parentFolderId },
    });
  }
  res.render("file_update_form", {
    file: file,
    isRoot: file.parentFolderId === null,
    folder: parentFolder,
  });
});

exports.file_update_post = asyncHandler(async (req, res) => {
  const fileId = parseInt(req.params.id);
  const file = await prisma.file.findUnique({ where: { id: fileId } });

  await prisma.file.update({
    where: { id: fileId },
    data: { name: req.body.fileName },
  });
  res.redirect(`/folders/${file.parentFolderId || "my-drive"}`);
});

exports.file_delete_get = asyncHandler(async (req, res) => {
  const fileId = parseInt(req.params.id);
  const file = await prisma.file.findUnique({ where: { id: fileId } });
  let parentFolder;
  if (file.parentFolderId !== null) {
    parentFolder = await prisma.folder.findUnique({
      where: { id: file.parentFolderId },
    });
  }

  res.render("file_delete_form", {
    file: file,
    isRoot: file.parentFolderId === null,
    folder: parentFolder,
  });
});

exports.file_delete_post = asyncHandler(async (req, res) => {
  const fileId = parseInt(req.params.id);
  const file = await prisma.file.findUnique({ where: { id: fileId } });
  await prisma.file.delete({ where: { id: fileId } });

  res.redirect(`/folders/${file.parentFolderId || "my-drive"}`);
});
