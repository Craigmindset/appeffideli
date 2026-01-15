# Admin Dashboard Setup Guide

## Overview

The admin dashboard has been successfully created with a complete role-based access control system. This guide covers the setup and features of the admin dashboard.

## Features Implemented

### 1. **Admin Dashboard Layout**

- Dedicated admin layout with sidebar navigation
- Dark/Light theme support
- Responsive design for mobile and desktop
- Collapsible sidebar

### 2. **Admin Pages**

#### Overview Page (`/admin/overview`)

- **Total Users Card**: Displays total registered users
- **Total Subscribers Card**: Shows active subscription count
- **Total Revenue Card**: Displays total revenue from orders

#### User Management Page (`/admin/users`)

- **User Table**: Displays all registered users with pagination (30 rows per page)
- **Search Functionality**: Search by name, email, or phone number
- **Filters**:
  - Filter by subscription plan (Basic, Premium, VIP, No Plan)
- **Columns**: Name, Email, Phone, Plan, Status, Role, Joined Date

#### Uploads Page (`/admin/uploads`)

Four upload cards for different document categories:

1. **Infant Recipe**: Upload infant recipe guides
2. **Meal Plan**: Upload meal planning documents
3. **Nutrition Guide**: Upload nutrition guides for toddlers
4. **Health Plan**: Upload health and nutrition plans

Each card has:

- File upload input (accepts .pdf, .doc, .docx)
- Upload button with progress indicator
- File size display

#### Meal Table Page (`/admin/meal-table`)

- **Editable Table**: View and edit weekly meal timetable
- **Columns**: Day, Breakfast, Lunch, Dinner, Snack
- **Features**:
  - Edit button for each row
  - Save/Cancel functionality
  - Real-time updates to database

#### Finances Page (`/admin/finances`)

- **Three Stats Cards**:
  1. Total Subscribers
  2. Total Revenue
  3. Total Profit (30% margin)
- **Charts** (requires recharts library):
  1. Bar chart showing subscription plan distribution
  2. Bar chart showing revenue by order type

#### Settings Page (`/admin/settings`)

- **Appearance Section**:
  - Theme toggle (Light/Dark mode)
- **Security Section**:
  - Password update form
  - Current password verification
- **Role & Permissions Section**:
  - Send invitation emails
  - Assign roles (User/Admin)

## Database Setup Required

### 1. Add Role Column to users_profile Table

Run this SQL in your Supabase SQL Editor:

\`\`\`sql
-- File: database/add-role-to-users-profile.sql
ALTER TABLE users_profile
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin'));

CREATE INDEX IF NOT EXISTS idx_users_profile_role ON users_profile(role);

UPDATE users_profile
SET role = 'user'
WHERE role IS NULL;
\`\`\`

### 2. Create admin_uploads Table

Run this SQL in your Supabase SQL Editor:

\`\`\`sql
-- File: database/create-admin-uploads-table.sql
-- See the file for complete SQL
\`\`\`

### 3. Create Supabase Storage Bucket

1. Go to Supabase Dashboard > Storage
2. Create a new bucket named `documents`
3. Set the bucket to public or configure appropriate RLS policies

## Setup Instructions

### Step 1: Update Database Schema

1. Navigate to your Supabase Dashboard
2. Go to SQL Editor
3. Run the SQL files in this order:
   - `database/add-role-to-users-profile.sql`
   - `database/create-admin-uploads-table.sql`

### Step 2: Set First Admin User

After running the schema updates, set your first admin user:

\`\`\`sql
UPDATE users_profile
SET role = 'admin'
WHERE email = 'your-admin-email@example.com';
\`\`\`

### Step 3: Install Required Dependencies

The recharts library has been installed for the charts functionality:

\`\`\`bash
pnpm add recharts
\`\`\`

### Step 4: Configure Supabase Storage

1. Create a `documents` bucket in Supabase Storage
2. Configure storage policies for admin uploads

### Step 5: Test Admin Access

1. Log out if currently logged in
2. Log in with the admin email you set in Step 2
3. You should be redirected to `/admin/overview`

## Role-Based Authentication

### Login Flow

The login page now includes role-based routing:

- **Admin users**: Redirected to `/admin/overview`
- **Regular users**: Redirected to `/dashboard/overview`

The role is determined from the `users_profile.role` column.

### Access Control

Admin routes are protected by:

1. Authentication check (must be logged in)
2. Role verification (must have `role = 'admin'`)
3. Automatic redirect to user dashboard if not admin

## File Structure

### Admin Components

\`\`\`
components/admin/
├── admin-dashboard-layout-client.tsx
├── admin-dashboard-sidebar.tsx
└── admin-dashboard-header.tsx
\`\`\`

### Admin Pages

\`\`\`
app/admin/
├── layout.tsx (Role verification)
├── overview/page.tsx
├── users/page.tsx
├── uploads/page.tsx
├── meal-table/page.tsx
├── finances/page.tsx
└── settings/page.tsx
\`\`\`

### Database Files

\`\`\`
database/
├── add-role-to-users-profile.sql
└── create-admin-uploads-table.sql
\`\`\`

## Navigation Structure

Admin Sidebar Menu:

1. Overview
2. User Management
3. Uploads
4. Meal Table
5. Finances
6. Settings
7. Logout

## Security Features

1. **Row Level Security (RLS)**: All tables have appropriate RLS policies
2. **Role-Based Access**: Only admin users can access admin routes
3. **Server-Side Verification**: Admin status checked on server in layout.tsx
4. **Password Requirements**: Minimum 6 characters for password updates

## Next Steps

1. **Email Integration**: Set up email service for sending invitations
2. **Storage Policies**: Configure detailed RLS policies for document uploads
3. **Analytics**: Add more detailed analytics and reporting
4. **Audit Logs**: Track admin actions for security
5. **Bulk Operations**: Add bulk user management features

## Troubleshooting

### Issue: Can't access admin dashboard

**Solution**: Verify your user has `role = 'admin'` in users_profile table

### Issue: Upload failing

**Solution**: Ensure Supabase Storage bucket `documents` exists and has proper permissions

### Issue: Charts not displaying

**Solution**: Ensure recharts is installed (`pnpm add recharts`)

### Issue: Login redirects to wrong dashboard

**Solution**: Clear localStorage and log in again to refresh role data

## Support

For issues or questions about the admin dashboard implementation, check:

- Supabase dashboard for database errors
- Browser console for client-side errors
- Network tab for API call failures
