export function buildOnboardingEmailHtml(clientName: string, onboardingLink: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Welcome to Your Onboarding</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: linear-gradient(135deg, #0a0a0f 0%, #0d1117 50%, #0a0a0f 100%);
      min-height: 100vh;
      padding: 40px 20px;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
    }
    .header {
      text-align: center;
      margin-bottom: 32px;
    }
    .logo {
      display: inline-flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 8px;
    }
    .logo-icon {
      width: 40px;
      height: 40px;
      background: linear-gradient(135deg, #6366f1, #8b5cf6);
      border-radius: 10px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-size: 20px;
    }
    .logo-text {
      font-size: 22px;
      font-weight: 700;
      color: #ffffff;
      letter-spacing: -0.5px;
    }
    .card {
      background: rgba(255, 255, 255, 0.04);
      backdrop-filter: blur(20px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 24px;
      padding: 40px;
      box-shadow: 0 25px 50px rgba(0, 0, 0, 0.5);
    }
    .badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: rgba(99, 102, 241, 0.15);
      border: 1px solid rgba(99, 102, 241, 0.3);
      color: #818cf8;
      font-size: 12px;
      font-weight: 600;
      padding: 6px 14px;
      border-radius: 100px;
      margin-bottom: 24px;
      letter-spacing: 0.5px;
      text-transform: uppercase;
    }
    h1 {
      font-size: 28px;
      font-weight: 700;
      color: #ffffff;
      line-height: 1.3;
      margin-bottom: 16px;
    }
    h1 span {
      background: linear-gradient(135deg, #6366f1, #a78bfa);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    .subtitle {
      font-size: 16px;
      color: rgba(255,255,255,0.55);
      line-height: 1.7;
      margin-bottom: 32px;
    }
    .steps {
      background: rgba(255,255,255,0.03);
      border: 1px solid rgba(255,255,255,0.07);
      border-radius: 16px;
      padding: 24px;
      margin-bottom: 32px;
    }
    .steps-title {
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: rgba(255,255,255,0.4);
      margin-bottom: 16px;
    }
    .step {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 10px 0;
      border-bottom: 1px solid rgba(255,255,255,0.05);
    }
    .step:last-child { border-bottom: none; }
    .step-num {
      width: 28px;
      height: 28px;
      background: linear-gradient(135deg, #6366f1, #8b5cf6);
      border-radius: 8px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-size: 13px;
      font-weight: 700;
      color: white;
      flex-shrink: 0;
    }
    .step-text {
      font-size: 14px;
      color: rgba(255,255,255,0.7);
    }
    .cta-btn {
      display: block;
      width: 100%;
      text-align: center;
      padding: 18px 32px;
      background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
      color: #ffffff !important;
      text-decoration: none;
      font-size: 16px;
      font-weight: 700;
      border-radius: 14px;
      letter-spacing: 0.3px;
      box-shadow: 0 8px 32px rgba(99, 102, 241, 0.4);
      transition: all 0.3s ease;
      margin-bottom: 20px;
    }
    .link-note {
      font-size: 12px;
      color: rgba(255,255,255,0.3);
      text-align: center;
    }
    .link-note a {
      color: rgba(99, 102, 241, 0.8);
      word-break: break-all;
    }
    .footer {
      text-align: center;
      margin-top: 32px;
      padding-top: 24px;
      border-top: 1px solid rgba(255,255,255,0.06);
      font-size: 12px;
      color: rgba(255,255,255,0.25);
      line-height: 1.8;
    }
    .divider {
      height: 1px;
      background: linear-gradient(90deg, transparent, rgba(99,102,241,0.3), transparent);
      margin: 28px 0;
    }
    .time-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-size: 13px;
      color: rgba(255,255,255,0.4);
      margin-bottom: 24px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">
        <span class="logo-icon">⚡</span>
        <span class="logo-text">AccountFlow Pro</span>
      </div>
    </div>
    
    <div class="card">
      <div class="badge">🎉 Deal Closed</div>
      
      <h1>Welcome aboard, <span>${clientName}</span>!</h1>
      
      <p class="subtitle">
        We're thrilled to have you as a client. Your account has been set up and 
        you're ready to complete your onboarding. This process takes about 
        <strong style="color: rgba(255,255,255,0.7)">10–15 minutes</strong>.
      </p>
      
      <div class="time-badge">
        ⏱ Estimated time: 10–15 minutes
      </div>

      <div class="steps">
        <p class="steps-title">What you'll complete</p>
        <div class="step">
          <span class="step-num">1</span>
          <span class="step-text">Client Type Selection</span>
        </div>
        <div class="step">
          <span class="step-num">2</span>
          <span class="step-text">Personal & Business Information</span>
        </div>
        <div class="step">
          <span class="step-num">3</span>
          <span class="step-text">Tax & Compliance Details</span>
        </div>
        <div class="step">
          <span class="step-num">4</span>
          <span class="step-text">Financial Information</span>
        </div>
        <div class="step">
          <span class="step-num">5</span>
          <span class="step-text">Document Upload & Signature</span>
        </div>
      </div>
      
      <a href="${onboardingLink}" class="cta-btn">
        🚀 &nbsp; Start My Onboarding
      </a>
      
      <p class="link-note">
        Or copy this link: <a href="${onboardingLink}">${onboardingLink}</a>
      </p>
      
      <div class="divider"></div>
      
      <p style="font-size: 13px; color: rgba(255,255,255,0.35); text-align: center;">
        This link is unique to your account. Please don't share it with others.
      </p>
    </div>
    
    <div class="footer">
      <p>AccountFlow Pro &mdash; Automated Client Onboarding</p>
      <p>© ${new Date().getFullYear()} AccountFlow Pro. All rights reserved.</p>
      <p style="margin-top: 8px;">
        If you have questions, reply to this email or contact <a href="mailto:support@yourfirm.com" style="color: rgba(99,102,241,0.6)">support@yourfirm.com</a>
      </p>
    </div>
  </div>
</body>
</html>`;
}
