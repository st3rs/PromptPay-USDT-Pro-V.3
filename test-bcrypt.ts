import bcrypt from "bcryptjs";

async function test() {
  try {
    const hashed = await bcrypt.hash("test123456", 10);
    console.log("Hashed:", hashed);
    const match = await bcrypt.compare("test123456", hashed);
    console.log("Match:", match);
  } catch (err) {
    console.error("Bcrypt error:", err);
  }
}

test();
