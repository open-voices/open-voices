import { testClient } from "hono/testing";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { BAD_REQUEST, CREATED, NOT_FOUND } from "../lib/const";

// Mock PRISMA database operations
vi.mock("../lib/prisma", () => {
  const mockPrisma = {
    website: {
      exists: vi.fn(),
      create: vi.fn(),
      findMany: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  };
  return {
    PRISMA: mockPrisma,
    __mocks: {
      mockPrisma,
    },
  };
});

vi.mock("../middlewares/acl.ts", () => {
  const ACL = () => async (c: any, next: any) => next();
  return {
      ACL: vi.fn(ACL),
  };
});

import { WEBSITES } from "./websites";

const __prisma = await import("../lib/prisma");
const { mockPrisma } = (__prisma as any).__mocks;

process.env.BASE_URL = "http://localhost:3000"; // Mock BASE_URL for tests

describe("WEBSITES router", () => {
  const client = testClient(WEBSITES);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("POST /websites", () => {
    const validWebsiteData = {
      name: "Test Website",
      url: "https://example.com",
      description: "A test website description",
      page_identifier_rules: [
        {
          url: "https://example.com/blog/**",
          format: "{dash($1)}",
        },
      ],
    };

    it("should create a new website successfully", async () => {
      mockPrisma.website.exists.mockResolvedValue(false);
      mockPrisma.website.create.mockResolvedValue({
        id: "clxxxxxxxxx",
        ...validWebsiteData,
      });

      const res = await client.websites.$post({
        json: validWebsiteData,
      });

      expect(res.status).toBe(CREATED);

      const responseData = await res.json();
      expect(responseData).toEqual({
        id: "clxxxxxxxxx",
        name: "Test Website",
        url: "https://example.com",
        description: "A test website description",
        page_identifier_rules: [
          {
            url: "https://example.com/blog/**",
            format: "{dash($1)}",
          },
        ],
      });

      // Verify database interactions
      expect(mockPrisma.website.exists).toHaveBeenCalledWith({
        url: validWebsiteData.url,
      });
      expect(mockPrisma.website.exists).toHaveBeenCalledWith({
        name: validWebsiteData.name,
      });
      expect(mockPrisma.website.create).toHaveBeenCalledWith({
        data: validWebsiteData,
      });
    });

    it("should return error when URL already exists", async () => {
      mockPrisma.website.exists.mockResolvedValueOnce(true); // URL exists

      const res = await client.websites.$post({
        json: validWebsiteData,
      });

      expect(res.status).toBe(BAD_REQUEST);

      const responseData = await res.json();
      expect(responseData).toEqual({
        error: "Website with this URL already exists",
      });

      expect(mockPrisma.website.create).not.toHaveBeenCalled();
    });

    it("should return error when name already exists", async () => {
      mockPrisma.website.exists
        .mockResolvedValueOnce(false) // URL doesn't exist
        .mockResolvedValueOnce(true); // Name exists

      const res = await client.websites.$post({
        json: validWebsiteData,
      });

      expect(res.status).toBe(BAD_REQUEST);

      const responseData = await res.json();
      expect(responseData).toEqual({
        error: "Website with this name already exists",
      });

      expect(mockPrisma.website.create).not.toHaveBeenCalled();
    });

    it("should validate required fields", async () => {
      const invalidData = {
        name: "", // Invalid empty name
        url: "not-a-url", // Invalid URL format
      };

      const res = await client.websites.$post({
        json: invalidData as any,
      });

      expect(res.status).toBe(400); // Validation error
      expect(mockPrisma.website.exists).not.toHaveBeenCalled();
      expect(mockPrisma.website.create).not.toHaveBeenCalled();
    });
  });

  describe("GET /websites", () => {
    it("should return all websites ordered by name", async () => {
      const mockWebsites = [
        {
          id: "website1",
          name: "A Website",
          url: "https://a-website.com",
          description: "First website",
          page_identifier_rules: ["rule1"],
        },
        {
          id: "website2",
          name: "B Website",
          url: "https://b-website.com",
          description: "Second website",
          page_identifier_rules: ["rule2"],
        },
      ];

      mockPrisma.website.findMany.mockResolvedValue(mockWebsites);

      const res = await client.websites.$get();

      expect(res.status).toBe(200);

      const responseData = await res.json();
      expect(responseData).toEqual(mockWebsites);

      expect(mockPrisma.website.findMany).toHaveBeenCalledWith({
        orderBy: { name: "asc" },
      });
    });

    it("should return empty array when no websites exist", async () => {
      mockPrisma.website.findMany.mockResolvedValue([]);

      const res = await client.websites.$get();

      expect(res.status).toBe(200);

      const responseData = await res.json();
      expect(responseData).toEqual([]);
    });
  });

  describe("GET /websites/:id", () => {
    const websiteId = "clxxxxxxxxx";
    const mockWebsite = {
      id: websiteId,
      name: "Test Website",
      url: "https://example.com",
      description: "A test website",
      page_identifier_rules: ["rule1"],
    };

    it("should return website by valid ID", async () => {
      mockPrisma.website.findUnique.mockResolvedValue(mockWebsite);

      const res = await client.websites[":id"].$get({
        param: { id: websiteId },
      });

      expect(res.status).toBe(200);

      const responseData = await res.json();
      expect(responseData).toEqual(mockWebsite);

      expect(mockPrisma.website.findUnique).toHaveBeenCalledWith({
        where: { id: websiteId },
      });
    });

    it("should return 404 when website not found", async () => {
      mockPrisma.website.findUnique.mockResolvedValue(null);

      const res = await client.websites[":id"].$get({
        param: { id: websiteId },
      });

      expect(res.status).toBe(NOT_FOUND);

      const responseData = await res.json();
      expect(responseData).toEqual({
        error: "Website not found",
      });
    });

    it("should validate ID format", async () => {
      const invalidId = "invalid-id-format";

      const res = await client.websites[":id"].$get({
        param: { id: invalidId },
      });

      expect(res.status).toBe(400); // Validation error
      expect(mockPrisma.website.findUnique).not.toHaveBeenCalled();
    });
  });

  describe("PUT /websites/:id", () => {
    const websiteId = "clxxxxxxxxx";
    const existingWebsite = {
      id: websiteId,
      name: "Old Name",
      url: "https://old.com",
      description: "Old description",
      page_identifier_rules: [{
          url: "https://example.com/blog/**",
          format: "{dash($1)}",
        },],
    };

    const updateData = {
      name: "New Name",
      url: "https://new.com",
      description: "New description",
      page_identifier_rules: [{
          url: "https://example.com/blog/**",
          format: "{snake($1)}",
        },],
    };

    it("should update website successfully", async () => {
      mockPrisma.website.findUnique.mockResolvedValue(existingWebsite);
      mockPrisma.website.exists.mockResolvedValue(false);
      mockPrisma.website.update.mockResolvedValue({
        ...existingWebsite,
        ...updateData,
      });

      const res = await client.websites[":id"].$put({
        param: { id: websiteId },
        json: updateData,
      });

      expect(res.status).toBe(200);

      const responseData = await res.json();
      expect(responseData).toEqual({
        ...existingWebsite,
        ...updateData,
      });

      expect(mockPrisma.website.update).toHaveBeenCalledWith({
        where: { id: websiteId },
        data: updateData,
      });
    });

    it("should return 404 when website not found", async () => {
      mockPrisma.website.findUnique.mockResolvedValue(null);

      const res = await client.websites[":id"].$put({
        param: { id: websiteId },
        json: updateData,
      });

      expect(res.status).toBe(NOT_FOUND);

      const responseData = await res.json();
      expect(responseData).toEqual({
        error: "Website not found",
      });

      expect(mockPrisma.website.update).not.toHaveBeenCalled();
    });

    it("should return error when updated URL already exists", async () => {
      mockPrisma.website.findUnique.mockResolvedValue(existingWebsite);
      mockPrisma.website.exists.mockResolvedValueOnce(true); // URL exists

      const res = await client.websites[":id"].$put({
        param: { id: websiteId },
        json: updateData,
      });

      expect(res.status).toBe(BAD_REQUEST);

      const responseData = await res.json();
      expect(responseData).toEqual({
        error: "Website with this URL already exists",
      });

      expect(mockPrisma.website.exists).toHaveBeenCalledWith({
        url: updateData.url,
        NOT: { id: websiteId },
      });
      expect(mockPrisma.website.update).not.toHaveBeenCalled();
    });

    it("should return error when updated name already exists", async () => {
      mockPrisma.website.findUnique.mockResolvedValue(existingWebsite);
      mockPrisma.website.exists
        .mockResolvedValueOnce(false) // URL doesn't exist
        .mockResolvedValueOnce(true); // Name exists

      const res = await client.websites[":id"].$put({
        param: { id: websiteId },
        json: updateData,
      });

      expect(res.status).toBe(BAD_REQUEST);

      const responseData = await res.json();
      expect(responseData).toEqual({
        error: "Website with this name already exists",
      });

      expect(mockPrisma.website.exists).toHaveBeenCalledWith({
        name: updateData.name,
        NOT: { id: websiteId },
      });
      expect(mockPrisma.website.update).not.toHaveBeenCalled();
    });

    it("should update only provided fields", async () => {
      const partialUpdate = { name: "Updated Name Only" };

      mockPrisma.website.findUnique.mockResolvedValue(existingWebsite);
      mockPrisma.website.exists.mockResolvedValue(false);
      mockPrisma.website.update.mockResolvedValue({
        ...existingWebsite,
        ...partialUpdate,
      });

      const res = await client.websites[":id"].$put({
        param: { id: websiteId },
        json: partialUpdate,
      });

      expect(res.status).toBe(200);
      expect(mockPrisma.website.update).toHaveBeenCalledWith({
        where: { id: websiteId },
        data: partialUpdate,
      });
    });

    it("should validate ID format for update", async () => {
      const invalidId = "invalid-id";

      const res = await client.websites[":id"].$put({
        param: { id: invalidId },
        json: updateData,
      });

      expect(res.status).toBe(400); // Validation error
      expect(mockPrisma.website.findUnique).not.toHaveBeenCalled();
    });
  });

  describe("DELETE /websites/:id", () => {
    const websiteId = "clxxxxxxxxx";
    const mockWebsite = {
      id: websiteId,
      name: "Test Website",
      url: "https://example.com",
      description: "A test website",
      page_identifier_rules: ["rule1"],
    };

    it("should delete website successfully", async () => {
      mockPrisma.website.findUnique.mockResolvedValue(mockWebsite);
      mockPrisma.website.delete.mockResolvedValue(mockWebsite);

      const res = await client.websites[":id"].$delete({
        param: { id: websiteId },
      });

      expect(res.status).toBe(200);

      const responseData = await res.json();
      expect(responseData).toEqual({
        message: "Website deleted successfully",
      });

      expect(mockPrisma.website.findUnique).toHaveBeenCalledWith({
        where: { id: websiteId },
      });
      expect(mockPrisma.website.delete).toHaveBeenCalledWith({
        where: { id: websiteId },
      });
    });

    it("should return 404 when website not found", async () => {
      mockPrisma.website.findUnique.mockResolvedValue(null);

      const res = await client.websites[":id"].$delete({
        param: { id: websiteId },
      });

      expect(res.status).toBe(NOT_FOUND);

      const responseData = await res.json();
      expect(responseData).toEqual({
        error: "Website not found",
      });

      expect(mockPrisma.website.delete).not.toHaveBeenCalled();
    });

    it("should validate ID format for delete", async () => {
      const invalidId = "invalid-id";

      const res = await client.websites[":id"].$delete({
        param: { id: invalidId },
      });

      expect(res.status).toBe(400); // Validation error
      expect(mockPrisma.website.findUnique).not.toHaveBeenCalled();
    });
  });

  describe("Database error handling", () => {
    it("should handle database errors during create", async () => {
      mockPrisma.website.exists.mockResolvedValue(false);
      mockPrisma.website.create.mockRejectedValue(
        new Error("Database connection failed")
      );

      const validWebsiteData = {
        name: "Test Website",
        url: "https://example.com",
        description: "A test website",
        page_identifier_rules: [{
          url: "https://example.com/blog/**",
          format: "{dash($1)}",
        },],
      };

      await expect(
        client.websites.$post({ json: validWebsiteData })
      ).resolves.toBeTruthy();

      const response = await client.websites.$post({ json: validWebsiteData })
      expect(response.status).toBe(500);
    });

    it("should handle database errors during findMany", async () => {
      mockPrisma.website.findMany.mockRejectedValue(
        new Error("Database connection failed")
      );

      await expect(client.websites.$get()).resolves.toBeTruthy();

      const response = await client.websites.$get()
      expect(response.status).toBe(500);
    });

    it("should handle database errors during update", async () => {
      const websiteId = "clxxxxxxxxx";
      mockPrisma.website.findUnique.mockResolvedValue({
        id: websiteId,
        name: "Test",
        url: "https://test.com",
        description: "Test",
        page_identifier_rules: [],
      });
      mockPrisma.website.exists.mockResolvedValue(false);
      mockPrisma.website.update.mockRejectedValue(
        new Error("Database connection failed")
      );

      await expect(
        client.websites[":id"].$put({
          param: { id: websiteId },
          json: { name: "New Name" },
        })
      ).resolves.toBeTruthy();

      const response = await client.websites[":id"].$put({
          param: { id: websiteId },
          json: { name: "New Name" },
        })
      expect(response.status).toBe(500);
    });
  });

  describe("Edge cases", () => {
    it("should handle websites with null/undefined optional fields", async () => {
      const websiteWithNulls = {
        id: "website1",
        name: "Test Website",
        url: "https://example.com",
        description: null,
        page_identifier_rules: null,
      };

      mockPrisma.website.findMany.mockResolvedValue([websiteWithNulls]);

      const res = await client.websites.$get();
      expect(res.status).toBe(200);

      const responseData = await res.json();
      expect(responseData).toEqual([websiteWithNulls]);
    });
  });
});
