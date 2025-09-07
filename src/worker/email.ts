import { Resend } from 'resend';

interface ExpiringItem {
  name: string;
  expiration_date: string;
  category?: string;
  storage_location?: string;
}

export async function sendExpirationEmail(
  apiKey: string,
  toEmail: string,
  userName: string,
  items: ExpiringItem[]
): Promise<boolean> {
  if (!apiKey) {
    console.error('Resend API key not configured');
    return false;
  }

  const resend = new Resend(apiKey);

  const itemsList = items.map(item => {
    const expirationDate = new Date(item.expiration_date);
    const now = new Date();
    const daysUntilExpiration = Math.ceil((expirationDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    let urgencyText = '';
    if (daysUntilExpiration < 0) {
      urgencyText = ' (Expired)';
    } else if (daysUntilExpiration === 0) {
      urgencyText = ' (Expires today!)';
    } else if (daysUntilExpiration === 1) {
      urgencyText = ' (Expires tomorrow)';
    } else if (daysUntilExpiration <= 3) {
      urgencyText = ` (${daysUntilExpiration} days left)`;
    }

    const locationText = item.storage_location ? ` - ${item.storage_location}` : '';
    const categoryText = item.category ? ` (${item.category})` : '';
    
    return `• ${item.name}${categoryText}${locationText} - ${expirationDate.toLocaleDateString()}${urgencyText}`;
  }).join('\n');

  const subject = items.length === 1 
    ? `🍽️ Food expiring soon: ${items[0].name}`
    : `🍽️ ${items.length} food items expiring soon`;

  const htmlContent = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <div style="display: inline-block; width: 60px; height: 60px; background: linear-gradient(135deg, #10b981, #059669); border-radius: 16px; margin-bottom: 16px; position: relative;">
          <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); color: white; font-size: 28px;">🌿</div>
        </div>
        <h1 style="color: #111827; margin: 0; font-size: 28px; font-weight: 700;">leftknovers</h1>
        <p style="color: #6b7280; margin: 8px 0 0 0; font-size: 16px;">Food expiration reminder</p>
      </div>

      <div style="background: #f9fafb; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
        <h2 style="color: #111827; margin: 0 0 16px 0; font-size: 20px; font-weight: 600;">
          Hi ${userName}! 👋
        </h2>
        <p style="color: #4b5563; margin: 0 0 16px 0; font-size: 16px; line-height: 1.5;">
          ${items.length === 1 
            ? 'You have a food item that\'s expiring soon. Don\'t let it go to waste!'
            : `You have ${items.length} food items that are expiring soon. Time to get cooking!`
          }
        </p>
      </div>

      <div style="background: white; border: 1px solid #e5e7eb; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
        <h3 style="color: #111827; margin: 0 0 16px 0; font-size: 18px; font-weight: 600;">
          Expiring Items:
        </h3>
        <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; border-radius: 8px;">
          <pre style="color: #92400e; margin: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 14px; line-height: 1.6; white-space: pre-wrap;">${itemsList}</pre>
        </div>
      </div>

      <div style="text-align: center; margin-bottom: 24px;">
        <a href="https://leftknovers.mocha.app" style="display: inline-block; background: linear-gradient(135deg, #10b981, #059669); color: white; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 600; font-size: 16px;">
          View Your Items
        </a>
      </div>

      <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; color: #6b7280; font-size: 14px; text-align: center;">
        <p style="margin: 0 0 8px 0;">
          💡 <strong>Tip:</strong> Use up expiring items in smoothies, soups, or stir-fries to reduce food waste!
        </p>
        <p style="margin: 0;">
          You can manage your notification settings in the leftknovers app.
        </p>
      </div>
    </div>
  `;

  const textContent = `
leftknovers - Food Expiration Reminder

Hi ${userName}!

${items.length === 1 
  ? 'You have a food item that\'s expiring soon. Don\'t let it go to waste!'
  : `You have ${items.length} food items that are expiring soon. Time to get cooking!`
}

Expiring Items:
${itemsList}

Visit https://leftknovers.mocha.app to view your items.

Tip: Use up expiring items in smoothies, soups, or stir-fries to reduce food waste!

You can manage your notification settings in the leftknovers app.
  `;

  try {
    const result = await resend.emails.send({
      from: 'leftknovers <onboarding@resend.dev>',
      to: [toEmail],
      subject,
      html: htmlContent,
      text: textContent,
    });

    if (result.error) {
      console.error('Failed to send email:', result.error);
      return false;
    }

    console.log('Email sent successfully:', result.data?.id);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
}
