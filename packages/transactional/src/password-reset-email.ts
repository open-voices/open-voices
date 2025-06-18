/* eslint-disable @stylistic/js/max-len */
import { template } from "radash";

const PASSWORD_RESET_EMAIL_TEMPLATE = `<mjml>
  <mj-head>
    <mj-title>{{app_name}} - Reset Your Password</mj-title>
    <mj-preview>You requested a password reset for your {{app_name}} account. Click here to reset your password securely.</mj-preview>
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
      .security-notice {
        background-color: #fef3c7 !important;
        border-left: 4px solid #f59e0b !important;
        padding: 16px !important;
        border-radius: 8px !important;
      }
    </mj-style>
  </mj-head>
  <mj-body background-color="#f8fafc">
    <!-- Header -->
    <mj-section background-color="#ffffff" padding="40px 20px 20px">
      <mj-column>
        <mj-text align="center" font-size="28px" font-weight="600" color="#1e293b" padding="0">
          Reset Your Password
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
          We received a request to reset the password for your {{app_name}} account. If you made this request, click the button below to choose a new password.
        </mj-text>

        <mj-text font-size="16px" color="#334155" line-height="24px" padding="0 0 30px">
          Click the button below to reset your password:
        </mj-text>

        <!-- Reset Password Button -->
        <mj-button color="#ffffff" font-size="16px" font-weight="600" border-radius="8px" css-class="reset-button" href="{{reset_url}}">
          Reset My Password
        </mj-button>

        <mj-text font-size="14px" color="#64748b" line-height="20px" padding="30px 0 0" align="center">
          This password reset link will expire in 1 hour for security purposes.
        </mj-text>
      </mj-column>
    </mj-section>

    <!-- Security Notice -->
    <mj-section background-color="#fef3c7" padding="20px" border-left="4px solid #f59e0b">
      <mj-column>
        <mj-text font-size="14px" color="#92400e" line-height="20px" padding="0" font-weight="600">
          🔒 Security Notice
        </mj-text>
        <mj-text font-size="14px" color="#92400e" line-height="20px" padding="8px 0 0">
          If you didn't request this password reset, please ignore this email. Your account remains secure and no changes have been made.
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
          <a href="{{reset_url}}" style="color: #475569; text-decoration: none; word-break: break-all;">
            {{reset_url}}
          </a>
        </mj-text>
      </mj-column>
    </mj-section>

    <!-- Help Section -->
    <mj-section background-color="#ffffff" padding="25px 20px">
      <mj-column>
        <mj-text font-size="16px" font-weight="600" color="#1e293b" padding="0 0 15px">
          Need additional help?
        </mj-text>
        <mj-text font-size="14px" color="#334155" line-height="20px" padding="0 0 8px">
          • Make sure you're using the latest reset link from this email
        </mj-text>
        <mj-text font-size="14px" color="#334155" line-height="20px" padding="0 0 8px">
          • Check your spam folder if you don't see our emails
        </mj-text>
        <mj-text font-size="14px" color="#334155" line-height="20px" padding="0 0 8px">
          • Contact support if you continue having issues
        </mj-text>
      </mj-column>
    </mj-section>

    <!-- Footer -->
    <mj-section background-color="#f8fafc" padding="30px 20px">
      <mj-column>
        <mj-text font-size="12px" color="#64748b" line-height="18px" align="center" padding="0 0 15px">
          This email was sent to you because a password reset was requested for your {{app_name}} account.
          <br>
          If you didn't request this, you can safely ignore this email.
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
 * Compiles the password reset email template with the provided data.
 */
export function compilePasswordResetEmailTemplate(data: {
    app_name:     string
    reset_url:    string
    help_url?:    string
    privacy_url?: string
    terms_url?:   string
}): string {
    let final_template = PASSWORD_RESET_EMAIL_TEMPLATE;

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
