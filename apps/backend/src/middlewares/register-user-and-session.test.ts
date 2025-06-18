import { Hono } from "hono";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../lib/auth", () => ({
  auth: {
    api: {
      getSession: vi.fn(),
    },
  },
}));

import { auth } from "../lib/auth";
import { registerUserAndSession } from "./register-user-and-session";
import type { HonoEnv } from "../types/hono";

describe("registerUserAndSession middleware", () => {
  let app: Hono<HonoEnv>;

  beforeEach(() => {
    app = new Hono();
    vi.clearAllMocks();
  });

  it("should set user and session to null when no session exists", async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue(null);

    app.use(registerUserAndSession);
    app.get("/", (c) => {
      return c.json({
        user: c.get("user"),
        session: c.get("session"),
      });
    });

    const res = await app.request("/");
    const data = await res.json();

    expect(data.user).toBeNull();
    expect(data.session).toBeNull();
    expect(auth.api.getSession).toHaveBeenCalledWith({
      headers: expect.any(Headers),
    });
  });

  it("should set user and session when session exists", async () => {
    const mockUser = { id: "1", email: "test@example.com" };
    const mockSession = { id: "session-1", userId: "1" };

    vi.mocked(auth.api.getSession).mockResolvedValue({
      user: mockUser,
      session: mockSession,
    });

    app.use(registerUserAndSession);
    app.get("/", (c) => {
      return c.json({
        user: c.get("user"),
        session: c.get("session"),
      });
    });

    const res = await app.request("/");
    const data = await res.json();

    expect(data.user).toEqual(mockUser);
    expect(data.session).toEqual(mockSession);
    expect(auth.api.getSession).toHaveBeenCalledWith({
      headers: expect.any(Headers),
    });
  });

  it("should call next middleware in both cases", async () => {
    const nextSpy = vi.fn();

    vi.mocked(auth.api.getSession).mockResolvedValue(null);

    app.use(registerUserAndSession);
    app.use(nextSpy);

    await app.request("/");

    expect(nextSpy).toHaveBeenCalled();
  });
});
