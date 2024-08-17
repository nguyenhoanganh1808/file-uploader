const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient().$extends({
  result: {
    folder: {
      diff: {
        needs: { expiredDateShare: true },
        compute(folder) {
          if (folder.expiredDateShare) {
            const now = new Date();
            const expiredDate = new Date(folder.expiredDateShare);

            const diffTime = expiredDate - now;

            if (diffTime <= 0) {
              return null;
            }

            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); // difftimes in days

            if (diffDays <= 1) {
              return Math.ceil(diffTime / (1000 * 60 * 60)) + " hours";
            }

            return diffDays + " days";
          }
          return null;
        },
      },
    },
  },
});

module.exports = prisma;
