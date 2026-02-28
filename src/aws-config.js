import { DynamoDBClient, GetItemCommand } from "@aws-sdk/client-dynamodb";
import {
    DynamoDBDocumentClient,
    ScanCommand,
    PutCommand,
    DeleteCommand,
    GetCommand,
    UpdateCommand
} from "@aws-sdk/lib-dynamodb";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";

const region = import.meta.env.VITE_AWS_REGION;
const accessKeyId = import.meta.env.VITE_AWS_ACCESS_KEY_ID;
const secretAccessKey = import.meta.env.VITE_AWS_SECRET_ACCESS_KEY;
const tableName = import.meta.env.VITE_DYNAMODB_TABLE_NAME;
const bucketName = import.meta.env.VITE_S3_BUCKET_NAME;

console.log("AWS Config:", { region, tableName, bucketName, hasAccessKey: !!accessKeyId });

const client = new DynamoDBClient({
    region,
    credentials: {
        accessKeyId,
        secretAccessKey,
    },
});

const s3Client = new S3Client({
    region,
    credentials: {
        accessKeyId,
        secretAccessKey,
    },
});

const docClient = DynamoDBDocumentClient.from(client);

const sesClient = new SESClient({
    region,
    credentials: { accessKeyId, secretAccessKey },
});

export const uploadToS3 = async (file, path) => {
    try {
        if (!bucketName) {
            console.error("S3 Bucket Name is not configured");
            return null;
        }
        const fileName = `${Date.now()}_${file.name}`;
        const key = path ? `${path}/${fileName}` : fileName;

        // Convert File to ArrayBuffer for browser compatibility
        const arrayBuffer = await file.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);

        const command = new PutObjectCommand({
            Bucket: bucketName,
            Key: key,
            Body: uint8Array,
            ContentType: file.type
        });

        await s3Client.send(command);
        return `https://${bucketName}.s3.${region}.amazonaws.com/${key}`;
    } catch (error) {
        console.error("Error uploading to S3:", error);
        return null;
    }
};

export const getProducts = async () => {
    try {
        const command = new ScanCommand({
            TableName: tableName,
        });
        const response = await docClient.send(command);
        console.log("DynamoDB Scan Success:", response.Items?.length || 0, "items found");
        return response.Items || [];
    } catch (error) {
        console.error("Error fetching products from DynamoDB:", error.name || "Error", error.message || error);
        return [];
    }
};

export const saveProduct = async (product) => {
    try {
        const command = new PutCommand({
            TableName: tableName,
            Item: product,
        });
        await docClient.send(command);
        return true;
    } catch (error) {
        console.error("Error saving product to DynamoDB:", error);
        return false;
    }
};

export const removeProduct = async (id) => {
    try {
        const command = new DeleteCommand({
            TableName: tableName,
            Key: { id },
        });
        await docClient.send(command);
        return true;
    } catch (error) {
        console.error("Error deleting product from DynamoDB:", error);
        return false;
    }
};

const adminTableName = import.meta.env.VITE_DYNAMODB_ADMINS_TABLE || "Admins";

export const getAdmin = async (username) => {
    try {
        const command = new ScanCommand({
            TableName: adminTableName,
            FilterExpression: "username = :u",
            ExpressionAttributeValues: {
                ":u": username,
            },
        });
        const response = await docClient.send(command);
        const item = response.Items?.[0];
        if (item) {
            // Normalize attributes to lowercase for the app
            return {
                username: item.username,
                password: item.password || item.Password,
                email: item.email || item.Email,
                raw: item // Keep raw for internal checks like OTP
            };
        }
        return null;
    } catch (error) {
        console.error("Error fetching admin from DynamoDB:", error);
        return null;
    }
};

export const updateAdminPassword = async (username, newPassword) => {
    try {
        await docClient.send(new UpdateCommand({
            TableName: adminTableName,
            Key: { username },
            UpdateExpression: 'SET password = :p, updatedAt = :u',
            ExpressionAttributeValues: {
                ':p': newPassword,
                ':u': new Date().toISOString()
            }
        }));
        return true;
    } catch (error) {
        console.error('Error updating admin password:', error);
        return false;
    }
};

