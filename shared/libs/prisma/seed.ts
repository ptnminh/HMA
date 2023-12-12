import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
async function main() {
  const roles = await prisma.clinicGroupRoles.findMany();
  if (roles.length > 0) return;
  await prisma.clinicGroupRoles.createMany({
    data: [
      {
        id: 1,
        name: "admin",
      },
      {
        id: 2,
        name: "nurse",
      },
      {
        id: 3,
        name: "doctor",
      },
      {
        id: 4,
        name: "unknown",
      },
      {
        id: 5,
        name: "guest",
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
