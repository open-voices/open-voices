import { testClient } from "hono/testing";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { BAD_REQUEST, CREATED, NOT_FOUND } from "../lib/const";
import { COMMENTS } from "./comments";

// Mock PRISMA database operations
vi.mock("../lib/prisma", () => {
  const mockPrisma = {
    website: {
      findUnique: vi.fn(),
    },
    comment: {
      create: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    commentInteraction: {
      upsert: vi.fn(),
    },
  };
  return {
    PRISMA: mockPrisma,
    __mocks: {
      mockPrisma,
    },
  };
});

vi.mock("../middlewares/acl", () => {
  const ACL = () => async (c: any, next: any) => {
    // Mock user context for authenticated endpoints
    c.set("user", { id: "user123" });
    return next();
  };
  return {
    ACL: vi.fn(ACL),
  };
});

vi.mock("../middlewares/with-features", () => {
  const withFeatures = () => async (c: any, next: any) => next();
  return {
    withFeatures: vi.fn(withFeatures),
  };
});

vi.mock("../lib/glob-match", () => ({
  formatUrlMatch: vi.fn(),
}));

const __prisma = await import("../lib/prisma");
const { mockPrisma } = (__prisma as any).__mocks;

const __globMatch = await import("../lib/glob-match");
const { formatUrlMatch } = __globMatch;

process.env.BASE_URL = "http://localhost:3000";

describe("COMMENTS router", () => {
  const client = testClient(COMMENTS);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("POST /:website_id", () => {
    const websiteId = "website123";
    const validCommentData = {
      content: "This is a test comment",
      url: "https://example.com/blog/test-post",
    };

    const mockWebsite = {
      id: websiteId,
      name: "Test Website",
      page_identifier_rules: [{ url: "**", format: "{$1}" }],
    };

    it("should create a new comment successfully", async () => {
      mockPrisma.website.findUnique.mockResolvedValue(mockWebsite);
      (formatUrlMatch as any).mockReturnValue("blog-test-post");
      mockPrisma.comment.create.mockResolvedValue({
        id: "comment123",
        page_identifier: "blog-test-post",
        content: validCommentData.content,
      });

      const res = await client.comments[":website_id"].$post({
        param: { website_id: websiteId },
        json: validCommentData,
      });

      expect(res.status).toBe(CREATED);

      const responseData = await res.json();
      expect(responseData).toEqual({
        id: "comment123",
        page_identifier: "blog-test-post",
        content: validCommentData.content,
      });

      expect(mockPrisma.website.findUnique).toHaveBeenCalledWith({
        where: { id: websiteId },
      });
      expect(formatUrlMatch).toHaveBeenCalledWith(
        mockWebsite,
        validCommentData.url
      );
      expect(mockPrisma.comment.create).toHaveBeenCalledWith({
        data: {
          page_identifier: "blog-test-post",
          content: validCommentData.content,
          website_id: websiteId,
          author_id: "user123",
        },
      });
    });

    it("should return 404 when website not found", async () => {
      mockPrisma.website.findUnique.mockResolvedValue(null);

      const res = await client.comments[":website_id"].$post({
        param: { website_id: websiteId },
        json: validCommentData,
      });

      expect(res.status).toBe(NOT_FOUND);

      const responseData = await res.json();
      expect(responseData).toEqual({
        error: "Website not found",
      });

      expect(mockPrisma.comment.create).not.toHaveBeenCalled();
    });

    it("should return error when URL doesn't match identifier rules", async () => {
      mockPrisma.website.findUnique.mockResolvedValue(mockWebsite);
      (formatUrlMatch as any).mockReturnValue(null);

      const res = await client.comments[":website_id"].$post({
        param: { website_id: websiteId },
        json: validCommentData,
      });

      expect(res.status).toBe(BAD_REQUEST);

      const responseData = await res.json();
      expect(responseData).toEqual({
        error: "Page URL does not match any identifier rules for this website",
      });

      expect(mockPrisma.comment.create).not.toHaveBeenCalled();
    });

    it("should validate required fields", async () => {
      const invalidData = {
        content: "", // Empty content
        url: "not-a-url", // Invalid URL
      };

      const res = await client.comments[":website_id"].$post({
        param: { website_id: websiteId },
        json: invalidData as any,
      });

      expect(res.status).toBe(400);
      expect(mockPrisma.website.findUnique).not.toHaveBeenCalled();
    });
  });

  describe("GET /:website_id/:url", () => {
    const websiteId = "website123";
    const url = encodeURIComponent("https://example.com/blog-test-post");
    const mockWebsite = {
      id: websiteId,
      name: "Test Website",
      page_identifier_rules: [{ url: "**", format: "{$1}" }],
    };

    it("should return comments for valid website and URL", async () => {
      const mockComments = [
        {
          id: "comment1",
          page_identifier: "blog-test-post",
          content: "First comment",
          created_at: new Date("2023-01-01"),
          author: { id: "user1", name: "User 1" },
        },
        {
          id: "comment2",
          page_identifier: "blog-test-post",
          content: "Second comment",
          created_at: new Date("2023-01-02"),
          author: { id: "user2", name: "User 2" },
        },
      ];

      mockPrisma.website.findUnique.mockResolvedValue(mockWebsite);
      (formatUrlMatch as any).mockReturnValue("blog-test-post");
      mockPrisma.comment.findMany.mockResolvedValue(mockComments);

      const res = await client.comments[":website_id"][":url"].$get({
        param: { website_id: websiteId, url },
        query: { page: "1", limit: "10" },
      });

      expect(res.status).toBe(200);

      const responseData = await res.json();
      expect(responseData).toEqual([
        {
          id: "comment1",
          page_identifier: "blog-test-post",
          content: "First comment",
          created_at: new Date("2023-01-01").toISOString(),
          author: { id: "user1", name: "User 1" },
        },
        {
          id: "comment2",
          page_identifier: "blog-test-post",
          content: "Second comment",
          created_at: new Date("2023-01-02").toISOString(),
          author: { id: "user2", name: "User 2" },
        },
      ]);

      expect(mockPrisma.comment.findMany).toHaveBeenCalledWith({
        where: {
          website_id: websiteId,
          page_identifier: "blog-test-post",
          author: {
            OR: [{ banned: null }, { banned: false }],
          },
        },
        include: {
          author: {
            select: { id: true, name: true },
          },
        },
        orderBy: { created_at: "desc" },
        skip: 0,
        take: 10,
      });
    });

    it("should return empty array when no comments exist", async () => {
      mockPrisma.website.findUnique.mockResolvedValue(mockWebsite);
      (formatUrlMatch as any).mockReturnValue("blog-test-post");
      mockPrisma.comment.findMany.mockResolvedValue([]);

      const res = await client.comments[":website_id"][":url"].$get({
        param: { website_id: websiteId, url },
        query: { page: "1", limit: "10" },
      });

      expect(res.status).toBe(200);

      const responseData = await res.json();
      expect(responseData).toEqual([]);
    });

    it("should handle pagination correctly", async () => {
      mockPrisma.website.findUnique.mockResolvedValue(mockWebsite);
      (formatUrlMatch as any).mockReturnValue("blog-test-post");
      mockPrisma.comment.findMany.mockResolvedValue([]);

      const res = await client.comments[":website_id"][":url"].$get({
        param: { website_id: websiteId, url },
        query: { page: "2", limit: "5" },
      });

      expect(res.status).toBe(200);

      expect(mockPrisma.comment.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 5, // (page - 1) * limit = (2 - 1) * 5
          take: 5,
        })
      );
    });

    it("should return 404 when website not found", async () => {
      mockPrisma.website.findUnique.mockResolvedValue(null);

      const res = await client.comments[":website_id"][":url"].$get({
        param: { website_id: websiteId, url },
        query: { page: "1", limit: "10" },
      });

      expect(res.status).toBe(NOT_FOUND);

      const responseData = await res.json();
      expect(responseData).toEqual({
        error: "Website not found",
      });
    });

    it("should return error when URL doesn't match identifier rules", async () => {
      mockPrisma.website.findUnique.mockResolvedValue(mockWebsite);
      (formatUrlMatch as any).mockReturnValue(null);

      const res = await client.comments[":website_id"][":url"].$get({
        param: { website_id: websiteId, url },
        query: { page: "1", limit: "10" },
      });

      expect(res.status).toBe(BAD_REQUEST);

      const responseData = await res.json();
      expect(responseData).toEqual({
        error: "Page URL does not match any identifier rules for this website",
      });
    });
  });

  describe("PUT /:website_id/:comment_id", () => {
    const websiteId = "website123";
    const commentId = "comment123";
    const mockWebsite = {
      id: websiteId,
      name: "Test Website",
    };

    const updateData = {
      content: "Updated comment content",
    };

    it("should update comment successfully", async () => {
      mockPrisma.website.findUnique.mockResolvedValue(mockWebsite);
      mockPrisma.comment.update.mockResolvedValue({
        id: commentId,
        content: updateData.content,
      });

      const res = await client.comments[":website_id"][":comment_id"].$put({
        param: { website_id: websiteId, comment_id: commentId },
        json: updateData,
      });

      expect(res.status).toBe(200);

      const responseData = await res.json();
      expect(responseData).toEqual({
        id: commentId,
        content: updateData.content,
      });

      expect(mockPrisma.comment.update).toHaveBeenCalledWith({
        where: {
          id: commentId,
          author_id: "user123",
          website_id: websiteId,
        },
        data: {
          content: updateData.content,
        },
      });
    });

    it("should return 404 when website not found", async () => {
      mockPrisma.website.findUnique.mockResolvedValue(null);

      const res = await client.comments[":website_id"][":comment_id"].$put({
        param: { website_id: websiteId, comment_id: commentId },
        json: updateData,
      });

      expect(res.status).toBe(NOT_FOUND);

      const responseData = await res.json();
      expect(responseData).toEqual({
        error: "Website not found",
      });

      expect(mockPrisma.comment.update).not.toHaveBeenCalled();
    });

    it("should return 404 when comment not found or user is not author", async () => {
      mockPrisma.website.findUnique.mockResolvedValue(mockWebsite);
      mockPrisma.comment.update.mockRejectedValue(
        new Error("Comment not found")
      );

      const res = await client.comments[":website_id"][":comment_id"].$put({
        param: { website_id: websiteId, comment_id: commentId },
        json: updateData,
      });

      expect(res.status).toBe(NOT_FOUND);

      const responseData = await res.json();
      expect(responseData).toEqual({
        error: "Comment not found or you are not the author of this comment",
      });
    });
  });

  describe("DELETE /:website_id/:comment_id", () => {
    const websiteId = "website123";
    const commentId = "comment123";
    const mockWebsite = {
      id: websiteId,
      name: "Test Website",
    };

    it("should delete comment successfully", async () => {
      mockPrisma.website.findUnique.mockResolvedValue(mockWebsite);
      mockPrisma.comment.delete.mockResolvedValue({
        id: commentId,
      });

      const res = await client.comments[":website_id"][":comment_id"].$delete({
        param: { website_id: websiteId, comment_id: commentId },
      });

      expect(res.status).toBe(200);

      const responseData = await res.json();
      expect(responseData).toEqual({
        id: commentId,
        message: "Comment deleted successfully",
      });

      expect(mockPrisma.comment.delete).toHaveBeenCalledWith({
        where: {
          id: commentId,
          author_id: "user123",
          website_id: websiteId,
        },
      });
    });

    it("should return 404 when website not found", async () => {
      mockPrisma.website.findUnique.mockResolvedValue(null);

      const res = await client.comments[":website_id"][":comment_id"].$delete({
        param: { website_id: websiteId, comment_id: commentId },
      });

      expect(res.status).toBe(NOT_FOUND);

      const responseData = await res.json();
      expect(responseData).toEqual({
        error: "Website not found",
      });

      expect(mockPrisma.comment.delete).not.toHaveBeenCalled();
    });

    it("should return 404 when comment not found or user is not author", async () => {
      mockPrisma.website.findUnique.mockResolvedValue(mockWebsite);
      mockPrisma.comment.delete.mockRejectedValue(
        new Error("Comment not found")
      );

      const res = await client.comments[":website_id"][":comment_id"].$delete({
        param: { website_id: websiteId, comment_id: commentId },
      });

      expect(res.status).toBe(NOT_FOUND);

      const responseData = await res.json();
      expect(responseData).toEqual({
        error: "Comment not found or you are not the author of this comment",
      });
    });
  });

  describe("PUT /:website_id/:comment_id/interact", () => {
    const websiteId = "website123";
    const commentId = "comment123";
    const mockWebsite = {
      id: websiteId,
      name: "Test Website",
    };

    const interactionData = {
      type: "LIKE",
    } as const;

    it("should record interaction successfully", async () => {
      mockPrisma.website.findUnique.mockResolvedValue(mockWebsite);
      mockPrisma.commentInteraction.upsert.mockResolvedValue({});

      const res = await client.comments[":website_id"][
        ":comment_id"
      ].interact.$put({
        param: { website_id: websiteId, comment_id: commentId },
        json: interactionData,
      });

      expect(res.status).toBe(200);

      const responseData = await res.json();
      expect(responseData).toEqual({
        message: "Interaction recorded successfully",
      });

      expect(mockPrisma.commentInteraction.upsert).toHaveBeenCalledWith({
        where: {
          comment_id_user_id: {
            user_id: "user123",
            comment_id: commentId,
          },
        },
        create: {
          user_id: "user123",
          comment_id: commentId,
          type: "LIKE",
        },
        update: {
          type: "LIKE",
        },
      });
    });

    it("should return 404 when website not found", async () => {
      mockPrisma.website.findUnique.mockResolvedValue(null);

      const res = await client.comments[":website_id"][
        ":comment_id"
      ].interact.$put({
        param: { website_id: websiteId, comment_id: commentId },
        json: interactionData,
      });

      expect(res.status).toBe(NOT_FOUND);

      const responseData = await res.json();
      expect(responseData).toEqual({
        error: "Website not found",
      });

      expect(mockPrisma.commentInteraction.upsert).not.toHaveBeenCalled();
    });
  });

  describe("GET /admin/:website_id", () => {
    const websiteId = "website123";
    const mockWebsite = {
      id: websiteId,
      name: "New Name",
    };

    it("should return admin comments list", async () => {
      const mockComments = [
        {
          id: "comment1",
          page_identifier: "blog-test",
          website_id: websiteId,
          content: "Admin comment 1",
          created_at: new Date("2023-01-01"),
          author: { id: "user1", name: "User 1" },
          interactions: [],
        },
      ];

      mockPrisma.website.findUnique.mockResolvedValue(mockWebsite);
      mockPrisma.comment.findMany.mockResolvedValue(mockComments);

      const res = await client.comments.admin[":website_id"].$get({
        param: { website_id: websiteId },
        query: { page: "1", limit: "10" },
      });

      expect(res.status).toBe(200);

      const responseData = await res.json();
      expect(responseData).toEqual([
        {
          id: "comment1",
          page_identifier: "blog-test",
          content: "Admin comment 1",
          created_at: new Date("2023-01-01").toISOString(),
          author: { id: "user1", name: "User 1" },
          interactions: [],
        },
      ]);
    });

    it("should include banned authors when specified", async () => {
      mockPrisma.website.findUnique.mockResolvedValue(mockWebsite);
      mockPrisma.comment.findMany.mockResolvedValue([]);

      const res = await client.comments.admin[":website_id"].$get({
        param: { website_id: websiteId },
        query: { page: "1", limit: "10", includes: "banned" },
      });

      console.log(await res.json());

      expect(res.status).toBe(200);

      expect(mockPrisma.comment.findMany).toHaveBeenCalledWith({
        where: {
          website_id: websiteId,
        },
        include: {
          author: {
            select: { id: true, name: true },
          },
          interactions: {
            select: { type: true, user: { select: { id: true, name: true } } },
          },
        },
        orderBy: { created_at: "desc" },
        skip: 0,
        take: 10,
      });
    });

    it("should return 404 when website not found", async () => {
      mockPrisma.website.findUnique.mockResolvedValue(null);

      const res = await client.comments.admin[":website_id"].$get({
        param: { website_id: websiteId },
        query: { page: "1", limit: "10" },
      });

      expect(res.status).toBe(NOT_FOUND);

      const responseData = await res.json();
      expect(responseData).toEqual({
        error: "Website not found",
      });
    });
  });

  describe("DELETE /admin/:website_id/:comment_id", () => {
    const websiteId = "website123";
    const commentId = "comment123";
    const mockWebsite = {
      id: websiteId,
      name: "Test Website",
    };

    it("should delete comment as admin successfully", async () => {
      mockPrisma.website.findUnique.mockResolvedValue(mockWebsite);
      mockPrisma.comment.delete.mockResolvedValue({
        id: commentId,
      });

      const res = await client.comments.admin[":website_id"][
        ":comment_id"
      ].$delete({
        param: { website_id: websiteId, comment_id: commentId },
      });

      expect(res.status).toBe(200);

      const responseData = await res.json();
      expect(responseData).toEqual({
        id: commentId,
        message: "Comment deleted successfully",
      });

      expect(mockPrisma.comment.delete).toHaveBeenCalledWith({
        where: {
          id: commentId,
          website_id: websiteId,
        },
      });
    });

    it("should return 404 when website not found", async () => {
      mockPrisma.website.findUnique.mockResolvedValue(null);

      const res = await client.comments.admin[":website_id"][
        ":comment_id"
      ].$delete({
        param: { website_id: websiteId, comment_id: commentId },
      });

      expect(res.status).toBe(NOT_FOUND);

      const responseData = await res.json();
      expect(responseData).toEqual({
        error: "Website not found",
      });

      expect(mockPrisma.comment.delete).not.toHaveBeenCalled();
    });
  });

  describe("PUT /admin/:website_id/:comment_id", () => {
    const websiteId = "website123";
    const commentId = "comment123";
    const mockWebsite = {
      id: websiteId,
      name: "Test Website",
    };

    const updateData = {
      content: "Admin updated content",
    };

    it("should update comment as admin successfully", async () => {
      mockPrisma.website.findUnique.mockResolvedValue(mockWebsite);
      mockPrisma.comment.update.mockResolvedValue({
        id: commentId,
        content: updateData.content,
      });

      const res = await client.comments.admin[":website_id"][
        ":comment_id"
      ].$put({
        param: { website_id: websiteId, comment_id: commentId },
        json: updateData,
      });

      expect(res.status).toBe(200);

      const responseData = await res.json();
      expect(responseData).toEqual({
        id: commentId,
        content: updateData.content,
      });

      expect(mockPrisma.comment.update).toHaveBeenCalledWith({
        where: {
          id: commentId,
          website_id: websiteId,
        },
        data: {
          content: updateData.content,
        },
      });
    });

    it("should return 404 when website not found", async () => {
      mockPrisma.website.findUnique.mockResolvedValue(null);

      const res = await client.comments.admin[":website_id"][
        ":comment_id"
      ].$put({
        param: { website_id: websiteId, comment_id: commentId },
        json: updateData,
      });

      expect(res.status).toBe(NOT_FOUND);

      const responseData = await res.json();
      expect(responseData).toEqual({
        error: "Website not found",
      });

      expect(mockPrisma.comment.update).not.toHaveBeenCalled();
    });
  });

  describe("Database error handling", () => {
    it("should handle database errors during comment creation", async () => {
      const websiteId = "website123";
      const validCommentData = {
        content: "Test comment",
        url: "https://example.com/test",
      };

      mockPrisma.website.findUnique.mockResolvedValue({
        id: websiteId,
        name: "Test Website",
      });
      (formatUrlMatch as any).mockReturnValue("test-page");
      mockPrisma.comment.create.mockRejectedValue(
        new Error("Database connection failed")
      );

      const response = await client.comments[":website_id"].$post({
        param: { website_id: websiteId },
        json: validCommentData,
      });

      expect(response.status).toBe(500);
    });

    it("should handle database errors during comment retrieval", async () => {
      const websiteId = "website123";
      const url = encodeURIComponent("https://example.com/test-page");

      mockPrisma.website.findUnique.mockResolvedValue({
        id: websiteId,
        name: "Test Website",
      });
      (formatUrlMatch as any).mockReturnValue("test-page");
      mockPrisma.comment.findMany.mockRejectedValue(
        new Error("Database connection failed")
      );

      const response = await client.comments[":website_id"][":url"].$get({
        param: { website_id: websiteId, url },
        query: { page: "1", limit: "10" },
      });

      expect(response.status).toBe(500);
    });
  });

  describe("Edge cases", () => {
    it("should handle comments with null/undefined optional fields", async () => {
      const websiteId = "website123";
      const url = encodeURIComponent("https://example.com/test-page");
      const mockWebsite = {
        id: websiteId,
        name: "Test Website",
      };

      const commentsWithNulls = [
        {
          id: "comment1",
          page_identifier: "test-page",
          content: "Test comment",
          created_at: new Date("2023-01-01"),
          author: { id: "user1", name: "User 1" },
        },
      ];

      mockPrisma.website.findUnique.mockResolvedValue(mockWebsite);
      (formatUrlMatch as any).mockReturnValue("test-page");
      mockPrisma.comment.findMany.mockResolvedValue(commentsWithNulls);

      const res = await client.comments[":website_id"][":url"].$get({
        param: { website_id: websiteId, url },
        query: { page: "1", limit: "10" },
      });

      expect(res.status).toBe(200);

      const responseData = await res.json();
      expect(responseData).toEqual([
        {
          id: "comment1",
          page_identifier: "test-page",
          content: "Test comment",
          created_at: new Date("2023-01-01").toISOString(),
          author: { id: "user1", name: "User 1" },
        },
      ]);
    });
  });
});