export const saveOTP = async (username, otp) => {
    try {
        const ttl = Math.floor(Date.now() / 1000) + (15 * 60); // 15 minutes from now
        await docClient.send(new UpdateCommand({
            TableName: adminTableName,
            Key: { username },
            UpdateExpression: 'SET resetOTP = :o, resetOTPExpires = :e',
            ExpressionAttributeValues: {
                ':o': otp,
                ':e': ttl
            }
        }));
        return true;
    } catch (error) {
        console.error('Error saving OTP:', error);
        return false;
    }
};

export const verifyOTP = async (email, otp) => {
    try {
        const admin = await getAdminByEmail(email);
        if (!admin || !admin.raw) return { success: false, message: 'Admin not found' };

        const item = admin.raw;
        if (!item.resetOTP) return { success: false, message: 'No reset request found' };

        const now = Math.floor(Date.now() / 1000);
        if (item.resetOTPExpires < now) return { success: false, message: 'OTP expired' };
        if (item.resetOTP !== otp) return { success: false, message: 'Invalid OTP' };

        // Clear OTP after successful verification
        await docClient.send(new UpdateCommand({
            TableName: adminTableName,
            Key: { username: item.username },
            UpdateExpression: 'REMOVE resetOTP, resetOTPExpires'
        }));

        return { success: true };
    } catch (error) {
        console.error('Error verifying OTP:', error);
        return { success: false, message: 'Verification error' };
    }
};

export const sendPasswordResetEmail = async (toEmail, otp) => {
    if (!SENDER_EMAIL || SENDER_EMAIL === 'your-verified-email@example.com') {
        console.warn('SES SENDER_EMAIL not configured or using placeholder. Please update VITE_SES_SENDER_EMAIL in .env');
        return false;
    }
    const subject = '🔐 Password Reset OTP - MyBusiness Admin';
    const htmlBody = `
        <div style="font-family:Arial,sans-serif;max-width:500px;margin:auto;border:1px solid #eee;border-radius:12px;padding:30px;text-align:center">
            <h2 style="color:#c27835">Password Reset Request</h2>
            <p style="color:#666">You recently requested to reset your admin password. Use the OTP below to proceed. This OTP is valid for 15 minutes.</p>
            <div style="background:#fdf6ef;border:2px dashed #c27835;border-radius:8px;padding:20px;margin:25px 0;font-size:32px;font-weight:bold;letter-spacing:5px;color:#2d1e12">
                ${otp}
            </div>
            <p style="color:#999;font-size:12px">If you didn't request this, please ignore this email or contact support.</p>
        </div>
    `;

    try {
        await sesClient.send(new SendEmailCommand({
            Source: SENDER_EMAIL,
            Destination: { ToAddresses: [toEmail] },
            Message: {
                Subject: { Data: subject },
                Body: { Html: { Data: htmlBody } },
            },
        }));
        return true;
    } catch (error) {
        console.error('Error sending reset email:', error);
        return false;
    }
};

export const getAdminByEmail = async (email) => {
    try {
        const command = new ScanCommand({
            TableName: adminTableName,
            FilterExpression: "email = :e OR Email = :e",
            ExpressionAttributeValues: {
                ":e": email,
            },
        });
        const response = await docClient.send(command);
        const item = response.Items?.[0];
        if (item) {
            return {
                username: item.username,
                password: item.password || item.Password,
                email: item.email || item.Email,
                raw: item
            };
        }
        return null;
    } catch (error) {
        console.error("Error searching admin by email:", error);
        return null;
    }
};

const customerTableName = import.meta.env.VITE_DYNAMODB_CUSTOMERS_TABLE || "js_Customers";

export const saveCustomer = async (customer) => {
    try {
        // Ensure email is present as it is our Primary Key
        if (!customer.email) {
            console.error("Cannot save customer without email");
            return false;
        }
        const command = new PutCommand({
            TableName: customerTableName,
            Item: {
                ...customer,
                // We use email as the HASH key in DynamoDB
                createdAt: new Date().toISOString()
            }
        });
        await docClient.send(command);
        return true;
    } catch (error) {
        console.error("Error saving customer to DynamoDB:", error);
        return false;
    }
};

export const getCustomer = async (email) => {
    try {
        const command = new GetCommand({
            TableName: customerTableName,
            Key: {
                email: email
            }
        });
        const response = await docClient.send(command);
        return response.Item || null;
    } catch (error) {
        console.error("Error fetching customer from DynamoDB:", error);
        return null;
    }
};

const ordersTableName = 'js_Orders';

