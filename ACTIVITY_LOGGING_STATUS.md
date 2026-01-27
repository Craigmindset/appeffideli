# Activity Logging Implementation Status

## ✅ Implemented Activity Logging

### 1. **Login Activity**

**File:** `app/login/page.tsx`

- **When:** User successfully logs in
- **Activity Type:** `login`
- **Description:** "Signed in to dashboard"
- **Metadata:** Login timestamp

### 2. **Meal Subscription Activity**

**File:** `app/actions/meal-subscription.ts`

- **When:** User's subscription payment is verified and activated
- **Activity Type:** `subscription`
- **Description:** "Subscribed to [Basic/Premium/VIP] meal plan"
- **Metadata:**
  - `plan_type`: basic/premium/vip
  - `subscription_reference`
  - `payment_reference`

### 3. **Infant Recipe Purchase**

**File:** `app/actions/infant-recipes.ts`

- **When:** User completes payment for recipe pack
- **Activity Type:** `purchase`
- **Description:** "Purchased [Starter/Standard] infant recipe pack"
- **Metadata:**
  - `pack_type`: starter/standard
  - `amount`: Purchase amount
  - `reference`: Payment reference

### 4. **Download Activity**

**File:** `app/dashboard/onetime-infant-toddler/page.tsx`

- **When:** User downloads infant recipe pack
- **Activity Type:** `download`
- **Description:** "Downloaded [file name]"
- **Metadata:**
  - `file_name`: Name of downloaded file
  - `pack_type`: starter/standard

---

## 📋 Available Activities to Log (Not Yet Implemented)

### To Add in Future:

#### **Meal Plan Activities**

```typescript
// In meal timetable download
import { logMealPlanActivity } from "@/lib/activity-logger";
await logMealPlanActivity("Downloaded weekly meal timetable");
```

#### **Profile Updates**

```typescript
// When user updates profile
import { logProfileUpdate } from "@/lib/activity-logger";
await logProfileUpdate("profile picture");
await logProfileUpdate("contact information");
```

#### **Payment Activities**

```typescript
// When payment fails
import { logPaymentActivity } from "@/lib/activity-logger";
await logPaymentActivity("failed", 5000, "REF123");
```

---

## 🎯 How It Works

### Real-Time Display

The dashboard overview page (`app/dashboard/overview/page.tsx`) automatically:

1. Fetches recent activities on page load
2. Refreshes every 30 seconds
3. Displays time ago format (e.g., "2 hours ago")
4. Shows empty state if no activities

### Activity Flow

```
User Action → Activity Logger → Supabase user_activities table → Dashboard Display
```

### Example Timeline

```
✓ Signed in to dashboard               - Just now
✓ Purchased Standard infant recipe pack - 5 minutes ago
✓ Downloaded Infant & Toddler Recipe... - 10 minutes ago
✓ Subscribed to Premium meal plan       - 2 hours ago
```

---

## 🔧 Adding More Activity Logging

### Step 1: Choose the appropriate helper function

```typescript
import {
  logDownloadActivity, // For file downloads
  logSubscriptionActivity, // For subscription changes
  logPurchaseActivity, // For purchases
  logMealPlanActivity, // For meal plan interactions
  logPaymentActivity, // For payment events
  logLoginActivity, // For logins
  logProfileUpdate, // For profile changes
} from "@/lib/activity-logger";
```

### Step 2: Call it after the action

```typescript
// Example: After user cancels subscription
await logSubscriptionActivity("cancelled", "Premium");

// Example: After user downloads meal plan
await logMealPlanActivity("Downloaded shopping list");
```

### Step 3: It automatically appears in dashboard

- No additional code needed
- Real-time updates every 30 seconds
- Sorted by most recent first

---

## 📊 Current Activity Types

| Type             | Description            | Use Case                 |
| ---------------- | ---------------------- | ------------------------ |
| `login`          | User authentication    | User signs in            |
| `subscription`   | Subscription changes   | Subscribe, renew, cancel |
| `purchase`       | One-time purchases     | Buy recipe packs         |
| `download`       | File downloads         | Download PDFs            |
| `meal_plan`      | Meal plan interactions | View, edit meal plans    |
| `payment`        | Payment events         | Success, failure         |
| `profile_update` | Profile changes        | Update info              |

---

## 🎨 Display Features

### Time Format

- `Just now` - Less than 1 minute
- `5 minutes ago` - Less than 1 hour
- `2 hours ago` - Less than 24 hours
- `3 days ago` - Less than 7 days
- `2 weeks ago` - Less than 30 days
- `1 month ago` - 30+ days

### UI Components

- Activity icon indicator
- Activity description
- Relative time display
- Empty state for new users
- Loading state while fetching

---

## ✨ Benefits

1. **User Engagement**: Users see their activity history
2. **Transparency**: Clear record of all actions
3. **Support**: Helps troubleshoot user issues
4. **Analytics**: Track user behavior patterns
5. **Personalization**: Better understand user needs
