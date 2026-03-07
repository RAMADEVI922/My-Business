import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, ScanCommand } from "@aws-sdk/lib-dynamodb";
import { readFileSync } from 'fs';

// Read .env file manually
const envContent = readFileSync('.env', 'utf-8');
const envVars = {};
envContent.split('\n').forEach(line => {
    line = line.trim();
    if (line && !line.startsWith('#')) {
        const match = line.match(/^([^=]+)=(.*)$/);
        if (match) {
            envVars[match[1].trim()] = match[2].trim();
        }
    }
});

const region = envVars.VITE_AWS_REGION;
const accessKeyId = envVars.VITE_AWS_ACCESS_KEY_ID;
const secretAccessKey = envVars.VITE_AWS_SECRET_ACCESS_KEY;
const adminTableName = envVars.VITE_DYNAMODB_ADMINS_TABLE || "Admins";

console.log('Config:', { region, hasAccessKey: !!accessKeyId, adminTableName });

const client = new DynamoDBClient({
    region,
    credentials: { accessKeyId, secretAccessKey }
});

const docClient = DynamoDBDocumentClient.from(client);

async function listAllAdmins() {
    try {
        console.log('\n🔍 Scanning DynamoDB Admins table...\n');
        
        const command = new ScanCommand({
            TableName: adminTableName
        });
        
        const result = await docClient.send(command);
        
        if (!result.Items || result.Items.length === 0) {
            console.log('❌ No admins found in database');
            return;
        }
        
        console.log(`✅ Found ${result.Items.length} admin(s):\n`);
        
        result.Items.forEach((admin, index) => {
            console.log(`${index + 1}. Admin Details:`);
            console.log(`   Username: ${admin.username}`);
            console.log(`   Email: ${admin.email || admin.Email || 'N/A'}`);
            console.log(`   Clerk User ID: ${admin.clerkUserId || 'NOT LINKED'}`);
            console.log(`   Store Name: ${admin.storeName || 'N/A'}`);
            console.log(`   Has Password: ${admin.password || admin.Password ? 'Yes' : 'No'}`);
            console.log(`   Created At: ${admin.createdAt || 'N/A'}`);
            console.log(`   Updated At: ${admin.updatedAt || 'N/A'}`);
            console.log('');
        });
        
        // Show Clerk integration status
        const linkedAdmins = result.Items.filter(a => a.clerkUserId);
        const unlinkedAdmins = result.Items.filter(a => !a.clerkUserId);
        
        console.log('📊 Clerk Integration Status:');
        console.log(`   ✅ Linked to Clerk: ${linkedAdmins.length}`);
        console.log(`   ⏳ Not Linked: ${unlinkedAdmins.length}`);
        
        if (unlinkedAdmins.length > 0) {
            console.log('\n💡 Admins that need to log in through Clerk:');
            unlinkedAdmins.forEach(admin => {
                console.log(`   - ${admin.username} (${admin.email || admin.Email})`);
            });
        }
        
    } catch (error) {
        console.error('❌ Error listing admins:', error);
    }
}

listAllAdmins();
