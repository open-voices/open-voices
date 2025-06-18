/* eslint-disable @stylistic/js/max-len */
import { template } from "radash";

const VERIFICATION_EMAIL_TEMPLATE = `<mjml>
  <mj-head>
    <mj-title>{{app_name}} - Verify Your Email</mj-title>
    <mj-preview>Welcome to {{app_name}}! Please verify your email address to complete your registration.</mj-preview>
    <mj-attributes>
      <mj-all font-family="'Helvetica Neue', Helvetica, Arial, sans-serif" />
      <mj-text font-weight="400" font-size="16px" color="#334155" line-height="24px" />
      <mj-section background-color="#ffffff" />
    </mj-attributes>
    <mj-style inline="inline">
      .footer-link {
      color: #64748b !important;
      text-decoration: none !important;
      }
      .footer-link:hover {
      color: #475569 !important;
      }
    </mj-style>
  </mj-head>
  <mj-body background-color="#f8fafc">
    <!-- Header -->
    <mj-section background-color="#ffffff" padding="40px 20px 20px">
      <mj-column>
        <mj-text align="center" font-size="28px" font-weight="600" color="#1e293b" padding="0">
          Welcome to {{app_name}}!
        </mj-text>
      </mj-column>
    </mj-section>

    <!-- Main Content -->
    <mj-section background-color="#ffffff" padding="20px">
      <mj-column>
        <mj-text font-size="16px" color="#334155" line-height="24px" padding="0 0 20px">
          Hi there,
        </mj-text>

        <mj-text font-size="16px" color="#334155" line-height="24px" padding="0 0 20px">
          Thank you for joining {{app_name}}. To complete your registration and start engaging in meaningful conversations, please verify your email address.
        </mj-text>

        <mj-text font-size="16px" color="#334155" line-height="24px" padding="0 0 30px">
          Click the button below to verify your email address:
        </mj-text>

        <!-- Verification Button -->
        <mj-button color="#ffffff" font-size="16px" font-weight="600" border-radius="8px" css-class="verification-button" href="{{verification_url}}">
          Verify My Email Address
        </mj-button>

        <mj-text font-size="14px" color="#64748b" line-height="20px" padding="30px 0 0" align="center">
          This verification link will expire in 24 hours for security purposes.
        </mj-text>
      </mj-column>
    </mj-section>

    <!-- Alternative Link Section -->
    <mj-section background-color="#f1f5f9" padding="25px 20px">
      <mj-column>
        <mj-text font-size="14px" color="#475569" line-height="20px" align="center" padding="0 0 10px">
          Having trouble with the button above?
        </mj-text>
        <mj-text font-size="14px" color="#64748b" line-height="20px" align="center" padding="0">
          Copy and paste this link into your browser:
        </mj-text>
        <mj-text font-size="12px" color="#475569" line-height="16px" align="center" padding="10px 0 0">
          <a href="{{verification_url}}" style="color: #475569; text-decoration: none; word-break: break-all;">
            {{verification_url}}
          </a>
        </mj-text>
      </mj-column>
    </mj-section>

    <!-- Footer -->
    <mj-section background-color="#f8fafc" padding="30px 20px">
      <mj-column>
        <mj-text font-size="12px" color="#64748b" line-height="18px" align="center" padding="0 0 15px">
          This email was sent to you because you created an account on {{app_name}}.
          <br>
          If you didn't create this account, you can safely ignore this email.
        </mj-text>

        <mj-text font-size="12px" color="#64748b" line-height="18px" align="center" padding="0 0 15px">
          <a href="{{help_url}}" class="footer-link">Need Help?</a> •
          <a href="{{privacy_url}}" class="footer-link">Privacy Policy</a> •
          <a href="{{terms_url}}" class="footer-link">Terms of Service</a>
        </mj-text>

        <mj-text font-size="12px" color="#94a3b8" line-height="18px" align="center" padding="0">
          © {{year}} {{app_name}}.
        </mj-text>
      </mj-column>
    </mj-section>
  </mj-body>
</mjml>`;

/**
 * Compiles the verification email template with the provided data.
 */
export function compileVerificationEmailTemplate(data: {
    app_name:         string
    verification_url: string
    help_url?:        string
    privacy_url?:     string
    terms_url?:       string
}): string {
    let final_template = VERIFICATION_EMAIL_TEMPLATE;

    if (!data.help_url) {
        final_template = final_template.replace(
            `<a href="{{help_url}}" class="footer-link">Need Help?</a> •`,
            ``
        );
    }
    if (!data.privacy_url) {
        final_template = final_template.replace(
            `<a href="{{privacy_url}}" class="footer-link">Privacy Policy</a> •`,
            ``
        );
    }
    if (!data.terms_url) {
        final_template = final_template.replace(
            `<a href="{{terms_url}}" class="footer-link">Terms of Service</a>`,
            ``
        );
    }

    return template(final_template, {
        ...data,
        year: new Date().getFullYear(),
    });
}
