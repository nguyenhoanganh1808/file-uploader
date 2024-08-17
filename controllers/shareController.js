const prisma = require("../config/prisma");
const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");
const { addDaysToDate, generateShareLink } = require("../utils/ultis");
const queries = require("../db/queries");

exports.folder_detail_share_get = asyncHandler(async (req, res) => {
  const shareId = req.params.id;
  const folder = await prisma.folder.findUnique({
    where: { shareId: shareId },
  });

  if (!folder.diff) {
    res.send("this link is expired");
  }

  const [folders, files] = await Promise.all([
    prisma.folder.findMany({
      where: {
        parentFolderId: folder.id,
      },
    }),
    prisma.file.findMany({
      where: {
        parentFolderId: folder.id,
      },
    }),
  ]);

  res.render("index", {
    isRoot: false,
    isGuest: true,
    folder: folder,
    folders: folders,
    files: files,
  });
});

exports.share_create_get = asyncHandler(async (req, res) => {
  const folderId = parseInt(req.params.id);

  const folder = await prisma.folder.findUnique({ where: { id: folderId } });

  const folderCopyLink = generateShareLink(req, folder.shareId);

  res.render("folder_share_form", {
    isRoot: false,
    folder: folder,
    shareLink: folder.diff ? folderCopyLink : undefined,
  });
});

exports.share_create_post = [
  body("duration")
    .trim()
    .isLength({ min: 1 })
    .withMessage("duration must not be empty")
    .isNumeric()
    .withMessage("duration must be a number")
    .escape(),
  asyncHandler(async (req, res) => {
    const folderId = parseInt(req.params.id);
    const duration = parseInt(req.body.duration);
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.render("folder_share_form", {
        isRoot: false,
        folder: {},
        errors: errors.array(),
      });
    }

    const folder = await prisma.folder.findUnique({
      where: { id: folderId },
    });

    const updateFolder = await queries.updateFolderAndChildren(folder.id, {
      expiredDateShare: folder.diff
        ? addDaysToDate(folder.expiredDateShare, duration)
        : addDaysToDate(new Date(), duration).toISOString(),
    });

    const folderCopyLink = generateShareLink(req, folder.shareId);

    return res.render("folder_share_form", {
      isRoot: false,
      folder: updateFolder,
      shareLink: folderCopyLink,
    });
  }),
];