export const saveOrder = async (order) => {
    try {
        const orderId = `ORD-${Date.now()}`;
        const item = {
            orderId,
            ...order,
            status: 'pending',
            createdAt: new Date().toISOString(),
        };
        await docClient.send(new PutCommand({ TableName: ordersTableName, Item: item }));
        return orderId;
    } catch (error) {
        console.error('Error saving order:', error);
        return null;
    }
};

export const getOrders = async () => {
    try {
        const response = await docClient.send(new ScanCommand({ TableName: ordersTableName }));
        return (response.Items || []).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } catch (error) {
        console.error('Error fetching orders:', error);
        return [];
    }
};

export const getOrdersByEmail = async (email) => {
    try {
        const { FilterExpression, ExpressionAttributeValues, ...rest } = {
            TableName: ordersTableName,
            FilterExpression: 'customerEmail = :email',
            ExpressionAttributeValues: { ':email': email },
        };
        const response = await docClient.send(new ScanCommand({ TableName: ordersTableName, FilterExpression, ExpressionAttributeValues }));
        return (response.Items || []).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } catch (error) {
        console.error('Error fetching customer orders:', error);
        return [];
    }
};

export const updateOrderStatus = async (orderId, status, additionalFields = {}) => {
    try {
        const updateExpression = ['SET #s = :status', 'updatedAt = :updatedAt'];
        const expressionAttributeNames = { '#s': 'status' };
        const expressionAttributeValues = { 
            ':status': status, 
            ':updatedAt': new Date().toISOString() 
        };

        // Add any additional fields to update
        Object.keys(additionalFields).forEach((key, index) => {
            const placeholder = `:field${index}`;
            updateExpression.push(`${key} = ${placeholder}`);
            expressionAttributeValues[placeholder] = additionalFields[key];
        });

        await docClient.send(new UpdateCommand({
            TableName: ordersTableName,
            Key: { orderId },
            UpdateExpression: updateExpression.join(', '),
            ExpressionAttributeNames,
            ExpressionAttributeValues: expressionAttributeValues,
        }));
        return true;
    } catch (error) {
        console.error('Error updating order status:', error);
        return false;
    }
};

const SENDER_EMAIL = import.meta.env.VITE_SES_SENDER_EMAIL || '';

// Propose a new delivery date for an order
export const proposeNewDeliveryDate = async (orderId, newDate, reason) => {
    try {
        await docClient.send(new UpdateCommand({
            TableName: ordersTableName,
            Key: { orderId },
            UpdateExpression: 'SET #s = :status, proposedDeliveryDate = :newDate, rescheduleReason = :reason, updatedAt = :updatedAt',
            ExpressionAttributeNames: { '#s': 'status' },
            ExpressionAttributeValues: { 
                ':status': 'pending-reschedule',
                ':newDate': newDate,
                ':reason': reason,
                ':updatedAt': new Date().toISOString() 
            },
        }));
        return true;
    } catch (error) {
        console.error('Error proposing new delivery date:', error);
        return false;
    }
};

// Customer accepts the proposed date
export const acceptProposedDate = async (orderId) => {
    try {
        // Get the order to retrieve the proposed date
        const command = new GetCommand({
            TableName: ordersTableName,
            Key: { orderId }
        });
        const response = await docClient.send(command);
        const order = response.Item;

        if (!order || !order.proposedDeliveryDate) {
            return false;
        }

        // Update order with new delivery date and confirm it
        await docClient.send(new UpdateCommand({
            TableName: ordersTableName,
            Key: { orderId },
            UpdateExpression: 'SET #s = :status, deliveryDate = :newDate, updatedAt = :updatedAt REMOVE proposedDeliveryDate, rescheduleReason',
            ExpressionAttributeNames: { '#s': 'status' },
            ExpressionAttributeValues: { 
                ':status': 'accepted',
                ':newDate': order.proposedDeliveryDate,
                ':updatedAt': new Date().toISOString() 
            },
        }));
        return true;
    } catch (error) {
        console.error('Error accepting proposed date:', error);
        return false;
    }
};

// Customer rejects the proposed date
export const rejectProposedDate = async (orderId) => {
    try {
        await docClient.send(new UpdateCommand({
            TableName: ordersTableName,
            Key: { orderId },
            UpdateExpression: 'SET #s = :status, updatedAt = :updatedAt REMOVE proposedDeliveryDate, rescheduleReason',
            ExpressionAttributeNames: { '#s': 'status' },
            ExpressionAttributeValues: { 
                ':status': 'Cancelled by Customer',
                ':updatedAt': new Date().toISOString() 
            },
        }));
        return true;
    } catch (error) {
        console.error('Error rejecting proposed date:', error);
        return false;
    }
};

