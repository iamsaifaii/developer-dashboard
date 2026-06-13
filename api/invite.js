import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { to, inviterName, teamName, inviteLink } = req.body;

  if (!to || !inviterName || !teamName || !inviteLink) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  if (!process.env.RESEND_API_KEY) {
    return res.status(500).json({ error: 'Email service not configured' });
  }

  try {
    await resend.emails.send({
      from: 'DevFlow <onboarding@resend.dev>',
      to,
      subject: `${inviterName} invited you to join "${teamName}" on DevFlow`,
      html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#09090b;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="480" cellpadding="0" cellspacing="0" style="background:#0a0a0a;border:1px solid #27272a;border-radius:16px;overflow:hidden;">

          <!-- Header -->
          <tr>
            <td style="padding:32px 40px 24px;border-bottom:1px solid #18181b;text-align:center;background:linear-gradient(to bottom,#18181b,#0a0a0a);">
              <div style="font-size:22px;font-weight:800;color:#ffffff;letter-spacing:-0.5px;">DevFlow</div>
              <div style="font-size:12px;color:#52525b;margin-top:4px;">Developer Productivity Platform</div>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:32px 40px;">
              <div style="width:56px;height:56px;background:#18181b;border:1px solid #27272a;border-radius:12px;display:flex;align-items:center;justify-content:center;margin:0 auto 20px;text-align:center;font-size:24px;line-height:56px;">
                👥
              </div>
              <h1 style="color:#ffffff;font-size:20px;font-weight:700;margin:0 0 8px;text-align:center;">You're invited!</h1>
              <p style="color:#a1a1aa;font-size:14px;text-align:center;margin:0 0 24px;line-height:1.6;">
                <strong style="color:#d4d4d8;">${inviterName}</strong> has invited you to join the
                <strong style="color:#ffffff;">${teamName}</strong> workspace on DevFlow.
              </p>

              <!-- CTA Button -->
              <div style="text-align:center;margin:28px 0;">
                <a href="${inviteLink}"
                   style="display:inline-block;background:#ffffff;color:#000000;text-decoration:none;font-size:14px;font-weight:700;padding:14px 32px;border-radius:10px;letter-spacing:0.3px;">
                  Join ${teamName} →
                </a>
              </div>

              <p style="color:#52525b;font-size:12px;text-align:center;margin:16px 0 0;line-height:1.6;">
                Or paste this link into your browser:<br/>
                <a href="${inviteLink}" style="color:#71717a;word-break:break-all;">${inviteLink}</a>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:20px 40px;border-top:1px solid #18181b;text-align:center;">
              <p style="color:#3f3f46;font-size:12px;margin:0;line-height:1.6;">
                Sent by <strong>${inviterName}</strong> via DevFlow.<br/>
                If you weren't expecting this, you can safely ignore it.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
    });

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Resend error:', error);
    return res.status(500).json({ error: error.message || 'Failed to send email' });
  }
}
