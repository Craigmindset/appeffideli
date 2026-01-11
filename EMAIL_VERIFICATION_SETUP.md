# Email Verification Setup Guide

## Overview

Email verification is now **required** for all new user signups. Users must verify their email address before they can sign in to the application.

## Changes Made

### 1. Updated Signup Flow

- Removed `email_confirm: true` from signup function
- Changed from `admin.createUser` to `signUp` to trigger email verification
- Users receive a verification email after signup
- Profile is created after email verification

### 2. Updated Login Flow

- Added email verification check before allowing login
- Users see error message: "Please verify your email address before signing in"
- Profile auto-creation for verified users who don't have one yet

### 3. Updated Success Page

- Clear messaging about email verification requirement
- Instructions to check spam folder if email not received

## Supabase Configuration Required

### Step 1: Enable Email Confirmation

1. Go to your Supabase Dashboard
2. Navigate to **Authentication** > **Providers**
3. Under **Email** provider settings, ensure:
   - ✅ **Enable email confirmations** is checked
   - Set **Confirm email** to ON

### Step 2: Configure Email Templates (Optional but Recommended)

1. Go to **Authentication** > **Email Templates**
2. Customize the **Confirm signup** template:
   ```html
   <h2>Confirm Your Email</h2>
   <p>Thanks for signing up with Effideli!</p>
   <p>Please click the link below to verify your email address:</p>
   <p><a href="{{ .ConfirmationURL }}">Verify Email Address</a></p>
   ```

### Step 3: Set Redirect URL

1. Go to **Authentication** > **URL Configuration**
2. Add your site URL to **Redirect URLs**:
   - Development: `http://localhost:3000/login?verified=true`
   - Production: `https://yourdomain.com/login?verified=true`

### Step 4: Update Environment Variables

Add to your `.env.local` file:

```env
NEXT_PUBLIC_SITE_URL=http://localhost:3000  # or your production URL
```

## Testing Email Verification

### Local Development

For local testing, Supabase provides an **Inbucket** email inbox:

1. Go to your Supabase project
2. Navigate to **Authentication** > **Email Templates**
3. Click **Inbucket** link to view test emails
4. All emails sent during development appear here

### Production

Ensure you configure SMTP settings in Supabase:

1. Go to **Project Settings** > **Auth**
2. Scroll to **SMTP Settings**
3. Configure your email provider (SendGrid, AWS SES, etc.)

## User Flow

### Signup Flow:

1. User fills out signup form
2. Account created but **not confirmed**
3. Verification email sent to user's inbox
4. User redirected to success page with instructions
5. User clicks verification link in email
6. Email confirmed, user can now sign in

### Login Flow:

1. User enters email/password
2. System checks if email is verified
3. If **not verified**: Shows error "Please verify your email address"
4. If **verified**: Login proceeds normally

## Troubleshooting

### Users not receiving emails?

- Check Supabase email logs in **Authentication** > **Logs**
- Verify SMTP settings are configured (production)
- Check spam/junk folders
- Use Inbucket for development testing

### Email already exists error?

- User may have signed up before
- Check if they verified their email
- They can try logging in or use "Forgot Password"

### Verification link expired?

- Default expiry is 24 hours
- User can request a new verification email
- Consider implementing a "Resend verification email" feature

## Future Enhancements

Consider adding:

1. **Resend Verification Email** button on login page
2. **Email verification status** indicator in user profile
3. **Custom email templates** with branded design
4. **Welcome email** after successful verification
5. **Rate limiting** on verification email resends
