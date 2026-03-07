// DynamoDB Table Cleaner — clears js_Products, js_Orders, js_Customers
// The Admins table is intentionally left untouched.
// Usage: node scripts/clear-dynamodb.mjs

import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, ScanCommand, DeleteCommand } from "@aws-sdk/lib-dynamodb";

// --- Load credentials from project .env file ---
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const envFile = readFileSync(resolve(__dirname, "../.env"), "utf-8");
const env = Object.fromEntries(
    envFile.split(/\r?\n/).filter(l => l && !l.startsWith("#")).map(l => l.split("=").map(s => s.trim()))
);

const region = env.VITE_AWS_REGION;
const accessKeyId = env.VITE_AWS_ACCESS_KEY_ID;
const secretAccessKey = env.VITE_AWS_SECRET_ACCESS_KEY;

// --- Tables and their primary keys ---
const TABLES = [
    { name: "js_Products",  keyName: "id" },
    { name: "js_Orders",    keyName: "orderId" },
    { name: "js_Customers", keyName: "email" },
];

const client = new DynamoDBClient({
    region,
    credentials: { accessKeyId, secretAccessKey },
});
const docClient = DynamoDBDocumentClient.from(client);

async function clearTable(tableName, primaryKey) {
    console.log(`\n🗑️  Scanning "${tableName}"...`);
    const scanResult = await docClient.send(new ScanCommand({ TableName: tableName }));
    const items = scanResult.Items || [];
    console.log(`   Found ${items.length} item(s). Deleting...`);

    for (const item of items) {
        await docClient.send(new DeleteCommand({
            TableName: tableName,
            Key: { [primaryKey]: item[primaryKey] },
        }));
    }
    console.log(`   ✅ "${tableName}" cleared.`);
}

async function main() {
    console.log("=======================================================");
    console.log(" DynamoDB Cleaner — IRREVERSIBLE OPERATION");
    console.log(" Tables: js_Products, js_Orders, js_Customers");
    console.log(" Skipping: Admins");
    console.log("=======================================================\n");

    for (const { name, keyName } of TABLES) {
        await clearTable(name, keyName);
    }

    console.log("\n🎉 All tables cleared successfully!");
}

main().catch(err => {
    console.error("❌ Error:", err.message || err);
    process.exit(1);
});
