import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { createServer } from "../src/server.js";

describe("CORS Anywhere API Tests", () => {
  let server;
  let serverAddress;

  beforeAll(async () => {
    return new Promise((resolve) => {
      const port = 0; // Use port 0 to let the OS assign a random free port
      server = createServer({}).listen(port, () => {
        const address = server.address();
        serverAddress = `http://localhost:${address.port}`;
        console.log(`Test server running on ${serverAddress}`);
        resolve();
      });
    });
  });

  afterAll(() => {
    return new Promise((resolve) => {
      server.close(() => {
        console.log("Test server closed.");
        resolve();
      });
    });
  });

  it("should respond with usage information for the root path", async () => {
    const res = await fetch(serverAddress + "/http://example.com", {
      headers: { Origin: "http://example.com" },
    });
    expect(res.status).toBe(200);
    const text = await res.text();
    expect(text).toContain("<html>");
  });

  it("should return 404 for invalid proxy requests", async () => {
    const res = await fetch(`${serverAddress}/invalidurl`, {
      headers: { Origin: "http://example.com" },
    });
    expect(res.status).toBe(400);
    const text = await res.text();
    expect(text).toContain("Invalid target URL");
  });
});
