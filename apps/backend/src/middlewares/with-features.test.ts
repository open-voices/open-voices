import { Hono } from "hono";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { FORBIDDEN } from "../lib/const";

// Mock the prisma client
vi.mock("../lib/prisma", () => ({
  PRISMA: {
    installationSettings: {
      findMany: vi.fn(),
    },
  },
}));

import { PRISMA } from "../lib/prisma";
import { checkFeatures, withFeatures } from "./with-features";

describe("withFeatures", () => {
  let app: Hono;

  beforeEach(() => {
    app = new Hono();
    vi.clearAllMocks();
  });

  describe("withFeatures", () => {
    it("should create middleware that checks for enabled features", async () => {
      const mockSettings = [
        { name: "FEATURE_A", value: true },
        { name: "FEATURE_B", value: true },
      ];

      vi.mocked(PRISMA.installationSettings.findMany).mockResolvedValue(
        mockSettings
      );

      app.get("/test", withFeatures(["FEATURE_A", "FEATURE_B"]), (c) =>
        c.json({ success: true })
      );

      const res = await app.request("/test");

      expect(res.status).toBe(200);
      expect(await res.json()).toEqual({ success: true });
      expect(PRISMA.installationSettings.findMany).toHaveBeenCalledWith({
        where: {
          name: {
            in: ["FEATURE_A", "FEATURE_B"],
          },
        },
      });
    });

    it("should return 403 when required feature is disabled", async () => {
      const mockSettings = [{ name: "FEATURE_A", value: false }];

      vi.mocked(PRISMA.installationSettings.findMany).mockResolvedValue(
        mockSettings
      );

      app.get("/test", withFeatures(["FEATURE_A"]), (c) =>
        c.json({ success: true })
      );

      const res = await app.request("/test");

      expect(res.status).toBe(FORBIDDEN);
      expect(await res.json()).toEqual({
        error: "One or more required features are not enabled",
      });
    });
  });

  describe("checkFeatures", () => {
    it("should pass when all features match expected values", async () => {
      const mockSettings = [
        { name: "FEATURE_A", value: true },
        { name: "FEATURE_B", value: "enabled" },
      ];

      vi.mocked(PRISMA.installationSettings.findMany).mockResolvedValue(
        mockSettings
      );

      app.get(
        "/test",
        checkFeatures({ FEATURE_A: true, FEATURE_B: "enabled" }),
        (c) => c.json({ success: true })
      );

      const res = await app.request("/test");

      expect(res.status).toBe(200);
      expect(await res.json()).toEqual({ success: true });
    });

    it("should return 403 when feature value does not match", async () => {
      const mockSettings = [{ name: "FEATURE_A", value: false }];

      vi.mocked(PRISMA.installationSettings.findMany).mockResolvedValue(
        mockSettings
      );

      app.get("/test", checkFeatures({ FEATURE_A: true }), (c) =>
        c.json({ success: true })
      );

      const res = await app.request("/test");

      expect(res.status).toBe(FORBIDDEN);
      expect(await res.json()).toEqual({
        error: "One or more required features are not enabled",
      });
    });

    it("should pass when feature is not found in settings", async () => {
      vi.mocked(PRISMA.installationSettings.findMany).mockResolvedValue([]);

      app.get("/test", checkFeatures({ FEATURE_A: true }), (c) =>
        c.json({ success: true })
      );

      const res = await app.request("/test");

      expect(res.status).toBe(200);
      expect(await res.json()).toEqual({ success: true });
    });

    it("should handle multiple features with mixed results", async () => {
      const mockSettings = [
        { name: "FEATURE_A", value: true },
        { name: "FEATURE_B", value: false },
      ];

      vi.mocked(PRISMA.installationSettings.findMany).mockResolvedValue(
        mockSettings
      );

      app.get(
        "/test",
        checkFeatures({ FEATURE_A: true, FEATURE_B: true }),
        (c) => c.json({ success: true })
      );

      const res = await app.request("/test");

      expect(res.status).toBe(FORBIDDEN);
      expect(await res.json()).toEqual({
        error: "One or more required features are not enabled",
      });
    });
  });
});
