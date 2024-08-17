const prisma = require("../config/prisma");
const asyncHandler = require("express-async-handler");

exports.isAuth = (req, res, next) => {
  if (req.isAuthenticated()) {
    next();
  } else {
    res
      .status(401)
      .json({ msg: "You are not authorized to view this resource" });
  }
};

exports.isAuthAndRedirect = (req, res, next) => {
  if (req.isAuthenticated()) {
    next();
  } else {
    res.redirect("/log-in");
  }
};

exports.isFolderIsSharingOrAuth = asyncHandler(async (req, res, next) => {
  const folderId = parseInt(req.params.id);

  const folder = await prisma.folder.findUnique({ where: { id: folderId } });

  if (folder.diff || req.isAuthenticated()) {
    next();
  } else {
    res
      .status(401)
      .json({ msg: "You are not authorzied to view this resource" });
  }
});

exports.isFileParentFolderSharingOrAuth = asyncHandler(
  async (req, res, next) => {
    const fileId = parseInt(req.params.id);

    const file = await prisma.file.findUnique({
      where: { id: fileId },
      include: { parentFolder: true },
    });

    if (file.parentFolder.diff || req.isAuthenticated()) {
      next();
    } else {
      res
        .status(401)
        .json({ msg: "You are not authorzied to view this resource" });
    }
  }
);
