# E-Waste Management Platform - Complete API Documentation

## Base URL
```
http://localhost:5000
```

## Authentication Headers
For protected routes, include one of these:
```bash
# Option 1: Bearer Token
-H "Authorization: Bearer YOUR_JWT_TOKEN"

# Option 2: Cookie (if using cookie auth)
-H "Cookie: token=YOUR_JWT_TOKEN"
```

---

## 🔐 AUTHENTICATION ROUTES

### Register User
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@example.com",
    "phone": "9876543210",
    "password": "password123",
    "address": {
      "street": "123 Main Street",
      "city": "Rajahmundry",
      "state": "Andhra Pradesh",
      "pincode": "533101",
      "landmark": "Near Temple"
    },
    "role": "customer"
  }'
```

### Login User
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "password123"
  }'
```

### Get Current User Profile
```bash
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Update User Details
```bash
curl -X PUT http://localhost:5000/api/auth/updatedetails \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John Updated",
    "lastName": "Doe Updated",
    "phone": "9876543211"
  }'
```

### Update User Address
```bash
curl -X PUT http://localhost:5000/api/auth/updateaddress \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "street": "456 New Street",
    "city": "Kakinada",
    "state": "Andhra Pradesh",
    "pincode": "533001",
    "landmark": "Near Port"
  }'
```

### Update Password
```bash
curl -X PUT http://localhost:5000/api/auth/updatepassword \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "currentPassword": "password123",
    "newPassword": "newpassword123"
  }'
```

### Logout
```bash
curl -X GET http://localhost:5000/api/auth/logout \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## 📦 CATEGORIES ROUTES

### Get All Categories (Public)
```bash
curl -X GET http://localhost:5000/api/categories
```

### Get Single Category (Public)
```bash
curl -X GET http://localhost:5000/api/categories/CATEGORY_ID
```

### Create Category (Admin Only)
```bash
curl -X POST http://localhost:5000/api/categories \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Smart TVs",
    "description": "Smart televisions with internet connectivity",
    "icon": "tv",
    "basePrice": 1500,
    "unit": "piece",
    "conditionMultipliers": {
      "excellent": 1.0,
      "good": 0.8,
      "fair": 0.6,
      "poor": 0.3,
      "broken": 0.15
    },
    "subcategories": [
      {"name": "4K Smart TVs", "priceModifier": 1.5},
      {"name": "HD Smart TVs", "priceModifier": 1.0}
    ],
    "sortOrder": 1
  }'
```

### Update Category (Admin Only)
```bash
curl -X PUT http://localhost:5000/api/categories/CATEGORY_ID \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Updated Smart TVs",
    "basePrice": 1800
  }'
```

### Delete Category (Admin Only)
```bash
curl -X DELETE http://localhost:5000/api/categories/CATEGORY_ID \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN"
```

---

## 🎯 ORDERS ROUTES

### Create New Order
```bash
curl -X POST http://localhost:5000/api/orders \
  -H "Authorization: Bearer USER_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "items": [
      {
        "categoryId": "CATEGORY_ID",
        "subcategory": "Premium Smartphones",
        "brand": "Samsung",
        "model": "Galaxy S21",
        "condition": "good",
        "quantity": 1,
        "description": "Working phone with minor scratches"
      }
    ],
    "pickupDetails": {
      "address": {
        "street": "123 Main Street",
        "city": "Rajahmundry",
        "state": "Andhra Pradesh",
        "pincode": "533101",
        "landmark": "Near Temple"
      },
      "preferredDate": "2024-01-15",
      "timeSlot": "morning",
      "contactNumber": "9876543210",
      "specialInstructions": "Please call before arriving"
    },
    "pricing": {
      "pickupCharges": 0
    }
  }'
```

### Get User Orders
```bash
curl -X GET http://localhost:5000/api/orders \
  -H "Authorization: Bearer USER_JWT_TOKEN"
```

### Get Single Order
```bash
curl -X GET http://localhost:5000/api/orders/ORDER_ID \
  -H "Authorization: Bearer USER_JWT_TOKEN"
```

### Get All Orders (Admin/Manager)
```bash
curl -X GET "http://localhost:5000/api/orders/all?status=pending&page=1&limit=10" \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN"
```

### Get Order Statistics (Admin/Manager)
```bash
curl -X GET http://localhost:5000/api/orders/statistics \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN"
```

