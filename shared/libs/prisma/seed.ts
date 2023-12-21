import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
async function main() {
  const roles = await prisma.options.findMany();
  if (roles.length > 0) return;
  await prisma.options.createMany({
    data: [
      {
        optionName: "MANAGE_CLINIC",
        isServiceOption: false,
      },
      {
        optionName: "MANAGE_USER",
        isServiceOption: false,
      },
      {
        optionName: "MANAGE_ROLE",
        isServiceOption: false,
      },
      {
        optionName: "MANAGE_PLAN",
        isServiceOption: false,
      },
      {
        optionName: "MANAGE_SERVICE",
        isServiceOption: false,
      },
    ],
  });
}
main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
