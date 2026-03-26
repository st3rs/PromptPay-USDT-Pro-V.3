async function test() {
  const email = `test-api-${Date.now()}@example.com`;
  const password = "password123";
  const name = "Test API User";
  const confirmPassword = "password123";

  try {
    console.log("Making API call to /api/auth/register...");
    const res = await fetch("http://localhost:3000/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, name, confirmPassword }),
    });

    console.log("Response status:", res.status);
    const data = await res.json();
    console.log("Response data:", data);

    if (res.ok) {
      console.log("API Registration test successful!");
    } else {
      console.log("API Registration test failed!");
    }
  } catch (err) {
    console.error("API Registration test failed with error:", err);
  }
}

test();
