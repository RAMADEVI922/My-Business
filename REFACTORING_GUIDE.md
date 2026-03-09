# Project Refactoring Guide

## Overview
This guide outlines the complete refactoring of the project structure for better maintainability.

## New Folder Structure

```
src/
├── admin/
│   ├── components/
│   │   ├── AdminDashboard.jsx
│   │   ├── AdminNavbar.jsx
│   │   └── DeliveryCalendar.jsx
│   └── index.js (barrel export)
├── customer/
│   ├── components/
│   │   ├── CustomerProducts.jsx
│   │   ├── CartView.jsx
│   │   ├── OrderAddress.jsx
│   │   ├── OrderConfirmed.jsx
│   │   ├── MyOrders.jsx
│   │   ├── StoreSelector.jsx
│   │   ├── ProductCard.jsx
│   │   ├── RecommendationSection.jsx
│   │   ├── SearchBar.jsx
│   │   └── SignaturePad.jsx
│   └── index.js (barrel export)
├── auth/
│   ├── components/
│   │   ├── AdminLogin.jsx
│   │   ├── CustomerLogin.jsx
│   │   ├── CustomerRegister.jsx
│   │   ├── ForgotPassword.jsx
│   │   └── ShopOwnerDocuments.jsx
│   └── index.js (barrel export)
├── components/
│   ├── common/
│   │   ├── Navbar.jsx
│   │   ├── WelcomeScreen.jsx
│   │   ├── LandingPage.jsx
│   │   ├── ContactUs.jsx
│   │   └── AppRoutes.jsx
│   └── index.js (barrel export)
├── services/
│   ├── aws-config.js (renamed from aws-config.js)
│   ├── api.js (if needed for future API calls)
│   └── index.js (barrel export)
├── utils/
│   ├── helpers.js (existing)
│   ├── navigationHandlers.js (existing)
│   └── index.js (barrel export)
├── hooks/
│   ├── useAppState.js
│   ├── useAuth.js
│   ├── useCart.js
│   ├── useOrders.js
│   ├── useProducts.js
│   ├── useRecommendations.js
│   └── index.js (barrel export)
├── styles/
│   ├── index.css
│   └── mobile-fixes.css
├── App.jsx
└── main.jsx
```

## Migration Steps

### Step 1: Create New Folders
```bash
# Create admin structure
mkdir -p src/admin/components

# Create customer structure  
mkdir -p src/customer/components

# Create auth structure
mkdir -p src/auth/components

# Create common components
mkdir -p src/components/common

# Create services folder
mkdir -p src/services

# Create styles folder
mkdir -p src/styles
```

### Step 2: Move Admin Files
```bash
# Move admin components
mv src/components/AdminDashboard.jsx src/admin/components/
mv src/components/AdminNavbar.jsx src/admin/components/
mv src/components/DeliveryCalendar.jsx src/admin/components/
```

### Step 3: Move Customer Files
```bash
# Move customer components
mv src/components/CustomerProducts.jsx src/customer/components/
mv src/components/CartView.jsx src/customer/components/
mv src/components/OrderAddress.jsx src/customer/components/
mv src/components/OrderConfirmed.jsx src/customer/components/
mv src/components/MyOrders.jsx src/customer/components/
mv src/components/StoreSelector.jsx src/customer/components/
mv src/components/ProductCard.jsx src/customer/components/
mv src/components/RecommendationSection.jsx src/customer/components/
mv src/components/SearchBar.jsx src/customer/components/
mv src/components/SignaturePad.jsx src/customer/components/
```

### Step 4: Move Auth Files
```bash
# Move auth components
mv src/components/AdminLogin.jsx src/auth/components/
mv src/components/CustomerLogin.jsx src/auth/components/
mv src/components/CustomerRegister.jsx src/auth/components/
mv src/components/ForgotPassword.jsx src/auth/components/
mv src/components/ShopOwnerDocuments.jsx src/auth/components/
```

### Step 5: Move Common Components
```bash
# Move common components
mv src/components/Navbar.jsx src/components/common/
mv src/components/WelcomeScreen.jsx src/components/common/
mv src/components/LandingPage.jsx src/components/common/
mv src/components/ContactUs.jsx src/components/common/
mv src/components/AppRoutes.jsx src/components/common/
```

