/**
 * Script to clean up old admin accounts that don't have Clerk integration
 * 
 * This script will:
 * 1. Scan all admins in DynamoDB
 * 2. Find admins without a clerkUserId field
 * 3. Delete them
 */

import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, ScanCommand, DeleteCommand } from '@aws-sdk/lib-dynamodb';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const client = new DynamoDBClient({
    region: process.env.VITE_AWS_REGION,
    credentials: {
        accessKeyId: process.env.VITE_AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.VITE_AWS_SECRET_ACCESS_KEY,
    },
});

const docClient = DynamoDBDocumentClient.from(client);
const adminTableName = process.env.VITE_DYNAMODB_ADMINS_TABLE;

async function cleanupOldAdmins() {
    try {
        console.log('Scanning for admins without Clerk integration...');
        
        // Scan all admins
        const scanCommand = new ScanCommand({
            TableName: adminTableName,
        });
        
        const response = await docClient.send(scanCommand);
        const allAdmins = response.Items || [];
        
        console.log(`\nTotal admins found: ${allAdmins.length}`);
        
        // Find admins without clerkUserId
        const adminsWithoutClerk = allAdmins.filter(admin => !admin.clerkUserId);
        const adminsWithClerk = allAdmins.filter(admin => admin.clerkUserId);
        
        console.log(`\nAdmins WITH Clerk integration: ${adminsWithClerk.length}`);
        adminsWithClerk.forEach((admin, index) => {
            console.log(`  ${index + 1}. ${admin.username} (${admin.email}) - Clerk ID: ${admin.clerkUserId}`);
        });
        
        console.log(`\nAdmins WITHOUT Clerk integration: ${adminsWithoutClerk.length}`);
        adminsWithoutClerk.forEach((admin, index) => {
            console.log(`  ${index + 1}. ${admin.username} (${admin.email})`);
        });
        
        if (adminsWithoutClerk.length === 0) {
            console.log('\n✅ No old admins to clean up!');
            return;
        }
        
        // Delete admins without clerkUserId
        console.log('\n🗑️  Deleting admins without Clerk integration...');
        
        for (const admin of adminsWithoutClerk) {
            const deleteCommand = new DeleteCommand({
                TableName: adminTableName,
                Key: { username: admin.username },
            });
            
            await docClient.send(deleteCommand);
            console.log(`   ✓ Deleted: ${admin.username} (${admin.email})`);
        }
        
        console.log('\n✅ Cleanup complete!');
        console.log(`   Deleted ${adminsWithoutClerk.length} old admin(s)`);
        console.log(`   Remaining admins: ${adminsWithClerk.length}`);
        
    } catch (error) {
        console.error('❌ Error during cleanup:', error);
    }
}

// Run the cleanup
cleanupOldAdmins();
