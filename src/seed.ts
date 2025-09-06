import { PrismaClient } from "./generated/prisma";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  // Seed Admin
  const adminEmail = "admin@civic.local";
  const adminPassword = "Admin@12345";

  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    await prisma.user.create({
      data: {
        name: "System Admin",
        email: adminEmail,
        passwordHash: hashedPassword,
        role: "ADMIN",
      },
    });

    console.log(`✅ Admin user created: ${adminEmail} / ${adminPassword}`);
  } else {
    console.log(`ℹ️ Admin already exists: ${adminEmail}`);
  }

  // Seed Departments
  const departments = ["Sanitation", "Roads", "Electricity"];
  for (const name of departments) {
    const exists = await prisma.department.findUnique({ where: { name } });
    if (!exists) {
      await prisma.department.create({ data: { name } });
      console.log(`✅ Department created: ${name}`);
    }
  }
}

main()
  .catch((e) => {
    console.error("❌ Error seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
