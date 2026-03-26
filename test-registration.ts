import { prisma } from "./src/lib/prisma";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "super-secret-key";

async function test() {
  const email = `test-${Date.now()}@example.com`;
  const password = "password123";
  const name = "Test User";

  try {
    console.log("Checking if user exists...");
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      console.log("Email already exists");
      return;
    }

    console.log("Hashing password...");
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log("Hashed password:", hashedPassword);

    console.log("Creating user...");
    const user = await prisma.user.create({
      data: { email, password: hashedPassword, name, role: "CUSTOMER" },
    });
    console.log("User created:", user);

    console.log("Signing token...");
    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET);
    console.log("Token signed:", token);

    console.log("Registration test successful!");
  } catch (err) {
    console.error("Registration test failed:", err);
  } finally {
    await prisma.$disconnect();
  }
}

test();
