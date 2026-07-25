const request = require("supertest");
const app = require("../app");

describe("Auth", () => {
  it("rejects signup with short password", async () => {
    const res = await request(app)
      .post("/auth/signup")
      .send({
        email: "t@t.com",
        password: "short",
      });

    expect(res.status).toBe(400);
    expect(res.body.error).toBeTruthy();
  });

  const pool = require("../db/pool");

  afterAll(async () => {
    await pool.end();
  });

  it("signs up and logs in", async () => {
    const email = `test-${Date.now()}@t.com`;

    const signup = await request(app)
      .post("/auth/signup")
      .send({
        email,
        password: "longenough",
      });

    expect(signup.status);
    expect(signup.body);

    const login = await request(app)
      .post("/auth/login")
      .send({
        email,
        password: "longenough",
      });

    expect(login.status).toBe(200);
    expect(login.body.token).toBeTruthy();
    expect(typeof login.body.token).toBe("string");
  });

  it("rejects wrong password", async () => {
    const res = await request(app)
      .post("/auth/login")
      .send({
        email: "never@t.com",
        password: "wrong",
      });

    expect(res.status).toBe(401);
    expect(res.body.error).toBeTruthy();
  });
});
