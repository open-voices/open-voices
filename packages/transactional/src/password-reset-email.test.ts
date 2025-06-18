import { describe, expect, it } from "vitest";
import { compilePasswordResetEmailTemplate } from "./password-reset-email";

describe("compilePasswordResetEmailTemplate", () => {
  const baseData = {
    app_name: "Test App",
    reset_url: "https://example.com/reset-password?token=abc123",
  };

  it("should compile template with required fields", () => {
    const result = compilePasswordResetEmailTemplate(baseData);

    expect(result).toContain("Test App");
    expect(result).toContain("https://example.com/reset-password?token=abc123");
    expect(result).toContain(new Date().getFullYear().toString());
  });

  it("should include all optional footer links when provided", () => {
    const dataWithOptionalFields = {
      ...baseData,
      help_url: "https://example.com/help",
      privacy_url: "https://example.com/privacy",
      terms_url: "https://example.com/terms",
    };

    const result = compilePasswordResetEmailTemplate(dataWithOptionalFields);

    expect(result).toContain('href="https://example.com/help"');
    expect(result).toContain('href="https://example.com/privacy"');
    expect(result).toContain('href="https://example.com/terms"');
    expect(result).toContain("Need Help?");
    expect(result).toContain("Privacy Policy");
    expect(result).toContain("Terms of Service");
  });

  it("should remove help link when help_url is not provided", () => {
    const result = compilePasswordResetEmailTemplate(baseData);

    expect(result).not.toContain("Need Help?");
    expect(result).not.toContain('href="{{help_url}}"');
  });

  it("should remove privacy link when privacy_url is not provided", () => {
    const result = compilePasswordResetEmailTemplate(baseData);

    expect(result).not.toContain("Privacy Policy");
    expect(result).not.toContain('href="{{privacy_url}}"');
  });

  it("should remove terms link when terms_url is not provided", () => {
    const result = compilePasswordResetEmailTemplate(baseData);

    expect(result).not.toContain("Terms of Service");
    expect(result).not.toContain('href="{{terms_url}}"');
  });

  it("should handle partial optional fields", () => {
    const dataWithPartialFields = {
      ...baseData,
      help_url: "https://example.com/help",
      terms_url: "https://example.com/terms",
    };

    const result = compilePasswordResetEmailTemplate(dataWithPartialFields);

    expect(result).toContain("Need Help?");
    expect(result).toContain("Terms of Service");
    expect(result).not.toContain("Privacy Policy");
  });

  it("should replace all template variables", () => {
    const result = compilePasswordResetEmailTemplate(baseData);

    expect(result).not.toContain("{{app_name}}");
    expect(result).not.toContain("{{reset_url}}");
    expect(result).not.toContain("{{year}}");
  });

  it("should contain essential email content", () => {
    const result = compilePasswordResetEmailTemplate(baseData);

    expect(result).toContain("Reset Your Password");
    expect(result).toContain("We received a request to reset the password");
    expect(result).toContain("Reset My Password");
    expect(result).toContain("Security Notice");
    expect(result).toContain("This password reset link will expire in 1 hour");
  });
});
