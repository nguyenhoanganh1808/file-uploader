const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

exports.updateFolderAndChildren = async (folderId, data) => {
  const folderWithChildren = await fetchFolderWithChildren(folderId);

  if (!folderWithChildren) {
    throw new Error("Folder not found");
  }

  await prisma.$transaction(async (tx) => {
    await tx.folder.update({
      where: { id: folderId },
      data: data,
    });

    for (const child of folderWithChildren) {
      await tx.folder.update({
        where: { id: child.id },
        data: data,
      });
    }
  });

  return await prisma.folder.findUnique({ where: { id: folderId } });
};

async function fetchFolderWithChildren(folderId) {
  const folders = [];

  async function findChildren(parentId) {
    const children = await prisma.folder.findMany({
      where: { parentFolderId: parentId },
      include: { childFolders: true },
    });

    for (const child of children) {
      folders.push(child);
      // Recursively find the children of the child folder
      await findChildren(child.id);
    }
  }

  await findChildren(folderId);
  return folders;
}
