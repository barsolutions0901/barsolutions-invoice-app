const { PrismaClient } = require("@prisma/client");

const g = globalThis;
let prisma;

function getPrisma() {
  if (!prisma) {
    prisma = g.__prisma || new PrismaClient({
      log: ["error"],
      connectionTimeout: 10000,
    });
    if (process.env.NODE_ENV !== "production") g.__prisma = prisma;
  }
  return prisma;
}

module.exports = new Proxy(
  {},
  {
    get(_, prop) {
      return getPrisma()[prop];
    },
  }
);
