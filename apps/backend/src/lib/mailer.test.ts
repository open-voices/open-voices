import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";

// Mock nodemailer
vi.mock("nodemailer", () => {
  const mockSendMail = vi.fn();
  const mockCreateTransport = vi.fn(() => ({ sendMail: mockSendMail }));
  const mockCreateTestAccount = vi.fn();
  const mockGetTestMessageUrl = vi.fn(() => "https://ethereal.email/message/test123");

  return {
    createTestAccount: mockCreateTestAccount,
    createTransport: mockCreateTransport,
    getTestMessageUrl: mockGetTestMessageUrl,
    __mocks: {
      mockSendMail,
      mockCreateTransport,
      mockCreateTestAccount,
      mockGetTestMessageUrl,
    },
  };
});

// Mock the promisify utility to ensure it doesn't interfere
vi.mock("node:util", () => ({
  promisify: vi.fn((fn) => fn), // Return the function as-is since we're mocking it anyway
}));

import { renderMail, sendMail } from "./mailer";
import type { TestAccount } from "nodemailer";

const nodemailer = await import("nodemailer");
const {
  mockSendMail,
  mockCreateTransport,
  mockCreateTestAccount,
  mockGetTestMessageUrl,
} = (nodemailer as any).__mocks;

describe("mailer", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env = { ...originalEnv };

    mockSendMail.mockResolvedValue({ messageId: "test-message-id" });
    mockCreateTestAccount.mockResolvedValue({
      user: "test@ethereal.email",
      pass: "test123",
      smtp: { host: "smtp.ethereal.email", port: 587 },
    } as TestAccount);
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe("renderMail", () => {
    it("should convert valid MJML to HTML", () => {
      const mjml = `
            <mjml>
                <mj-body>
                    <mj-section>
                        <mj-column>
                            <mj-text>Hello, World!</mj-text>
                        </mj-column>
                    </mj-section>
                </mj-body>
            </mjml>
        `;
      const html = renderMail(mjml);
      expect(html).toContain("<!doctype html>");
      expect(html).toContain("Hello, World!");
      expect(html).not.toContain("mjml");
    });

    it("should minify the output HTML", () => {
      const mjml = `
            <mjml>
                <mj-body>
                    <mj-section>
                        <mj-column>
                            <mj-text>Minified</mj-text>
                        </mj-column>
                    </mj-section>
                </mj-body>
            </mjml>
        `;
      const html = renderMail(mjml);
      // Minified HTML should not contain excessive whitespace
      expect(html.replace(/\s+/g, "")).toContain("Minified");
    });

    it("should remove comments from the output HTML", () => {
      const mjml = `
            <mjml>
                <mj-body>
                    <mj-section>
                        <mj-column>
                            <!-- This is a comment -->
                            <mj-text>No comments</mj-text>
                        </mj-column>
                    </mj-section>
                </mj-body>
            </mjml>
        `;
      const html = renderMail(mjml);
      expect(html).not.toContain("This is a comment");
    });

    it("should throw or return error HTML for invalid MJML", () => {
      const invalidMjml = "<mjml><mj-body><mj-section></mjml>";
      expect(() => renderMail(invalidMjml)).not.toThrow();
      const html = renderMail(invalidMjml);
      expect(typeof html).toBe("string");
      expect(html).toContain("<!doctype html>");
    });

    it("should handle empty MJML template", () => {
      const emptyMjml = "";
      expect(() => renderMail(emptyMjml)).toThrow();
    });

    it("should handle MJML with special characters", () => {
      const mjml = `
                <mjml>
                    <mj-body>
                        <mj-section>
                            <mj-column>
                                <mj-text>Special chars: &amp; &lt; &gt; "quotes" 'apostrophes'</mj-text>
                            </mj-column>
                        </mj-section>
                    </mj-body>
                </mjml>
            `;
      const html = renderMail(mjml);
      expect(html).toContain("Special chars:");
      expect(html).toContain("<!doctype html>");
    });

    it("should handle complex MJML structure", () => {
      const mjml = `
                <mjml>
                    <mj-body>
                        <mj-section>
                            <mj-column>
                                <mj-text>Header</mj-text>
                                <mj-button href="https://example.com">Click me</mj-button>
                                <mj-image src="https://example.com/image.jpg" alt="Test image" />
                            </mj-column>
                        </mj-section>
                    </mj-body>
                </mjml>
            `;
      const html = renderMail(mjml);
      expect(html).toContain("Header");
      expect(html).toContain("Click me");
      expect(html).toContain("example.com");
      expect(html).toContain("<!doctype html>");
    });
  });

  describe("sendMail", () => {
    it("should send email with SMTP configuration", async () => {
      process.env.SMTP_HOST = "smtp.example.com";
      process.env.SMTP_USER = "user@example.com";
      process.env.SMTP_PASS = "password123";
      process.env.SMTP_PORT = "587";

      mockSendMail.mockResolvedValue({ messageId: "test-message-id" });

      const mailOptions = {
        from: "sender@example.com",
        to: "recipient@example.com",
        subject: "Test Subject",
        html: "<p>Test content</p>",
      };

      await sendMail(mailOptions);

      expect(mockCreateTransport).toHaveBeenCalledWith({
        host: "smtp.ethereal.email",
        port: 587,
        secure: false,
        auth: {
          user: "test@ethereal.email",
          pass: "test123",
        },
      });
      expect(mockSendMail).toHaveBeenCalledWith(mailOptions);
    });

    it("should use Ethereal when SMTP configuration is incomplete", async () => {
      delete process.env.SMTP_HOST;
      delete process.env.SMTP_USER;
      delete process.env.SMTP_PASS;

      mockSendMail.mockResolvedValue({ messageId: "ethereal-message-id" });

      const mailOptions = {
        from: "sender@example.com",
        to: "recipient@example.com",
        subject: "Test Subject",
        html: "<p>Test content</p>",
      };

      await sendMail(mailOptions);

      expect(mockCreateTestAccount).toHaveBeenCalled();
      expect(mockCreateTransport).toHaveBeenCalledWith({
        host: "smtp.ethereal.email",
        port: 587,
        secure: false,
        auth: {
          user: "test@ethereal.email",
          pass: "test123",
        },
      });
      expect(mockGetTestMessageUrl).toHaveBeenCalled();
    });

    it("should use secure connection for port 465", async () => {
      process.env.SMTP_HOST = "smtp.example.com";
      process.env.SMTP_USER = "user@example.com";
      process.env.SMTP_PASS = "password123";
      process.env.SMTP_PORT = "465";

      mockSendMail.mockResolvedValue({ messageId: "secure-message-id" });

      await sendMail({
        from: "sender@example.com",
        to: "recipient@example.com",
        subject: "Test Subject",
        html: "<p>Test content</p>",
      });

      expect(mockCreateTransport).toHaveBeenCalledWith({
        host: "smtp.ethereal.email",
        port: 465,
        secure: true,
        auth: {
          user: "test@ethereal.email",
          pass: "test123",
        },
      });
    });

    it("should default to port 587 when SMTP_PORT is not set", async () => {
      process.env.SMTP_HOST = "smtp.example.com";
      process.env.SMTP_USER = "user@example.com";
      process.env.SMTP_PASS = "password123";
      delete process.env.SMTP_PORT;

      mockSendMail.mockResolvedValue({ messageId: "default-port-message" });

      await sendMail({
        from: "sender@example.com",
        to: "recipient@example.com",
        subject: "Test Subject",
        html: "<p>Test content</p>",
      });

      expect(mockCreateTransport).toHaveBeenCalledWith({
        host: "smtp.ethereal.email",
        port: 587,
        secure: false,
        auth: {
          user: "test@ethereal.email",
          pass: "test123",
        },
      });
    });

    it("should handle sendMail errors", async () => {
      process.env.SMTP_HOST = "smtp.example.com";
      process.env.SMTP_USER = "user@example.com";
      process.env.SMTP_PASS = "password123";

      mockSendMail.mockRejectedValue(new Error("SMTP connection failed"));

      const mailOptions = {
        from: "sender@example.com",
        to: "recipient@example.com",
        subject: "Test Subject",
        html: "<p>Test content</p>",
      };

      await expect(sendMail(mailOptions)).rejects.toThrow(
        "SMTP connection failed"
      );
    });
  });
});