### Get Assigned Orders (Pickup Boy)
```bash
curl -X GET http://localhost:5000/api/orders/assigned \
  -H "Authorization: Bearer PICKUP_BOY_JWT_TOKEN"
```

### Cancel Order
```bash
curl -X PUT http://localhost:5000/api/orders/ORDER_ID/cancel \
  -H "Authorization: Bearer USER_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "reason": "Change of plans"
  }'
```

### Update Order Status (Admin/Manager/Pickup Boy)
```bash
curl -X PUT http://localhost:5000/api/orders/ORDER_ID/status \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "completed",
    "note": "Order completed successfully",
    "actualTotal": 850
  }'
```

### Assign Pickup Boy (Admin/Manager)
```bash
curl -X PUT http://localhost:5000/api/orders/ORDER_ID/assign \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "pickupBoyId": "PICKUP_BOY_USER_ID"
  }'
```

### Verify Pickup PIN (Pickup Boy)
```bash
curl -X PUT http://localhost:5000/api/orders/ORDER_ID/verify \
  -H "Authorization: Bearer PICKUP_BOY_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "pin": "123456"
  }'
```

### Generate Order Receipt
```bash
curl -X GET http://localhost:5000/api/orders/ORDER_ID/receipt \
  -H "Authorization: Bearer USER_JWT_TOKEN" \
  --output receipt.pdf
```

---

## 📍 PINCODE ROUTES

### Check Pincode Serviceability (Public)
```bash
curl -X GET http://localhost:5000/api/pincodes/check/533101
```

### Get All Pincodes (Admin/Manager)
```bash
curl -X GET "http://localhost:5000/api/pincodes?city=Rajahmundry&serviceable=true&page=1&limit=10" \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN"
```

### Create Pincode (Admin)
```bash
curl -X POST http://localhost:5000/api/pincodes \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "pincode": "533106",
    "city": "Rajahmundry",
    "state": "Andhra Pradesh",
    "area": "New Area",
    "isServiceable": true,
    "pickupCharges": 50,
    "minimumOrderValue": 200,
    "estimatedPickupTime": "48-72 hours"
  }'
```

### Update Pincode (Admin)
```bash
curl -X PUT http://localhost:5000/api/pincodes/PINCODE_ID \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "pickupCharges": 30,
    "isServiceable": true
  }'
```

### Delete Pincode (Admin)
```bash
curl -X DELETE http://localhost:5000/api/pincodes/PINCODE_ID \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN"
```

### Assign Pickup Boy to Pincode (Admin/Manager)
```bash
curl -X PUT http://localhost:5000/api/pincodes/PINCODE_ID/assign \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "pickupBoyId": "PICKUP_BOY_USER_ID"
  }'
```

### Remove Pickup Boy from Pincode (Admin/Manager)
```bash
curl -X DELETE http://localhost:5000/api/pincodes/PINCODE_ID/assign/PICKUP_BOY_USER_ID \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN"
```

---

## 🎫 SUPPORT ROUTES

### Create Support Ticket
```bash
curl -X POST http://localhost:5000/api/support \
  -H "Authorization: Bearer USER_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "subject": "Issue with my order",
    "description": "My pickup was scheduled but no one came",
    "category": "pickup_issue",
    "priority": "high",
    "orderId": "ORDER_ID"
  }'
```

### Get User Support Tickets
```bash
curl -X GET "http://localhost:5000/api/support?status=open&page=1&limit=10" \
  -H "Authorization: Bearer USER_JWT_TOKEN"
```

### Get All Support Tickets (Admin/Manager)
```bash
curl -X GET "http://localhost:5000/api/support/all?status=open&priority=high&page=1&limit=10" \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN"
```

### Get Support Statistics (Admin/Manager)
```bash
curl -X GET http://localhost:5000/api/support/stats \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN"
```

### Get Single Support Ticket
```bash
curl -X GET http://localhost:5000/api/support/TICKET_ID \
  -H "Authorization: Bearer USER_JWT_TOKEN"
```

### Add Message to Ticket
```bash
curl -X POST http://localhost:5000/api/support/TICKET_ID/messages \
  -H "Authorization: Bearer USER_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "I am still waiting for response",
    "isInternal": false
  }'
```

### Update Ticket Status (Admin/Manager)
```bash
curl -X PUT http://localhost:5000/api/support/TICKET_ID/status \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "resolved",
    "resolutionNote": "Issue has been resolved successfully"
  }'
```

