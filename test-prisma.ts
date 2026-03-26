import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function test() {
  try {
    const user = await prisma.user.create({
      data: {
        email: "test_reg_" + Date.now() + "@example.com",
        password: "hashed_password",
        name: "Test User",
        role: "CUSTOMER",
      },
    });
    console.log("User created:", user);
  } catch (err) {
    console.error("Prisma error:", err);
  } finally {
    await prisma.$disconnect();
  }
}

test();
