import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
    const events = await prisma.event.findMany({ where: { categoryId: null }});
    console.log("Events with null categoryId:", events);
}
main().then(() => prisma.$disconnect());