### Step 6: Move Services
```bash
# Move AWS config to services
mv src/aws-config.js src/services/
```

### Step 7: Move Styles
```bash
# Move styles
mv src/index.css src/styles/
mv src/mobile-fixes.css src/styles/
```

### Step 8: Update Import Paths

This is the most critical step. All import statements need to be updated.

## Import Path Changes

### Old → New Mappings

**Admin Components:**
- `'./components/AdminDashboard'` → `'./admin/components/AdminDashboard'`
- `'./components/AdminNavbar'` → `'./admin/components/AdminNavbar'`
- `'./components/DeliveryCalendar'` → `'./admin/components/DeliveryCalendar'`

**Customer Components:**
- `'./components/CustomerProducts'` → `'./customer/components/CustomerProducts'`
- `'./components/CartView'` → `'./customer/components/CartView'`
- `'./components/OrderAddress'` → `'./customer/components/OrderAddress'`
- `'./components/MyOrders'` → `'./customer/components/MyOrders'`
- `'./components/StoreSelector'` → `'./customer/components/StoreSelector'`

**Auth Components:**
- `'./components/AdminLogin'` → `'./auth/components/AdminLogin'`
- `'./components/CustomerLogin'` → `'./auth/components/CustomerLogin'`
- `'./components/CustomerRegister'` → `'./auth/components/CustomerRegister'`
- `'./components/ForgotPassword'` → `'./auth/components/ForgotPassword'`
- `'./components/ShopOwnerDocuments'` → `'./auth/components/ShopOwnerDocuments'`

**Common Components:**
- `'./components/Navbar'` → `'./components/common/Navbar'`
- `'./components/WelcomeScreen'` → `'./components/common/WelcomeScreen'`
- `'./components/LandingPage'` → `'./components/common/LandingPage'`
- `'./components/ContactUs'` → `'./components/common/ContactUs'`
- `'./components/AppRoutes'` → `'./components/common/AppRoutes'`

**Services:**
- `'./aws-config'` → `'./services/aws-config'`
- `'../aws-config'` → `'../services/aws-config'` or `'../../services/aws-config'`

**Styles:**
- `'./index.css'` → `'./styles/index.css'`
- `'./mobile-fixes.css'` → `'./styles/mobile-fixes.css'`

## Files That Need Import Updates

1. **src/App.jsx** - Update all component imports
2. **src/main.jsx** - Update CSS imports
3. **src/components/common/AppRoutes.jsx** - Update all component imports
4. **All component files** - Update relative imports to aws-config and other components
5. **All hook files** - Update imports to aws-config

## Testing Checklist

After refactoring:
- [ ] Run `npm run build` - Should complete without errors
- [ ] Check all pages load correctly
- [ ] Test admin dashboard functionality
- [ ] Test customer shopping flow
- [ ] Test authentication (login/register)
- [ ] Test cart and checkout
- [ ] Test order management
- [ ] Verify all API calls work
- [ ] Check responsive design on mobile

## Rollback Plan

If issues occur:
1. Keep a backup of the original structure
2. Use git to revert: `git checkout -- .`
3. Or restore from the backup

## Benefits of New Structure

1. **Better Organization** - Clear separation of concerns
2. **Easier Navigation** - Find files quickly
3. **Scalability** - Easy to add new features
4. **Maintainability** - Isolated changes
5. **Team Collaboration** - Clear ownership of modules
6. **Code Reusability** - Common components easily accessible

## Notes

- This refactoring does NOT change any functionality
- Only file locations and import paths are updated
- All existing features will work exactly the same
- The build output remains identical

---

**IMPORTANT:** Due to the complexity of this refactoring (22+ files to move, 50+ import statements to update), I recommend:

1. **Create a new branch** before starting
2. **Move files in batches** (admin → customer → auth → common)
3. **Test after each batch** to catch issues early
4. **Use find-and-replace** carefully for import updates
5. **Keep the old structure** until fully tested

Would you like me to proceed with creating the actual refactored files, or would you prefer to do this manually following this guide?
