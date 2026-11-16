import "dotenv/config";
import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "../src/generated/prisma/client";
import { seedProducts } from "./seed-data/products";

function createSeedClient() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error("DATABASE_URL não definida");
  return new PrismaClient({ adapter: new PrismaNeon({ connectionString }) });
}

async function createMissingProducts(prisma: PrismaClient) {
  for (const product of seedProducts) {
    await prisma.product.upsert({
      where: { slug: product.slug },
      create: product,
      update: {},
    });
  }
}

async function main() {
  const prisma = createSeedClient();
  try {
    await createMissingProducts(prisma);
    const total = await prisma.product.count();
    console.log(`Seed concluído: ${total} produtos no banco.`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
