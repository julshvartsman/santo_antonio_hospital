# Email Setup Guide

To enable real email sending for the reminder system, follow these steps:

## 1. Choose an Email Service

### Option A: Resend (Recommended - Free tier available)

1. Go to [resend.com](https://resend.com)
2. Sign up for a free account
3. Get your API key from the dashboard
4. Add your domain or use their test domain

### Option B: SendGrid

1. Go to [sendgrid.com](https://sendgrid.com)
2. Sign up for a free account (100 emails/day)
3. Get your API key from the dashboard

### Option C: AWS SES

1. Go to AWS Console
2. Set up SES in your region
3. Get your access keys

## 2. Environment Variables

Add these to your `.env.local` file:

```bash
# For Resend
RESEND_API_KEY=your_resend_api_key_here
FROM_EMAIL=Hospital Sustainability <noreply@yourhospital.com>

# For SendGrid
SENDGRID_API_KEY=your_sendgrid_api_key_here

# For AWS SES
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_REGION=us-east-1

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## 3. Install Dependencies

The Resend package is already installed. For other services:

```bash
# For SendGrid
npm install @sendgrid/mail

# For AWS SES
npm install @aws-sdk/client-ses
```

## 4. Test the Email System

1. Assign a department head to a hospital
2. Click "Send Reminder" in the admin dashboard
3. Check the user's email inbox
4. Check the console for any errors

## 5. Email Features

The system sends:

- **Professional HTML emails** with hospital branding
- **Direct links** to the data entry page
- **Personalized content** with department head name
- **Clear call-to-action** buttons
- **Database logging** of all sent reminders

## 6. Troubleshooting

### Common Issues:

- **API key not set**: Check your environment variables
- **Domain not verified**: Verify your domain with the email service
- **Rate limits**: Check your email service's sending limits
- **Spam filters**: Check if emails are going to spam

### Testing:

- Use the email service's test mode first
- Check the browser console for errors
- Verify the API key is correct
- Test with a known good email address

## 7. Production Considerations

- **Domain verification**: Verify your domain with the email service
- **SPF/DKIM records**: Set up proper email authentication
- **Rate limits**: Monitor your sending limits
- **Bounce handling**: Set up bounce notifications
- **Analytics**: Track email delivery and open rates
