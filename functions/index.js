const functions = require('firebase-functions');
const admin = require('firebase-admin');
const nodemailer = require('nodemailer');

admin.initializeApp();

// Create the transporter with standard Gmail SMTP configuration
// It will look for config variables: firebase functions:config:set gmail.email="your_email" gmail.password="your_app_password"
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: functions.config().gmail?.email || process.env.GMAIL_EMAIL,
    pass: functions.config().gmail?.password || process.env.GMAIL_APP_PASSWORD
  }
});

exports.sendInviteEmail = functions.firestore
  .document('invites/{tokenId}')
  .onCreate(async (snap, context) => {
    const inviteData = snap.data();
    const tokenId = context.params.tokenId;
    
    // Get workspace details to include in the email
    let workspaceName = 'A workspace';
    try {
      const workspaceSnap = await admin.firestore().collection('workspaces').doc(inviteData.workspaceId).get();
      if (workspaceSnap.exists) {
        workspaceName = workspaceSnap.data().name;
      }
    } catch (err) {
      console.error('Failed to get workspace details', err);
    }

    // Determine the client URL (e.g. localhost in dev, or deployed URL in prod)
    // fallback to localhost:5173 for local development
    const clientUrl = functions.config().app?.url || process.env.CLIENT_URL || 'http://localhost:5173';
    
    const inviteLink = `${clientUrl}/invite/${tokenId}`;
    
    const mailOptions = {
      from: `DevFlow Workspace <${functions.config().gmail?.email || process.env.GMAIL_EMAIL}>`,
      to: inviteData.email,
      subject: `You have been invited to join ${workspaceName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
          <h2 style="color: #333;">You're invited!</h2>
          <p style="color: #555; line-height: 1.5;">
            You have been invited to join the <strong>${workspaceName}</strong> workspace on DevFlow as a <strong>${inviteData.role}</strong>.
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${inviteLink}" style="background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
              Accept Invitation
            </a>
          </div>
          <p style="color: #888; font-size: 12px; margin-top: 20px;">
            If you did not expect this invitation, you can safely ignore this email.
            <br>
            This link expires on ${new Date(inviteData.expiresAt).toLocaleDateString()}.
          </p>
        </div>
      `
    };

    try {
      await transporter.sendMail(mailOptions);
      console.log(`Invite email sent successfully to ${inviteData.email}`);
    } catch (error) {
      console.error('Error sending invite email:', error);
    }
  });
