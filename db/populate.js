import { PrismaClient, Prisma } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Check if posts should be included in the query
  if (includePosts) {
    user = {
      email: "elsa@prisma.io",
      name: "Elsa Prisma",
      posts: {
        create: {
          title: "Include this post!",
        },
      },
    };
  } else {
    user = {
      email: "elsa@prisma.io",
      name: "Elsa Prisma",
    };
  }

  // Pass 'user' object into query
  const createUser = await prisma.folder.create({ data: {} });
}

main();