### Assign Support Ticket (Admin/Manager)
```bash
curl -X PUT http://localhost:5000/api/support/TICKET_ID/assign \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "assignedTo": "MANAGER_USER_ID"
  }'
```

### Rate Support Ticket
```bash
curl -X PUT http://localhost:5000/api/support/TICKET_ID/rate \
  -H "Authorization: Bearer USER_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "rating": 5,
    "feedback": "Excellent support, very helpful"
  }'
```

---

## 👥 USER MANAGEMENT ROUTES (Admin/Manager)

### Get All Users
```bash
curl -X GET "http://localhost:5000/api/users?role=customer&status=active&page=1&limit=10&search=john" \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN"
```

### Get User Statistics
```bash
curl -X GET http://localhost:5000/api/users/stats \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN"
```

### Get Pickup Boys
```bash
curl -X GET http://localhost:5000/api/users/pickup-boys \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN"
```

### Get Single User
```bash
curl -X GET http://localhost:5000/api/users/USER_ID \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN"
```

### Create User (Admin)
```bash
curl -X POST http://localhost:5000/api/users \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "New",
    "lastName": "User",
    "email": "newuser@example.com",
    "phone": "9876543215",
    "password": "password123",
    "role": "pickup_boy",
    "address": {
      "street": "789 New Street",
      "city": "Kakinada",
      "state": "Andhra Pradesh",
      "pincode": "533001"
    }
  }'
```

### Update User
```bash
curl -X PUT http://localhost:5000/api/users/USER_ID \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Updated",
    "lastName": "Name",
    "isActive": true
  }'
```

### Update User Status
```bash
curl -X PUT http://localhost:5000/api/users/USER_ID/status \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "isActive": false
  }'
```

### Reset User Password (Admin)
```bash
curl -X PUT http://localhost:5000/api/users/USER_ID/reset-password \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "newPassword": "newpassword123"
  }'
```

### Send Notification to User
```bash
curl -X POST http://localhost:5000/api/users/USER_ID/notify \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "subject": "Important Update",
    "message": "<h2>Hello!</h2><p>This is an important notification about your account.</p>"
  }'
```

### Delete User (Admin)
```bash
curl -X DELETE http://localhost:5000/api/users/USER_ID \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN"
```

---

## 📄 PAGES ROUTES

### Get All Published Pages (Public)
```bash
curl -X GET http://localhost:5000/api/pages
```

### Get Page by Slug (Public)
```bash
curl -X GET http://localhost:5000/api/pages/about-us
```

### Create Page (Admin)
```bash
curl -X POST http://localhost:5000/api/pages \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "About Us",
    "slug": "about-us",
    "content": {
      "blocks": [
        {"type": "heading", "content": "About Our Company"},
        {"type": "paragraph", "content": "We are committed to sustainable e-waste management."}
      ]
    },
    "status": "published"
  }'
```

### Update Page (Admin)
```bash
curl -X PUT http://localhost:5000/api/pages/PAGE_ID \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Updated About Us",
    "status": "published"
  }'
```

### Delete Page (Admin)
```bash
curl -X DELETE http://localhost:5000/api/pages/PAGE_ID \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN"
```

---

## 🏠 SYSTEM ROUTES

### Home/API Info
```bash
curl -X GET http://localhost:5000/
```

### Health Check
```bash
curl -X GET http://localhost:5000/health
```

---

## 📝 USAGE NOTES

### 1. Getting JWT Tokens
First login to get your JWT token:
```bash
# Login and extract token from response
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@example.com", "password": "password123"}' \
  | jq -r '.token'
```

### 2. Test Account Credentials
```bash
# Admin Account
email: admin@example.com
password: password123

# Customer Account  
email: customer@example.com
password: password123

# Pickup Boy Account
email: pickup@example.com
password: password123

# Manager Account
email: manager@example.com  
password: password123
```

### 3. Common Query Parameters
- `page`: Page number for pagination (default: 1)
- `limit`: Number of items per page (default: 10)
- `search`: Search term for filtering
- `status`: Filter by status
- `role`: Filter by user role

### 4. File Downloads
For PDF receipts, the response will be a binary file. Use `--output filename.pdf` to save.

### 5. Error Responses
All endpoints return standardized error responses:
```json
{
  "success": false,
  "error": "Error message here"
}
```

### 6. Success Responses
All endpoints return standardized success responses:
```json
{
  "success": true,
  "data": { ... },
  "count": 10,
  "pagination": { ... }
}
```