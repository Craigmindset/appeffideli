# Supabase Authentication Setup

This guide will help you set up Supabase authentication for your application.

## What's Been Implemented

### 1. Database Schema

- Created `users_profile` table to store user information
- Table includes: id, email, full_name, phone, avatar_url, created_at, updated_at
- Row Level Security (RLS) policies enabled for user privacy
- Auto-updating timestamps

### 2. Authentication System

- **Signup**: Users can create accounts with email and password
- **Login**: Users can authenticate using Supabase
- **User Profile**: Automatically creates a profile record for each user

### 3. Files Created/Modified

#### New Files:

- `database/create-users-profile-table.sql` - Database schema
- `lib/supabase-browser.ts` - Browser-side Supabase client
- `app/actions/auth.ts` - Server actions for authentication
- `scripts/create-users-profile-table.ts` - Setup script

#### Modified Files:

- `app/signup/page.tsx` - Now uses Supabase for registration
- `app/login/page.tsx` - Now uses Supabase for authentication

## Setup Instructions

### Step 1: Create the Database Table

You have two options to create the `users_profile` table:

#### Option A: Manual Setup (Recommended)

1. Go to your Supabase dashboard
2. Navigate to SQL Editor
3. Copy the contents of `database/create-users-profile-table.sql`
4. Paste and execute the SQL in the editor

#### Option B: Using the Setup Script

```bash
pnpm tsx scripts/create-users-profile-table.ts
```

### Step 2: Verify Your Environment Variables

Make sure your `.env.local` file has the following variables:

```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
KEEPALIVE_TOKEN=a-long-random-string
```

You can find these values in your Supabase project settings under "API".

### Optional: Prevent Free-Tier Inactivity Pausing

If you're on a free Supabase plan and want to reduce the chance of your project pausing due to inactivity, this repo includes a lightweight keepalive endpoint you can ping on a schedule:

- Endpoint: `GET /api/keepalive`
- Token: set `KEEPALIVE_TOKEN` in your deployment environment (and send it as an `x-keepalive-token` header)

This repo also includes a GitHub Actions workflow that runs every 5 hours and calls that endpoint. To enable it:

- Add GitHub repo secret `KEEPALIVE_URL` = `https://<your-domain>/api/keepalive`
- Add GitHub repo secret `KEEPALIVE_TOKEN` = the same value as your deployed `KEEPALIVE_TOKEN`

Note: scheduled workflows run in UTC and may be delayed slightly by GitHub.

### Step 3: Test Authentication

1. Start your development server:

```bash
pnpm dev
```

2. Navigate to `/signup` and create a test account
3. After signup, you should be automatically logged in and redirected to `/dashboard/overview`
4. Try logging out and logging back in at `/login`

## How It Works

### Signup Flow

1. User enters email, password, and optional full name
2. Server action creates user in Supabase Auth
3. Server action creates profile in `users_profile` table
4. User is automatically signed in
5. Redirected to dashboard

### Login Flow

1. User enters email and password
2. Supabase validates credentials
3. Session is created in browser
4. User data stored in localStorage for compatibility
5. Redirected to dashboard

### User Profile

The `users_profile` table stores additional user information beyond what Supabase Auth provides:

- `id`: References the auth.users id
- `email`: User's email address
- `full_name`: Optional display name
- `phone`: Optional phone number
- `avatar_url`: Optional profile picture URL

## Security Features

1. **Row Level Security (RLS)**: Users can only access their own profile data
2. **Password Hashing**: Handled automatically by Supabase
3. **Email Confirmation**: Can be enabled in Supabase settings (currently auto-confirmed)
4. **Session Management**: Secure session handling via Supabase

## Next Steps

### Optional Enhancements:

1. **Email Verification**: Enable email confirmation in Supabase settings
2. **Password Reset**: Implement forgot password functionality
3. **Profile Updates**: Allow users to update their profile information
4. **OAuth Providers**: Add social login (Google, GitHub, etc.)
5. **Protected Routes**: Add middleware to protect authenticated routes

### Usage Examples:

#### Get Current User (Client-side)

```typescript
import { createClient } from "@/lib/supabase-browser";

const supabase = createClient();
const {
  data: { user },
} = await supabase.auth.getUser();
```

#### Update User Profile

```typescript
import { updateUserProfile } from "@/app/actions/auth";

await updateUserProfile(userId, {
  full_name: "John Doe",
  phone: "+1234567890",
});
```

#### Sign Out

```typescript
import { createClient } from "@/lib/supabase-browser";

const supabase = createClient();
await supabase.auth.signOut();
```

## Troubleshooting

### "Table users_profile does not exist"

- Run the SQL script in Supabase SQL Editor
- Check that you're connected to the correct project

### "Invalid credentials"

- Verify email and password are correct
- Check Supabase dashboard for user records

### "Failed to create user"

- Check Supabase logs in dashboard
- Verify service role key is set correctly
- Ensure email doesn't already exist

## Support

For more information, visit:

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Next.js App Router Guide](https://nextjs.org/docs/app)
