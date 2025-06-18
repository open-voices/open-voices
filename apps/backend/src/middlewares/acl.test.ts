import { beforeEach, describe, expect, it, vi } from "vitest";
import type { AccessControlPermissions } from "../lib/auth";
import { FORBIDDEN, UNAUTHORIZED } from "../lib/const";
import type { HonoEnv } from "../types/hono";
import type { Context } from "hono";

// Mock the auth module - define the mock function inside the factory
vi.mock("../lib/auth", () => {
  const mockUserHasPermission = vi.fn();
  return {
    auth: { 
      api: { 
        userHasPermission: mockUserHasPermission 
      } 
    },
    // Export the mock function so we can access it in tests
    __mockUserHasPermission: mockUserHasPermission
  };
});

import { ACL } from "./acl";

// Import the mock function
import { __mockUserHasPermission } from "../lib/auth";

const mockUserHasPermission = __mockUserHasPermission as any

process.env.BASE_URL = "http://localhost:3000"; // Mock BASE_URL for tests

describe("ACL middleware", () => {

  let next: ReturnType<typeof vi.fn>;
  let c: Context<HonoEnv>;

  beforeEach(() => {
    // Reset the mock before each test
    vi.clearAllMocks();

    next = vi.fn();
    c = {
      get: vi.fn(),
      json: vi.fn((body, status) => ({ body, status })),
    } as any;
  });

  it("should return UNAUTHORIZED if user is not set", async () => {
    (c.get as any).mockReturnValue(undefined);

    const middleware = ACL({});
    const result = await middleware(c, next);

    expect(result).toEqual({
      body: { error: "Authentication required" },
      status: UNAUTHORIZED,
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("should return FORBIDDEN if user is banned but is_banned is false", async () => {
    (c.get as any).mockReturnValue({ id: "1", banned: true });
    const permissions = { is_banned: false };

    const middleware = ACL(permissions);
    const result = await middleware(c, next);

    expect(result).toEqual({
      body: { error: "You do not have permissions to perform this action" },
      status: FORBIDDEN,
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("should return FORBIDDEN if user is not banned but is_banned is true", async () => {
    (c.get as any).mockReturnValue({ id: "1", banned: false });
    const permissions = { is_banned: true };

    const middleware = ACL(permissions);
    const result = await middleware(c, next);

    expect(result).toEqual({
      body: { error: "You do not have permissions to perform this action" },
      status: FORBIDDEN,
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("should call next if user is banned and is_banned is true", async () => {
    const user = { id: "1", banned: true };
    (c.get as any).mockReturnValue(user);

    mockUserHasPermission.mockResolvedValue({ success: true });

    const permissions = { is_banned: true };
    const middleware = ACL(permissions);
    await middleware(c, next);

    expect(next).toHaveBeenCalled();
    // Verify the API was called with the correct structure
    expect(mockUserHasPermission).toHaveBeenCalledWith({
      body: {
        userId: "1",
        permissions: {} // is_banned should be removed
      }
    });
  });

  it("should call next if user is not banned and is_banned is false", async () => {
    const user = { id: "1", banned: false };
    (c.get as any).mockReturnValue(user);

    mockUserHasPermission.mockResolvedValue({ success: true });

    const permissions = { is_banned: false };
    const middleware = ACL(permissions);
    await middleware(c, next);

    expect(next).toHaveBeenCalled();
    expect(mockUserHasPermission).toHaveBeenCalledWith({
      body: {
        userId: "1",
        permissions: {} // is_banned should be removed
      }
    });
  });

  it("should call auth.api.userHasPermission and return FORBIDDEN if not permitted", async () => {
    const user = { id: "1", banned: false };
    (c.get as any).mockReturnValue(user);

    mockUserHasPermission.mockResolvedValue({ success: false });

    const permissions: Partial<AccessControlPermissions> = {
      comments: [`admin.delete`],
    };
    const middleware = ACL(permissions);
    const result = await middleware(c, next);

    expect(mockUserHasPermission).toHaveBeenCalledWith({
      body: {
        userId: "1",
        permissions: { comments: ["admin.delete"] }
      }
    });
    expect(result).toEqual({
      body: { error: "You do not have permissions to perform this action" },
      status: FORBIDDEN,
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("should call next if user has permission", async () => {
    const user = { id: "1", banned: false };
    (c.get as any).mockReturnValue(user);

    mockUserHasPermission.mockResolvedValue({ success: true });

    const permissions: Partial<AccessControlPermissions> = {
      comments: [`admin.delete`],
    };
    const middleware = ACL(permissions);
    await middleware(c, next);

    expect(mockUserHasPermission).toHaveBeenCalledWith({
      body: {
        userId: "1",
        permissions: { comments: ["admin.delete"] }
      }
    });
    expect(next).toHaveBeenCalled();
  });

  it("should skip permission check when no permissions are provided", async () => {
    const user = { id: "1", banned: false };
    (c.get as any).mockReturnValue(user);

    mockUserHasPermission.mockResolvedValue({ success: true });

    const middleware = ACL({});
    await middleware(c, next);

    expect(mockUserHasPermission).toHaveBeenCalledWith({
      body: {
        userId: "1",
        permissions: {}
      }
    });
    expect(next).toHaveBeenCalled();
  });

  it("should handle auth API errors gracefully", async () => {
    const user = { id: "1", banned: false };
    (c.get as any).mockReturnValue(user);

    mockUserHasPermission.mockRejectedValue(new Error("API Error"));

    const permissions: Partial<AccessControlPermissions> = {
      comments: [`admin.delete`],
    };
    const middleware = ACL(permissions);

    await expect(middleware(c, next)).rejects.toThrow("You do not have permissions to perform this action");
    expect(next).not.toHaveBeenCalled();
  });

  it("should remove is_banned from permissions before API call", async () => {
    const user = { id: "1", banned: false };
    (c.get as any).mockReturnValue(user);

    mockUserHasPermission.mockResolvedValue({ success: true });

    const permissions = { is_banned: false, comments: [`create`] } as any;
    const middleware = ACL(permissions);
    await middleware(c, next);

    expect(mockUserHasPermission).toHaveBeenCalledWith({
      body: {
        userId: "1",
        permissions: { comments: ["create"] } // is_banned should be removed
      }
    });
    expect(next).toHaveBeenCalled();
  });

  it("should handle user with undefined banned property", async () => {
    const user = { id: "1", banned: undefined };
    (c.get as any).mockReturnValue(user);

    mockUserHasPermission.mockResolvedValue({ success: true });

    const permissions = { is_banned: false };
    const middleware = ACL(permissions);
    await middleware(c, next);

    expect(next).toHaveBeenCalled();
  });
});
