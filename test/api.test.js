import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { createServer } from "../src/server.js";

describe("cors-sp API Tests", () => {
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

  it("root path returns landing html", async () => {
    const res = await fetch(serverAddress + "/", {
      headers: { Origin: "http://example.com" },
    });
    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toMatch(/text\/html/);
    const text = await res.text();
    expect(text).toContain("CORS Proxy Server");
  });

  it("invalid target url returns JSON error", async () => {
    const res = await fetch(`${serverAddress}/invalidurl`, {
      headers: { Origin: "http://example.com" },
    });
    expect(res.status).toBe(400);
    expect(res.headers.get("content-type")).toMatch(/application\/json/);
    const body = await res.json();
    expect(body).toHaveProperty("error", "invalid_target_url");
  });

  it("healthz endpoint returns ok", async () => {
    const res = await fetch(`${serverAddress}/healthz`);
    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toMatch(/application\/json/);
    const body = await res.json();
    expect(body).toHaveProperty("status", "ok");
    expect(typeof body.uptime).toBe("number");
  });

  it("metrics endpoint returns prometheus text", async () => {
    const res = await fetch(`${serverAddress}/metrics`);
    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toContain("text/plain");
    const text = await res.text();
    expect(text).toContain("cors_sp_requests_total");
  });
});
