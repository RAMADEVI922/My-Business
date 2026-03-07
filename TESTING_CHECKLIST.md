# Dual Authentication Testing Checklist

Use this checklist to verify the dual authentication system is working correctly.

## Prerequisites
- [ ] Restart the development server after updating `.env` file
- [ ] Clear browser cache and sessionStorage
- [ ] Open browser console to view authentication logs

## Test 1: Admin Authentication Flow

### Steps:
1. [ ] Open the application in a fresh browser tab
2. [ ] Click "Get Started" button on Welcome Screen
3. [ ] Click "Admin Access" button on Landing Page
4. [ ] Verify in console: "Loading Admin Clerk Instance (my_business_admin - verified-impala-96)"
5. [ ] Verify page reloaded and shows Admin Login page
6. [ ] Sign up with a new admin account OR sign in with existing admin credentials
7. [ ] Verify you are redirected to Admin Dashboard
8. [ ] Verify no 401/422 Clerk errors in console

### Expected Results:
- ✅ Console shows admin Clerk instance is loaded
- ✅ Admin credentials are stored in `verified-impala-96` Clerk account
- ✅ Successfully authenticated and redirected to dashboard
- ✅ No authentication errors

## Test 2: Customer Authentication Flow

### Steps:
1. [ ] Open the application in a fresh browser tab
2. [ ] Click "Get Started" button on Welcome Screen
3. [ ] Select either "Shop Owner" or "Regular Customer" on Landing Page
4. [ ] Verify in console: "Loading Customer Clerk Instance (mybusiness - lenient-crayfish-17)"
5. [ ] Verify page reloaded and shows Customer Registration page
6. [ ] Sign up with a new customer account OR sign in with existing customer credentials
7. [ ] Verify you are redirected to Store Selector page
8. [ ] Select a store and click "Shop Here"
9. [ ] Verify you are redirected to Customer Products page
10. [ ] Verify no 401/422 Clerk errors in console

### Expected Results:
- ✅ Console shows customer Clerk instance is loaded
- ✅ Customer credentials are stored in `lenient-crayfish-17` Clerk account
- ✅ Successfully authenticated and redirected to store selector
- ✅ Can select store and view products
- ✅ No authentication errors

## Test 3: Mode Switching (Customer to Admin)

### Steps:
1. [ ] Complete Test 2 (logged in as customer)
2. [ ] Navigate back to Landing Page (if navbar allows, or manually clear view)
3. [ ] Click "Admin Access" button
4. [ ] Verify in console: "Switching to Admin mode - reloading to load admin Clerk instance"
5. [ ] Verify page reloaded
6. [ ] Verify console shows: "Loading Admin Clerk Instance"
7. [ ] Sign in with admin credentials
8. [ ] Verify you reach Admin Dashboard

### Expected Results:
- ✅ Page reloads when switching modes
- ✅ Correct Clerk instance is loaded after reload
- ✅ Can authenticate with admin credentials
- ✅ No cross-contamination of credentials

## Test 4: Mode Switching (Admin to Customer)

### Steps:
1. [ ] Complete Test 1 (logged in as admin)
2. [ ] Click "Back to Customer Portal" on Admin Login page
3. [ ] Select a customer type on Landing Page
4. [ ] Verify in console: "Switching to Customer mode - reloading to load customer Clerk instance"
5. [ ] Verify page reloaded
6. [ ] Verify console shows: "Loading Customer Clerk Instance"
7. [ ] Sign up/in with customer credentials
8. [ ] Verify you reach Store Selector

### Expected Results:
- ✅ Page reloads when switching modes
- ✅ Correct Clerk instance is loaded after reload
- ✅ Can authenticate with customer credentials
- ✅ No cross-contamination of credentials

## Test 5: Verify Credential Isolation

### Steps:
1. [ ] Log into Clerk dashboard for `my_business_admin` (verified-impala-96)
2. [ ] Verify admin users are listed there
3. [ ] Log into Clerk dashboard for `mybusiness` (lenient-crayfish-17)
4. [ ] Verify customer users are listed there
5. [ ] Confirm no admin users appear in customer Clerk account
6. [ ] Confirm no customer users appear in admin Clerk account

### Expected Results:
- ✅ Admin credentials only in admin Clerk account
- ✅ Customer credentials only in customer Clerk account
- ✅ Complete isolation between the two systems

## Common Issues and Solutions

### Issue: Console shows wrong Clerk instance
**Solution**: 
- Clear sessionStorage: `sessionStorage.clear()`
- Refresh the page
- Start from Welcome Screen

### Issue: 401/422 Clerk errors
**Solution**:
- Verify `.env` file has correct keys
- Restart development server
- Clear browser cache
- Check console logs to see which instance is loaded

### Issue: Page doesn't reload when switching modes
**Solution**:
- Check browser console for errors
- Verify `window.location.reload()` is being called
- Check if `clerk_mode` is being set in sessionStorage

### Issue: Credentials stored in wrong Clerk account
**Solution**:
- Verify the correct Clerk instance is loaded (check console)
- Delete the incorrectly stored user from Clerk dashboard
- Clear sessionStorage and try again

## Success Criteria

All tests pass when:
- ✅ Admin users authenticate through `verified-impala-96` Clerk instance
- ✅ Customer users authenticate through `lenient-crayfish-17` Clerk instance
- ✅ No 401/422 authentication errors
- ✅ Mode switching works correctly with page reload
- ✅ Credentials are completely isolated between the two Clerk accounts
- ✅ Console logs clearly show which instance is loaded
