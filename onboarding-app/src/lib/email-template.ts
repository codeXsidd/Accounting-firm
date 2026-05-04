export function buildOnboardingEmailHtml(clientName: string, onboardingLink: string): string {
  return `<!DOCTYPE html>
<html lang="en" xmlns:v="urn:schemas-microsoft-com:vml">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Welcome to Your Onboarding</title>
  <style>
    body { margin: 0; padding: 0; width: 100% !important; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #0a0a0f; color: #ffffff; }
    img { outline: none; text-decoration: none; -ms-interpolation-mode: bicubic; }
    table { border-collapse: collapse; mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    .cta-btn:hover { background-color: #7c3aed !important; }
  </style>
</head>
<body style="background-color: #0a0a0f; padding: 40px 10px;">
  <center>
    <table width="100%" border="0" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; background-color: #0a0a0f;">
      <tr>
        <td align="center" style="padding-bottom: 30px;">
          <table border="0" cellpadding="0" cellspacing="0">
            <tr>
              <td style="background: linear-gradient(135deg, #6366f1, #8b5cf6); border-radius: 10px; width: 40px; height: 40px; text-align: center; font-size: 20px;">⚡</td>
              <td style="padding-left: 12px; font-size: 22px; font-weight: 700; color: #ffffff; letter-spacing: -0.5px;">AccountFlow Pro</td>
            </tr>
          </table>
        </td>
      </tr>
      <tr>
        <td style="background-color: #11111a; border: 1px solid #22222e; border-radius: 24px; padding: 40px;">
          <table width="100%" border="0" cellpadding="0" cellspacing="0">
            <tr>
              <td>
                <div style="display: inline-block; background: rgba(99, 102, 241, 0.15); border: 1px solid rgba(99, 102, 241, 0.3); color: #818cf8; font-size: 11px; font-weight: 700; padding: 6px 14px; border-radius: 100px; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 24px;">🎉 Deal Closed</div>
                <h1 style="font-size: 28px; font-weight: 700; color: #ffffff; margin-bottom: 16px; line-height: 1.3;">Welcome aboard, <span style="color: #818cf8;">${clientName}</span>!</h1>
                <p style="font-size: 16px; color: #94a3b8; line-height: 1.6; margin-bottom: 30px;">We're thrilled to have you as a client. Your account has been set up and you're ready to complete your onboarding in about 10–15 minutes.</p>
                
                <table width="100%" border="0" cellpadding="0" cellspacing="0" style="background-color: #1a1a24; border: 1px solid #2a2a35; border-radius: 16px; padding: 24px; margin-bottom: 30px;">
                  <tr><td style="padding-bottom: 15px; font-size: 11px; font-weight: 700; color: #55556b; text-transform: uppercase; letter-spacing: 1px;">What you'll complete</td></tr>
                  ${[
                    { n:1, t:'Client Type Selection' },
                    { n:2, t:'Personal & Business Information' },
                    { n:3, t:'Tax & Compliance Details' },
                    { n:4, t:'Financial Information' },
                    { n:5, t:'Document Upload & Signature' }
                  ].map(s => `
                  <tr>
                    <td style="padding: 10px 0; border-bottom: 1px solid #22222e;">
                      <table border="0" cellpadding="0" cellspacing="0">
                        <tr>
                          <td style="background: linear-gradient(135deg, #6366f1, #8b5cf6); border-radius: 8px; width: 26px; height: 26px; text-align: center; color: #ffffff; font-size: 12px; font-weight: 700;">${s.n}</td>
                          <td style="padding-left: 12px; font-size: 14px; color: #cbd5e1;">${s.t}</td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  `).join('')}
                </table>

                <a href="${onboardingLink}" style="display: block; width: 100%; background: linear-gradient(135deg, #6366f1, #8b5cf6); color: #ffffff; text-decoration: none; padding: 18px 0; border-radius: 14px; font-size: 16px; font-weight: 700; text-align: center; margin-bottom: 20px;">🚀 Start My Onboarding</a>
                
                <p style="font-size: 12px; color: #475569; text-align: center; line-height: 1.5;">
                  Or copy this link:<br/>
                  <a href="${onboardingLink}" style="color: #6366f1; text-decoration: none; word-break: break-all;">${onboardingLink}</a>
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
      <tr>
        <td align="center" style="padding-top: 30px; font-size: 12px; color: #475569; line-height: 1.8;">
          <p>AccountFlow Pro &mdash; Automated Client Onboarding</p>
          <p>© ${new Date().getFullYear()} AccountFlow Pro. All rights reserved.</p>
        </td>
      </tr>
    </table>
  </center>
</body>
</html>`;
}
