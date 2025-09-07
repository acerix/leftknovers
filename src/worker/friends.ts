import { Resend } from 'resend';

export async function sendFriendInvitationEmail(
  apiKey: string,
  recipientEmail: string,
  senderName: string,
  senderEmail: string,
  invitationToken: string
): Promise<boolean> {
  if (!apiKey) {
    console.error('Resend API key not configured');
    return false;
  }

  const resend = new Resend(apiKey);
  const invitationUrl = `https://leftknovers.mocha.app/accept-friend/${invitationToken}`;

  const htmlContent = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <div style="display: inline-block; width: 60px; height: 60px; background: linear-gradient(135deg, #10b981, #059669); border-radius: 16px; margin-bottom: 16px; position: relative;">
          <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); color: white; font-size: 28px;">🌿</div>
        </div>
        <h1 style="color: #111827; margin: 0; font-size: 28px; font-weight: 700;">leftknovers</h1>
        <p style="color: #6b7280; margin: 8px 0 0 0; font-size: 16px;">Friend invitation</p>
      </div>

      <div style="background: #f9fafb; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
        <h2 style="color: #111827; margin: 0 0 16px 0; font-size: 20px; font-weight: 600;">
          You've been invited! 🎉
        </h2>
        <p style="color: #4b5563; margin: 0 0 16px 0; font-size: 16px; line-height: 1.5;">
          <strong>${senderName}</strong> (${senderEmail}) has invited you to connect on leftknovers, 
          the smart food tracking app that helps reduce food waste.
        </p>
        <p style="color: #4b5563; margin: 0; font-size: 16px; line-height: 1.5;">
          Join them in tracking leftovers, sharing tips, and making a positive impact on the environment!
        </p>
      </div>

      <div style="text-align: center; margin-bottom: 24px;">
        <a href="${invitationUrl}" style="display: inline-block; background: linear-gradient(135deg, #10b981, #059669); color: white; text-decoration: none; padding: 16px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">
          Accept Invitation
        </a>
      </div>

      <div style="background: white; border: 1px solid #e5e7eb; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
        <h3 style="color: #111827; margin: 0 0 16px 0; font-size: 18px; font-weight: 600;">
          What is leftknovers?
        </h3>
        <div style="space-y: 12px;">
          <div style="margin-bottom: 12px;">
            <div style="color: #10b981; font-weight: 600; margin-bottom: 4px;">📱 Smart Tracking</div>
            <div style="color: #6b7280; font-size: 14px;">Track your food with photos and expiration dates</div>
          </div>
          <div style="margin-bottom: 12px;">
            <div style="color: #10b981; font-weight: 600; margin-bottom: 4px;">🔔 Smart Notifications</div>
            <div style="color: #6b7280; font-size: 14px;">Get reminded before food expires</div>
          </div>
          <div style="margin-bottom: 12px;">
            <div style="color: #10b981; font-weight: 600; margin-bottom: 4px;">📊 Analytics</div>
            <div style="color: #6b7280; font-size: 14px;">See your waste reduction progress</div>
          </div>
          <div>
            <div style="color: #10b981; font-weight: 600; margin-bottom: 4px;">🌍 Environmental Impact</div>
            <div style="color: #6b7280; font-size: 14px;">Help reduce food waste and save money</div>
          </div>
        </div>
      </div>

      <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; color: #6b7280; font-size: 14px; text-align: center;">
        <p style="margin: 0 0 8px 0;">
          This invitation will expire in 7 days. If you don't want to receive these emails, you can ignore this message.
        </p>
        <p style="margin: 0;">
          <a href="${invitationUrl}" style="color: #10b981; text-decoration: none;">Click here to accept the invitation</a>
        </p>
      </div>
    </div>
  `;

  const textContent = `
leftknovers - Friend Invitation

You've been invited!

${senderName} (${senderEmail}) has invited you to connect on leftknovers, the smart food tracking app that helps reduce food waste.

Join them in tracking leftovers, sharing tips, and making a positive impact on the environment!

Accept the invitation: ${invitationUrl}

What is leftknovers?
- Smart Tracking: Track your food with photos and expiration dates
- Smart Notifications: Get reminded before food expires  
- Analytics: See your waste reduction progress
- Environmental Impact: Help reduce food waste and save money

This invitation will expire in 7 days.
  `;

  try {
    const result = await resend.emails.send({
      from: 'leftknovers <onboarding@resend.dev>',
      to: [recipientEmail],
      subject: `${senderName} invited you to join leftknovers!`,
      html: htmlContent,
      text: textContent,
    });

    if (result.error) {
      console.error('Failed to send friend invitation email:', result.error);
      return false;
    }

    console.log('Friend invitation email sent successfully:', result.data?.id);
    return true;
  } catch (error) {
    console.error('Error sending friend invitation email:', error);
    return false;
  }
}

export function generateInvitationToken(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 32; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}
