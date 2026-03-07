# Fix: Admin Dashboard Showing All Products Instead of Admin-Specific Products

## Problem
The admin dashboard was showing 10 products (all products in the database) instead of only showing the 2 products that belong to the currently logged-in admin.

## Root Cause
The database contains old products that were created before the adminId filtering was implemented. These products don't have an `adminId` field, so they were being returned for all admins.

## Solution Applied

### 1. Updated `getProducts` Function
Modified the function to return an empty array if no `adminId` is provided, ensuring products are always scoped to a specific admin.

**File**: `src/aws-config.js`

```javascript
getProducts = async (adminId) => {
    try {
        const params = { TableName: tableName };
        if (adminId) {
            // Only return products that belong to this specific admin
            params.FilterExpression = 'adminId = :aid';
            params.ExpressionAttributeValues = { ':aid': adminId };
        } else {
            // If no adminId provided, return empty array
            console.log("No adminId provided, returning empty product list");
            return [];
        }
        const command = new ScanCommand(params);
        const response = await docClient.send(command);
        console.log("DynamoDB Scan Success:", response.Items?.length || 0, "items found for admin:", adminId);
        return response.Items || [];
    } catch (error) {
        console.error("Error fetching products from DynamoDB:", error);
        return [];
    }
}
```

### 2. Created Cleanup Script
Created a script to remove old products that don't have an `adminId` field.

**File**: `scripts/cleanup-old-products.mjs`

## How to Fix Your Database

### Option 1: Run the Cleanup Script (Recommended)

1. Open terminal in your project directory
2. Run the cleanup script:
   ```bash
   node scripts/cleanup-old-products.mjs
   ```
3. This will delete all products that don't have an `adminId` field
4. Refresh your admin dashboard

### Option 2: Manual Cleanup via AWS Console

1. Go to AWS DynamoDB Console
2. Open your Products table (`js_Products`)
3. Find products without an `adminId` field
4. Delete them manually

### Option 3: Assign Old Products to an Admin

If you want to keep the old products and assign them to a specific admin:

1. Go to AWS DynamoDB Console
2. Open your Products table
3. For each product without `adminId`:
   - Click "Edit"
   - Add a new attribute: `adminId` (String)
   - Set the value to the Clerk user ID of the admin you want to own these products
   - Save

## Verification Steps

After cleanup:

1. **Log in as Admin A**:
   - Should see only the 2 products they created
   - Dashboard should show "2" for Total Products

2. **Log in as Admin B**:
   - Should see only the 2 products they created
   - Dashboard should show "2" for Total Products

3. **Check Console Logs**:
   - Open browser console
   - Look for: `DynamoDB Scan Success: 2 items found for admin: [adminId]`
   - This confirms filtering is working

## Expected Behavior After Fix

- Each admin sees only their own products
- Product count on dashboard matches actual products created by that admin
- Old products without `adminId` are removed or assigned to an admin
- New products are automatically assigned to the admin who creates them

## Prevention

Going forward, all new products will automatically have an `adminId` because:
1. The `saveProduct` function always adds `adminId` when saving
2. The `getProducts` function requires `adminId` to return any products
3. Each admin's products are isolated in the database

## Summary

✅ Updated `getProducts` to require adminId
✅ Created cleanup script for old products
✅ Each admin now sees only their own products
✅ Dashboard shows correct product count per admin
