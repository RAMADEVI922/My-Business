import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";
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

const client = new DynamoDBClient({
    region,
    credentials: { accessKeyId, secretAccessKey }
});

const docClient = DynamoDBDocumentClient.from(client);

// Admins to add based on Clerk accounts
const adminsToAdd = [
    {
        username: 'ramadevi',
        email: 'sunkara746@gmail.com',
        password: 'TempPassword123!', // Temporary password - should be changed
        createdAt: new Date().toISOString()
    },
    {
        username: 'sailaxmi',
        email: 'ramadevisunkara780@gmail.com',
        password: 'TempPassword123!', // Temporary password - should be changed
        createdAt: new Date().toISOString()
    }
];

async function addMissingAdmins() {
    try {
        console.log('\n🔧 Adding missing admin accounts to DynamoDB...\n');
        
        for (const admin of adminsToAdd) {
            console.log(`Adding admin: ${admin.username} (${admin.email})`);
            
            const command = new PutCommand({
                TableName: adminTableName,
                Item: admin
            });
            
            await docClient.send(command);
            console.log(`✅ Successfully added ${admin.username}\n`);
        }
        
        console.log('🎉 All missing admins have been added!');
        console.log('\n💡 Next steps:');
        console.log('   1. Have each admin log in through the Admin Portal');
        console.log('   2. Their Clerk account will be automatically linked');
        console.log('   3. They will appear in the Store Selector dropdown');
        console.log('\n⚠️  Note: Temporary password is "TempPassword123!" - admins should change it after first login');
        
    } catch (error) {
        console.error('❌ Error adding admins:', error);
    }
}

addMissingAdmins();
