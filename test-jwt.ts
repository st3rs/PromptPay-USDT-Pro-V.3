import jwt from "jsonwebtoken";

const JWT_SECRET = "test-secret";
const user = { id: "test-id", role: "CUSTOMER" };

try {
  const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET);
  console.log("Token:", token);
  const decoded = jwt.verify(token, JWT_SECRET);
  console.log("Decoded:", decoded);
} catch (err) {
  console.error("JWT error:", err);
}
