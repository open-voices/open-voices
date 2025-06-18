import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { setup } from "./setup";

vi.mock("./lib/auth", () => ({
  auth: {
    api: {
      createUser: vi.fn(),
    },
  },
}));

vi.mock("./lib/prisma", () => ({
  PRISMA: {
    installationSettings: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
    user: {
      update: vi.fn(),
    },
  },
}));

import { auth } from "./lib/auth";
import { PRISMA } from "./lib/prisma";

describe("setup", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetAllMocks();
    process.env = { ...originalEnv };
    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(console, "warn").mockImplementation(() => {});
  });

  afterEach(() => {
    process.env = originalEnv;
    vi.restoreAllMocks();
  });

  it("should skip setup if installation settings already exist", async () => {
    vi.mocked(PRISMA.installationSettings.findUnique).mockResolvedValue({
      name: "IS_FIRST_SETUP_COMPLETED",
      value: true,
    });

    await setup();

    expect(console.warn).toHaveBeenCalledWith(
      "[!] Installation settings already exist. Skipping setup."
    );
    expect(auth.api.createUser).not.toHaveBeenCalled();
  });

  it("should throw error if DEFAULT_ADMIN_EMAIL is not set", async () => {
    vi.mocked(PRISMA.installationSettings.findUnique).mockResolvedValue(null);
    delete process.env.DEFAULT_ADMIN_EMAIL;

    await expect(setup()).rejects.toThrow(
      "DEFAULT_ADMIN_EMAIL environment variable is not set."
    );
  });

  it("should throw error if DEFAULT_ADMIN_PASSWORD is not set", async () => {
    vi.mocked(PRISMA.installationSettings.findUnique).mockResolvedValue(null);
    process.env.DEFAULT_ADMIN_EMAIL = "admin@test.com";
    delete process.env.DEFAULT_ADMIN_PASSWORD;

    await expect(setup()).rejects.toThrow(
      "DEFAULT_ADMIN_PASSWORD environment variable is not set."
    );
  });

  it("should create admin user and complete setup successfully", async () => {
    vi.mocked(PRISMA.installationSettings.findUnique).mockResolvedValue(null);
    process.env.DEFAULT_ADMIN_EMAIL = "admin@test.com";
    process.env.DEFAULT_ADMIN_PASSWORD = "password123";
    process.env.DEFAULT_ADMIN_NAME = "Test Admin";

    const mockUser = { user: { id: "user-123" } };
    vi.mocked(auth.api.createUser).mockResolvedValue(mockUser);
    vi.mocked(PRISMA.user.update).mockResolvedValue({} as any);
    vi.mocked(PRISMA.installationSettings.create).mockResolvedValue({} as any);

    await setup();

    expect(auth.api.createUser).toHaveBeenCalledWith({
      body: {
        name: "Test Admin",
        email: "admin@test.com",
        password: "password123",
        role: "admin",
      },
    });

    expect(PRISMA.user.update).toHaveBeenCalledWith({
      where: { id: "user-123" },
      data: { emailVerified: true },
    });

    expect(PRISMA.installationSettings.create).toHaveBeenCalledWith({
      data: {
        name: "IS_FIRST_SETUP_COMPLETED",
        value: true,
      },
    });
  });

  it("should use default admin name when DEFAULT_ADMIN_NAME is not set", async () => {
    vi.mocked(PRISMA.installationSettings.findUnique).mockResolvedValue(null);
    process.env.DEFAULT_ADMIN_EMAIL = "admin@test.com";
    process.env.DEFAULT_ADMIN_PASSWORD = "password123";
    delete process.env.DEFAULT_ADMIN_NAME;

    const mockUser = { user: { id: "user-123" } };
    vi.mocked(auth.api.createUser).mockResolvedValue(mockUser);
    vi.mocked(PRISMA.user.update).mockResolvedValue({} as any);
    vi.mocked(PRISMA.installationSettings.create).mockResolvedValue({} as any);

    await setup();

    expect(auth.api.createUser).toHaveBeenCalledWith({
      body: {
        name: "Admin",
        email: "admin@test.com",
        password: "password123",
        role: "admin",
      },
    });
  });
});