// Send reschedule proposal email to customer
export const sendRescheduleProposalEmail = async (toEmail, order, newDate, reason) => {
    if (!SENDER_EMAIL) {
        console.warn('SES sender email not configured');
        return false;
    }

    const subject = `📅 Delivery Date Change Proposal - ${order.orderId}`;
    const formattedNewDate = new Date(newDate).toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
    const formattedOriginalDate = new Date(order.deliveryDate).toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });

    const htmlBody = `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden">
            <div style="background:#f59e0b;padding:24px;text-align:center">
                <h1 style="color:white;margin:0;font-size:1.6rem">📅 Delivery Date Change Proposal</h1>
            </div>
            <div style="padding:24px">
                <p style="color:#374151">Hello <strong>${order.customerEmail}</strong>,</p>
                <p style="color:#374151">We need to reschedule your order delivery due to: <strong>${reason}</strong></p>
                
                <div style="background:#fef3c7;border-left:4px solid #f59e0b;border-radius:8px;padding:16px;margin:20px 0">
                    <p style="margin:4px 0;color:#92400e"><strong>Order ID:</strong> ${order.orderId}</p>
                    <p style="margin:4px 0;color:#92400e"><strong>Items:</strong> ${order.items?.map(i => `${i.name} ×${i.qty}`).join(', ')}</p>
                    <p style="margin:4px 0;color:#92400e"><strong>Total:</strong> ₹${order.total}</p>
                </div>

                <div style="display:flex;gap:20px;margin:20px 0">
                    <div style="flex:1;background:#fee2e2;border-radius:8px;padding:16px;text-align:center">
                        <p style="margin:0;color:#991b1b;font-size:0.85rem;font-weight:600">Original Date</p>
                        <p style="margin:8px 0 0;color:#dc2626;font-size:1.1rem;font-weight:700;text-decoration:line-through">${formattedOriginalDate}</p>
                    </div>
                    <div style="flex:1;background:#dcfce7;border-radius:8px;padding:16px;text-align:center">
                        <p style="margin:0;color:#166534;font-size:0.85rem;font-weight:600">Proposed New Date</p>
                        <p style="margin:8px 0 0;color:#16a34a;font-size:1.1rem;font-weight:700">${formattedNewDate}</p>
                    </div>
                </div>

                <p style="color:#374151;margin:20px 0">Please log in to your account to accept or reject this new delivery date:</p>

                <div style="text-align:center;margin:24px 0">
                    <p style="color:#6b7280;font-size:0.9rem;margin-bottom:12px">Click below to respond:</p>
                    <a href="${window.location.origin}" style="display:inline-block;background:#16a34a;color:white;padding:12px 32px;border-radius:8px;text-decoration:none;font-weight:600;margin:0 8px">✓ View Order</a>
                </div>

                <div style="background:#f9fafb;border-radius:8px;padding:16px;margin:20px 0">
                    <p style="margin:0;color:#6b7280;font-size:0.85rem"><strong>Note:</strong> If you accept, your order will be confirmed for the new date. If you reject, your order will be cancelled and you can place a new order at your convenience.</p>
                </div>

                <p style="color:#6b7280;font-size:0.85rem;margin-top:20px">We apologize for any inconvenience and appreciate your understanding.</p>
            </div>
        </div>
    `;

    try {
        await sesClient.send(new SendEmailCommand({
            Source: SENDER_EMAIL,
            Destination: { ToAddresses: [toEmail] },
            Message: {
                Subject: { Data: subject },
                Body: { Html: { Data: htmlBody } },
            },
        }));
        console.log('Reschedule proposal email sent to', toEmail);
        return true;
    } catch (error) {
        console.error('Error sending reschedule email:', error);
        return false;
    }
};

