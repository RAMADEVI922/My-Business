/**
 * Script to clean up old products that don't have an adminId
 * 
 * This script will:
 * 1. Scan all products in DynamoDB
 * 2. Find products without an adminId field
 * 3. Delete them (or optionally assign them to an admin)
 */

import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, ScanCommand, DeleteCommand, PutCommand } from '@aws-sdk/lib-dynamodb';
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
const tableName = process.env.VITE_DYNAMODB_TABLE_NAME;

async function cleanupOldProducts() {
    try {
        console.log('Scanning for products without adminId...');
        
        // Scan all products
        const scanCommand = new ScanCommand({
            TableName: tableName,
        });
        
        const response = await docClient.send(scanCommand);
        const allProducts = response.Items || [];
        
        console.log(`Total products found: ${allProducts.length}`);
        
        // Find products without adminId
        const productsWithoutAdmin = allProducts.filter(product => !product.adminId);
        
        console.log(`Products without adminId: ${productsWithoutAdmin.length}`);
        
        if (productsWithoutAdmin.length === 0) {
            console.log('No products to clean up!');
            return;
        }
        
        // Display products
        console.log('\nProducts without adminId:');
        productsWithoutAdmin.forEach((product, index) => {
            console.log(`${index + 1}. ${product.name} (ID: ${product.id})`);
        });
        
        // Delete products without adminId
        console.log('\nDeleting products without adminId...');
        
        for (const product of productsWithoutAdmin) {
            const deleteCommand = new DeleteCommand({
                TableName: tableName,
                Key: { id: product.id },
            });
            
            await docClient.send(deleteCommand);
            console.log(`Deleted: ${product.name} (ID: ${product.id})`);
        }
        
        console.log('\nCleanup complete!');
        console.log(`Deleted ${productsWithoutAdmin.length} products`);
        
    } catch (error) {
        console.error('Error during cleanup:', error);
    }
}

// Run the cleanup
cleanupOldProducts();
