import { renderMail } from "./mailer";
import { describe, expect, it } from "vitest";

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
});
