#!/usr/bin/env node

import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, ScanCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const region = process.env.VITE_AWS_REGION;
const accessKeyId = process.env.VITE_AWS_ACCESS_KEY_ID;
const secretAccessKey = process.env.VITE_AWS_SECRET_ACCESS_KEY;
const adminTableName = process.env.VITE_DYNAMODB_ADMINS_TABLE || "Admins";

const client = new DynamoDBClient({
    region,
    credentials: {
        accessKeyId,
        secretAccessKey,
    },
});

const docClient = DynamoDBDocumentClient.from(client);

async function updateAdminContact() {
    try {
        console.log('🔍 Searching for admin "sai satyavarapu"...');
        
        // First, find the admin by username
        const scanCommand = new ScanCommand({
            TableName: adminTableName,
            FilterExpression: 'contains(#username, :searchTerm)',
            ExpressionAttributeNames: {
                '#username': 'username'
            },
            ExpressionAttributeValues: {
                ':searchTerm': 'sai'
            }
        });
        
        const result = await docClient.send(scanCommand);
        console.log('📋 Found admins:', result.Items?.map(a => ({
            username: a.username,
            email: a.email || a.Email,
            currentPhone: a.phone || a.Phone || 'Not set'
        })));
        
        // Find the specific admin
        const admin = result.Items?.find(a => 
            a.username?.toLowerCase().includes('sai') && 
            a.username?.toLowerCase().includes('satyavarapu')
        );
        
        if (!admin) {
            console.log('❌ Admin "sai satyavarapu" not found');
            console.log('💡 Available admins:', result.Items?.map(a => a.username));
            return;
        }
        
        console.log('✅ Found admin:', {
            username: admin.username,
            email: admin.email || admin.Email,
            currentPhone: admin.phone || admin.Phone || 'Not set'
        });
        
        // Update the admin's phone number
        const updateCommand = new UpdateCommand({
            TableName: adminTableName,
            Key: { username: admin.username },
            UpdateExpression: 'SET phone = :phone, updatedAt = :updatedAt',
            ExpressionAttributeValues: {
                ':phone': '+91 8143093908',
                ':updatedAt': new Date().toISOString()
            }
        });
        
        await docClient.send(updateCommand);
        
        console.log('✅ Successfully updated phone number for admin:', admin.username);
        console.log('📞 New phone number: +91 8143093908');
        
    } catch (error) {
        console.error('❌ Error updating admin contact:', error);
    }
}

// Run the update
updateAdminContact();