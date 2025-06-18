import { type Context } from "hono";
import { HTTPException } from "hono/http-exception";
import { describe, expect, it, vi } from "vitest";
import { ensureUserIsAuthenticated } from "./ensure-user-is-authenticated.ts";

describe("ensureUserIsAuthenticated", () => {
  it("should call next() when user and session are present", async () => {
    const mockNext = vi.fn();
    const mockContext = {
      get: vi.fn((key: string) => {
        if (key === "user") return { id: 1 };
        if (key === "session") return { id: "session-123" };
        return null;
      }),
    } as unknown as Context;

    await ensureUserIsAuthenticated(mockContext, mockNext);

    expect(mockNext).toHaveBeenCalledOnce();
  });

  it("should throw HTTPException when user is missing", async () => {
    const mockNext = vi.fn();
    const mockContext = {
      get: vi.fn((key: string) => {
        if (key === "user") return null;
        if (key === "session") return { id: "session-123" };
        return null;
      }),
    } as unknown as Context;

    await expect(
      ensureUserIsAuthenticated(mockContext, mockNext)
    ).rejects.toThrow(HTTPException);
    await expect(
      ensureUserIsAuthenticated(mockContext, mockNext)
    ).rejects.toThrow("Authentication required");
    expect(mockNext).not.toHaveBeenCalled();
  });

  it("should throw HTTPException when session is missing", async () => {
    const mockNext = vi.fn();
    const mockContext = {
      get: vi.fn((key: string) => {
        if (key === "user") return { id: 1 };
        if (key === "session") return null;
        return null;
      }),
    } as unknown as Context;

    await expect(
      ensureUserIsAuthenticated(mockContext, mockNext)
    ).rejects.toThrow(HTTPException);
    await expect(
      ensureUserIsAuthenticated(mockContext, mockNext)
    ).rejects.toThrow("Authentication required");
    expect(mockNext).not.toHaveBeenCalled();
  });

  it("should throw HTTPException when both user and session are missing", async () => {
    const mockNext = vi.fn();
    const mockContext = {
      get: vi.fn(() => null),
    } as unknown as Context;

    await expect(
      ensureUserIsAuthenticated(mockContext, mockNext)
    ).rejects.toThrow(HTTPException);
    await expect(
      ensureUserIsAuthenticated(mockContext, mockNext)
    ).rejects.toThrow("Authentication required");
    expect(mockNext).not.toHaveBeenCalled();
  });

  it("should throw 401 status code", async () => {
    const mockNext = vi.fn();
    const mockContext = {
      get: vi.fn(() => null),
    } as unknown as Context;

    try {
      await ensureUserIsAuthenticated(mockContext, mockNext);
    } catch (error) {
      expect(error).toBeInstanceOf(HTTPException);
      expect((error as HTTPException).status).toBe(401);
    }
  });
});