// Send confirmation email after customer accepts new date
export const sendRescheduleAcceptedEmail = async (toEmail, order) => {
    if (!SENDER_EMAIL) {
        console.warn('SES sender email not configured');
        return false;
    }

    const subject = `✅ Order Confirmed with New Date - ${order.orderId}`;
    const formattedDate = new Date(order.deliveryDate).toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });

    const htmlBody = `
        <div style="font-family:Arial,sans-serif;max-width:520px;margin:auto;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden">
            <div style="background:#16a34a;padding:24px;text-align:center">
                <h1 style="color:white;margin:0;font-size:1.6rem">✅ Order Confirmed!</h1>
            </div>
            <div style="padding:24px">
                <p style="color:#374151">Hello <strong>${order.customerEmail}</strong>,</p>
                <p style="color:#374151">Thank you for accepting the new delivery date! Your order is now <strong>confirmed</strong>.</p>
                
                <div style="background:#dcfce7;border-left:4px solid #16a34a;border-radius:8px;padding:16px;margin:16px 0">
                    <p style="margin:4px 0;color:#166534"><strong>Order ID:</strong> ${order.orderId}</p>
                    <p style="margin:4px 0;color:#166534"><strong>Items:</strong> ${order.items?.map(i => `${i.name} ×${i.qty}`).join(', ')}</p>
                    <p style="margin:4px 0;color:#166534"><strong>Total:</strong> ₹${order.total}</p>
                    <p style="margin:4px 0;color:#166534"><strong>New Delivery Date:</strong> ${formattedDate}</p>
                    <p style="margin:4px 0;color:#166534"><strong>Address:</strong> ${order.address}</p>
                </div>

                <p style="color:#6b7280;font-size:0.85rem">We'll deliver your order on the confirmed date. Thank you for your patience!</p>
            </div>
        </div>
    `;

    try {
        await sesClient.send(new SendEmailCommand({
            Source: SENDER_EMAIL,
            Destination: { ToAddresses: [toEmail] },
            Message: {
                Subject: { Data: subject },
                Body: { Html: { Data: htmlBody } },
            },
        }));
        return true;
    } catch (error) {
        console.error('Error sending confirmation email:', error);
        return false;
    }
};

export const sendOrderNotification = async (toEmail, status, order) => {
    if (!SENDER_EMAIL) {
        console.warn('SES sender email not configured (VITE_SES_SENDER_EMAIL)');
        return false;
    }
    const isAccepted = status === 'accepted';
    const subject = isAccepted
        ? `✅ Order Confirmed - ${order.orderId}`
        : `❌ Order Cancelled - ${order.orderId}`;

    const htmlBody = `
        <div style="font-family:Arial,sans-serif;max-width:520px;margin:auto;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden">
            <div style="background:${isAccepted ? '#16a34a' : '#dc2626'};padding:24px;text-align:center">
                <h1 style="color:white;margin:0;font-size:1.6rem">${isAccepted ? '✅ Order Confirmed!' : '❌ Order Cancelled'}</h1>
            </div>
            <div style="padding:24px">
                <p style="color:#374151">Hello <strong>${order.customerName || toEmail}</strong>,</p>
                <p style="color:#374151">${isAccepted
            ? 'Great news! Your order has been <strong>confirmed</strong> and will be delivered to you.'
            : 'We\'re sorry, your order has been <strong>cancelled</strong>. Please contact us for more details.'}
                </p>
                <div style="background:#f9fafb;border-radius:8px;padding:16px;margin:16px 0">
                    <p style="margin:4px 0"><strong>Order ID:</strong> ${order.orderId}</p>
                    <p style="margin:4px 0"><strong>Items:</strong> ${order.items?.map(i => `${i.name} ×${i.qty}`).join(', ')}</p>
                    <p style="margin:4px 0"><strong>Total:</strong> ₹${order.total}</p>
                    <p style="margin:4px 0"><strong>Delivery Date:</strong> ${order.deliveryDate}</p>
                    <p style="margin:4px 0"><strong>Address:</strong> ${order.address}</p>
                    <p style="margin:4px 0"><strong>Payment:</strong> ${order.paymentMethod?.toUpperCase()}</p>
                </div>
                <p style="color:#6b7280;font-size:0.85rem">Thank you for shopping with us!</p>
            </div>
        </div>
    `;

    try {
        await sesClient.send(new SendEmailCommand({
            Source: SENDER_EMAIL,
            Destination: { ToAddresses: [toEmail] },
            Message: {
                Subject: { Data: subject },
                Body: { Html: { Data: htmlBody } },
            },
        }));
        console.log('Order notification email sent to', toEmail);
        return true;
    } catch (error) {
        console.error('Error sending SES email:', error.name, error.message);
        return false;
    }
};
