import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const startDate = new Date('2026-05-01');
    const endDate = new Date('2026-07-31');
    const userId = '6959ea24f4fd213a9d14e701';

    const todosWithDates = await prisma.todo.findMany({
        where: {
            userId: userId,
            dueDate: { gte: startDate, lte: endDate },
            OR: [
                { renewInterval: { isSet: false } },
                { renewInterval: null }
            ]
        },
    });

    console.log("Todos from query (with isSet/null check):", todosWithDates.length);
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
