import "dotenv/config";
import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "../src/generated/prisma/client";
import { seedDeliveryCities } from "./seed-data/delivery-cities";
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

// Só cria o que falta: taxa ou cidade alterada pelo admin (Etapa 7) não é sobrescrita pelo seed.
async function createMissingDeliveryCities(prisma: PrismaClient) {
  for (const city of seedDeliveryCities) {
    await prisma.deliveryCity.upsert({
      where: { name_state: { name: city.name, state: city.state } },
      create: city,
      update: {},
    });
  }
}

async function main() {
  const prisma = createSeedClient();
  try {
    await createMissingProducts(prisma);
    await createMissingDeliveryCities(prisma);
    const products = await prisma.product.count();
    const cities = await prisma.deliveryCity.count();
    console.log(
      `Seed concluído: ${products} produtos e ${cities} cidades atendidas no banco.`,
    );
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
