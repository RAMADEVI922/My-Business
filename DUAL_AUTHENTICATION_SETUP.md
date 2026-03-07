# Dual Authentication System with Clerk

This application implements **two separate authentication systems** using Clerk, one for Admins and one for Customers.

## Overview

### 1. Admin Authentication (my_business_admin)
- **Clerk Instance**: `verified-impala-96`
- **Environment Variable**: `VITE_CLERK_ADMIN_PUBLISHABLE_KEY`
- **Purpose**: Manages admin users who have access to the dashboard, product management, and order management
- **User Flow**: 
  1. User clicks "Admin Access" on Landing Page
  2. System sets `clerk_mode` to 'admin' in sessionStorage
  3. Page reloads to initialize admin Clerk instance
  4. Admin Login page displays Clerk SignIn component
  5. After authentication, user is redirected to Admin Dashboard

### 2. Customer Authentication (mybusiness)
- **Clerk Instance**: `lenient-crayfish-17`
- **Environment Variable**: `VITE_CLERK_CUSTOMER_PUBLISHABLE_KEY`
- **Purpose**: Manages customer users (regular customers and shop owners) who can browse and purchase products
- **User Flow**:
  1. User selects customer type (Shop Owner or Regular Customer) on Landing Page
  2. System sets `clerk_mode` to 'customer' in sessionStorage
  3. Page reloads to initialize customer Clerk instance
  4. Registration page displays Clerk SignUp component
  5. After registration, user selects a store from Store Selector
  6. User can then browse and purchase products

## Technical Implementation

### Mode Switching Mechanism

The application uses `sessionStorage.getItem('clerk_mode')` to determine which Clerk instance to load:

```javascript
// In main.jsx
const CLERK_MODE = sessionStorage.getItem('clerk_mode') || 'customer';
const PUBLISHABLE_KEY = CLERK_MODE === 'admin' 
    ? import.meta.env.VITE_CLERK_ADMIN_PUBLISHABLE_KEY 
    : import.meta.env.VITE_CLERK_CUSTOMER_PUBLISHABLE_KEY;
```

### Why Page Reload is Required

When switching between admin and customer modes, the page **must reload** because:
1. The Clerk instance is initialized once at app startup in `main.jsx`
2. Clerk's `ClerkProvider` cannot dynamically switch between different publishable keys
3. A page reload ensures the correct Clerk instance is loaded with the appropriate credentials

### Configuration Files

#### .env
```env
# Admin Clerk Account: my_business_admin (verified-impala-96)
VITE_CLERK_ADMIN_PUBLISHABLE_KEY=pk_test_dmVyaWZpZWQtaW1wYWxhLTk2LmNsZXJrLmFjY291bnRzLmRldiQ

# Customer Clerk Account: mybusiness (lenient-crayfish-17)
VITE_CLERK_CUSTOMER_PUBLISHABLE_KEY=pk_test_bGVuaWVudC1jcmF5ZmlzaC0xNy5jbGVyay5hY2NvdW50cy5kZXYk

# Default fallback (customer)
VITE_CLERK_PUBLISHABLE_KEY=pk_test_bGVuaWVudC1jcmF5ZmlzaC0xNy5jbGVyay5hY2NvdW50cy5kZXYk
```

#### main.jsx
- Reads `clerk_mode` from sessionStorage
- Selects appropriate Clerk publishable key
- Initializes ClerkProvider with the correct key
- Logs which instance is being loaded for debugging

#### App.jsx
- Manages view state and routing
- Handles mode switching with page reload
- Ensures correct authentication flow for each user type

## Authentication Flow Diagrams

### Admin Flow
```
Welcome Screen
    ↓
Landing Page → Click "Admin Access"
    ↓
Set clerk_mode = 'admin' → Page Reload
    ↓
Admin Login (Clerk SignIn with admin instance)
    ↓
Admin Dashboard
```

### Customer Flow
```
Welcome Screen
    ↓
Landing Page → Select Customer Type
    ↓
Set clerk_mode = 'customer' → Page Reload
    ↓
Customer Registration (Clerk SignUp with customer instance)
    ↓
Store Selector (Choose admin store)
    ↓
Customer Products (Browse and purchase)
```

## Important Notes

1. **Separate Credential Storage**: Admin credentials are stored in the `my_business_admin` Clerk account, and customer credentials are stored in the `mybusiness` Clerk account. They are completely isolated.

2. **Mode Persistence**: The `clerk_mode` persists in sessionStorage, so if a user refreshes the page, they remain in the same mode.

3. **Clean Start**: The Welcome Screen clears any existing `clerk_mode` to ensure a fresh start when the app is first opened.

4. **Debugging**: Console logs in `main.jsx` show which Clerk instance is being loaded, making it easy to verify the correct authentication system is active.

5. **Error Prevention**: The system prevents 401/422 Clerk errors by ensuring the correct instance is loaded before authentication attempts.

## Troubleshooting

### Issue: Admin signup stores credentials in customer Clerk account
**Solution**: Ensure `clerk_mode` is set to 'admin' before the page loads. Check console logs to verify the correct instance is loaded.

### Issue: 401/422 Clerk authentication errors
**Solution**: These errors occur when the wrong Clerk instance is loaded. Verify:
- The correct publishable key is in `.env`
- The `clerk_mode` is set correctly in sessionStorage
- The page reloaded after mode switch

### Issue: User sees wrong view after mode switch
**Solution**: The app sets `app_view` in sessionStorage before reload to ensure the correct view is displayed after the page reloads.

## Testing the Dual Authentication

1. **Test Admin Flow**:
   - Open app → Click "Get Started" → Click "Admin Access"
   - Verify console shows "Loading Admin Clerk Instance"
   - Sign up/in with admin credentials
   - Verify you reach the Admin Dashboard

2. **Test Customer Flow**:
   - Open app → Click "Get Started" → Select customer type
   - Verify console shows "Loading Customer Clerk Instance"
   - Sign up with customer credentials
   - Verify you reach Store Selector, then Products

3. **Test Mode Switching**:
   - Start as customer → Go back to landing → Click "Admin Access"
   - Verify page reloads and admin Clerk instance loads
   - Start as admin → Go back to landing → Select customer type
   - Verify page reloads and customer Clerk instance loads
