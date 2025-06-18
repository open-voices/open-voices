import { describe, expect, it } from "vitest";
import { compileVerificationEmailTemplate } from "./verification-email";

describe("compileVerificationEmailTemplate", () => {
  const baseData = {
    app_name: "TestApp",
    verification_url: "https://example.com/verify/123",
  };

  it("should compile template with required fields", () => {
    const result = compileVerificationEmailTemplate(baseData);

    expect(result).toContain("Welcome to TestApp!");
    expect(result).toContain("https://example.com/verify/123");
    expect(result).toContain(`© ${new Date().getFullYear()} TestApp`);
  });

  it("should include all optional footer links when provided", () => {
    const dataWithOptional = {
      ...baseData,
      help_url: "https://example.com/help",
      privacy_url: "https://example.com/privacy",
      terms_url: "https://example.com/terms",
    };

    const result = compileVerificationEmailTemplate(dataWithOptional);

    expect(result).toContain('href="https://example.com/help"');
    expect(result).toContain('href="https://example.com/privacy"');
    expect(result).toContain('href="https://example.com/terms"');
    expect(result).toContain("Need Help?");
    expect(result).toContain("Privacy Policy");
    expect(result).toContain("Terms of Service");
  });

  it("should remove help link when help_url is not provided", () => {
    const result = compileVerificationEmailTemplate(baseData);

    expect(result).not.toContain("Need Help?");
    expect(result).not.toContain('href="{{help_url}}"');
  });

  it("should remove privacy link when privacy_url is not provided", () => {
    const result = compileVerificationEmailTemplate(baseData);

    expect(result).not.toContain("Privacy Policy");
    expect(result).not.toContain('href="{{privacy_url}}"');
  });

  it("should remove terms link when terms_url is not provided", () => {
    const result = compileVerificationEmailTemplate(baseData);

    expect(result).not.toContain("Terms of Service");
    expect(result).not.toContain('href="{{terms_url}}"');
  });

  it("should handle partial optional fields", () => {
    const dataWithPartialOptional = {
      ...baseData,
      help_url: "https://example.com/help",
      terms_url: "https://example.com/terms",
    };

    const result = compileVerificationEmailTemplate(dataWithPartialOptional);

    expect(result).toContain("Need Help?");
    expect(result).toContain("Terms of Service");
    expect(result).not.toContain("Privacy Policy");
  });

  it("should set current year in footer", () => {
    const result = compileVerificationEmailTemplate(baseData);
    const currentYear = new Date().getFullYear();

    expect(result).toContain(`© ${currentYear} TestApp`);
  });

  it("should preserve MJML structure", () => {
    const result = compileVerificationEmailTemplate(baseData);

    expect(result).toContain("<mjml>");
    expect(result).toContain("</mjml>");
    expect(result).toContain("<mj-head>");
    expect(result).toContain("<mj-body>");
    expect(result).toContain("<mj-button");
  });
});
