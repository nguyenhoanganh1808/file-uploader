const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const validateFolderName = [
  body("folderName")
    .trim()
    .isLength({ min: 1 })
    .withMessage("Name must not empty!")
    .custom(async (name, { req }) => {
      let existFolderName;
      if (req.params.id === "my-drive") {
        existFolderName = await prisma.folder.findFirst({
          where: {
            AND: [
              {
                name: name,
                parentFolderId: null,
              },
            ],
          },
        });
      } else {
        existFolderName = await prisma.folder.findFirst({
          where: {
            AND: [
              {
                name: name,
                parentFolderId: parseInt(req.params.id),
              },
            ],
          },
        });
      }
      if (existFolderName) {
        throw new Error("Folder name is already exist!");
      }
    }),
];

exports.folder_create_get = asyncHandler(async (req, res) => {
  let folderId =
    req.params.id === "my-drive" ? "my-drive" : parseInt(req.params.id);
  const isRoot = folderId === "my-drive";
  let folder;
  if (!isRoot) {
    folder = await prisma.folder.findFirst({ where: { id: folderId } });
  }
  res.render("create_folder_form", { isRoot: isRoot, folder: folder });
});

exports.folder_create_post = [
  validateFolderName,
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);

    const { folderName } = req.body;

    const folderId =
      req.params.id === "my-drive" ? "my-drive" : parseInt(req.params.id);
    const isRoot = folderId === "my-drive";
    let folder;
    if (!isRoot) {
      folder = await prisma.folder.findFirst({ where: { id: folderId } });
    }

    if (!errors.isEmpty()) {
      return res.render("create_folder_form", {
        errors: errors.array(),
        folder: folder,
        isRoot: req.params.id === "my-drive",
      });
    }

    //create folder in root folder
    if (isRoot) {
      await prisma.folder.create({
        data: {
          name: folderName,
          creatorId: req.user.id,
        },
      });
    } else {
      await prisma.folder.create({
        data: {
          name: folderName,
          creatorId: req.user.id,
          parentFolderId: folderId,
          expiredDateShare: folder.expiredDateShare,
        },
      });
    }
    res.redirect(`/folders/${req.params.id}`);
  }),
];

exports.root_folders_get = asyncHandler(async (req, res) => {
  const [folders, files] = await Promise.all([
    prisma.folder.findMany({
      where: {
        parentFolderId: null,
        creatorId: req.user.id,
      },
    }),
    prisma.file.findMany({
      where: {
        parentFolderId: null,
        creatorId: req.user.id,
      },
    }),
  ]);

  res.render("index", { isRoot: true, folders: folders, files: files });
});

exports.folder_detail_get = asyncHandler(async (req, res) => {
  const folderId = parseInt(req.params.id);
  const [folders, files, folder] = await Promise.all([
    prisma.folder.findMany({
      where: {
        parentFolderId: folderId,
      },
    }),

    prisma.file.findMany({
      where: {
        parentFolderId: folderId,
      },
    }),
    prisma.folder.findFirst({
      where: {
        id: folderId,
      },
    }),
  ]);

  res.render("index", {
    isRoot: false,
    folder: folder,
    folders: folders,
    files: files,
  });
});

exports.folder_update_get = asyncHandler(async (req, res) => {
  const folderId = parseInt(req.params.id);
  const folder = await prisma.folder.findFirst({
    where: {
      id: folderId,
    },
  });
  res.render("update_folder_form", {
    isRoot: folder.parentFolderId == null,
    folder: folder,
  });
});

exports.folder_update_post = [
  validateFolderName,
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    const { folderName } = req.body;
    const folderId = parseInt(req.params.id);

    const folder = await prisma.folder.findFirst({
      where: {
        id: folderId,
      },
    });

    if (!errors.array()) {
      return res.render("update_folder_form", {
        folder: folder,
        errors: errors.array(),
      });
    }

    await prisma.folder.update({
      where: {
        id: folderId,
      },
      data: {
        name: folderName,
      },
    });

    res.redirect(`/folders/${folder.parentFolderId || "my-drive"}`);
  }),
];

exports.folder_delete_get = asyncHandler(async (req, res) => {
  const folderId = parseInt(req.params.id);
  const folder = await prisma.folder.findFirst({
    where: {
      id: folderId,
    },
  });
  res.render("folder_delete_form", {
    folder: folder,
    isRoot: folder.parentFolderId == null,
  });
});

exports.folder_delete_post = asyncHandler(async (req, res) => {
  const folderId = parseInt(req.params.id);

  const folder = await prisma.folder.findFirst({
    where: {
      id: folderId,
    },
  });

  const deleteChildFolders = prisma.folder.deleteMany({
    where: {
      parentFolderId: folderId,
    },
  });

  const deleteChildFiles = prisma.file.deleteMany({
    where: {
      parentFolderId: folderId,
    },
  });

  const deleteFolder = prisma.folder.delete({
    where: {
      id: folderId,
    },
  });
  const transaction = await prisma.$transaction([
    deleteChildFolders,
    deleteChildFiles,
    deleteFolder,
  ]);
  res.redirect(`/folders/${folder.parentFolderId || "my-drive"}`);
});
