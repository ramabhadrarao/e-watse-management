# 🎯 Order Assignment API Routes - Complete Documentation

## Base URL
```
http://localhost:5000
```

---

## 🔍 GET ASSIGNMENT DATA

### 1. Get Orders Pending Assignment
**View all unassigned orders that need pickup boy assignment**

```bash
curl -X GET http://localhost:5000/api/orders/pending-assignment \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN"
```

**With filters:**
```bash
curl -X GET "http://localhost:5000/api/orders/pending-assignment?city=Rajahmundry&timeSlot=morning&date=2024-01-15" \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN"
```

**Response:**
```json
{
  "success": true,
  "count": 5,
  "data": [
    {
      "_id": "order_id_1",
      "orderNumber": "EW000001",
      "status": "pending",
      "customerId": {
        "firstName": "John",
        "lastName": "Doe",
        "email": "john@example.com",
        "phone": "9876543210"
      },
      "pickupDetails": {
        "address": {
          "street": "123 Main St",
          "city": "Rajahmundry",
          "pincode": "533101"
        },
        "preferredDate": "2024-01-15",
        "timeSlot": "morning"
      },
      "pricing": {
        "estimatedTotal": 850
      }
    }
  ]
}
```

### 2. Get Pickup Boys with Availability
**View all pickup boys with their current workload and availability**

```bash
curl -X GET http://localhost:5000/api/users/pickup-boys/availability \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN"
```

**Filter by location:**
```bash
curl -X GET "http://localhost:5000/api/users/pickup-boys/availability?city=Rajahmundry&pincode=533101" \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN"
```

**Response:**
```json
{
  "success": true,
  "count": 3,
  "data": [
    {
      "_id": "pickup_boy_id_1",
      "firstName": "Ravi",
      "lastName": "Kumar",
      "email": "ravi@example.com",
      "phone": "9876543210",
      "address": {
        "city": "Rajahmundry",
        "pincode": "533101"
      },
      "workload": {
        "activeOrders": 2,
        "todayOrders": 3,
        "weekCompletedOrders": 12,
        "maxCapacity": 8,
        "availabilityStatus": "available",
        "canTakeNewOrder": true
      },
      "performance": {
        "weeklyCompletions": 12,
        "efficiency": "high"
      }
    }
  ],
  "summary": {
    "available": 2,
    "busy": 1,
    "overloaded": 0,
    "canTakeOrders": 3
  }
}
```

### 3. Get Pickup Boy Performance
**View detailed performance metrics for a specific pickup boy**

```bash
curl -X GET http://localhost:5000/api/users/pickup-boys/PICKUP_BOY_ID/performance \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "pickupBoy": {
      "_id": "pickup_boy_id_1",
      "firstName": "Ravi",
      "lastName": "Kumar",
      "email": "ravi@example.com",
      "phone": "9876543210"
    },
    "performance": {
      "totalAssigned": 45,
      "totalCompleted": 42,
      "completionRate": "93.33%",
      "monthlyCompleted": 15,
      "weeklyCompleted": 5,
      "activeOrders": 3,
      "averageRating": 4.7,
      "status": "available"
    }
  }
}
```

---

## ✋ MANUAL ASSIGNMENT

### 4. Assign Single Order to Pickup Boy
**Manually assign a specific order to a specific pickup boy**

```bash
curl -X PUT http://localhost:5000/api/orders/ORDER_ID/assign \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "pickupBoyId": "pickup_boy_id_1"
  }'
```

**Success Response:**
```json
{
  "success": true,
  "data": {
    "_id": "order_id",
    "orderNumber": "EW000001",
    "status": "assigned",
    "customerId": {
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@example.com"
    },
    "assignedPickupBoy": {
      "_id": "pickup_boy_id_1",
      "firstName": "Ravi",
      "lastName": "Kumar",
      "phone": "9876543210",
      "email": "ravi@example.com"
    },
    "timeline": [
      {
        "status": "assigned",
        "timestamp": "2024-01-15T09:30:00.000Z",
        "updatedBy": "admin_user_id",
        "note": "Assigned to Ravi Kumar"
      }
    ]
  }
}
```

### 5. Bulk Assign Multiple Orders
**Assign multiple orders to different pickup boys in one request**

```bash
curl -X POST http://localhost:5000/api/orders/bulk-assign \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "assignments": [
      {
        "orderId": "order_id_1",
        "pickupBoyId": "pickup_boy_id_1"
      },
      {
        "orderId": "order_id_2", 
        "pickupBoyId": "pickup_boy_id_2"
      },
      {
        "orderId": "order_id_3",
        "pickupBoyId": "pickup_boy_id_1"
      }
    ]
  }'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "successful": 2,
    "failed": 1,
    "results": [
      {
        "orderId": "order_id_1",
        "status": "success",
        "assignedTo": "Ravi Kumar"
      },
      {
        "orderId": "order_id_2",
        "status": "success", 
        "assignedTo": "Suresh Babu"
      }
    ],
    "errors": [
      {
        "orderId": "order_id_3",
        "error": "Pickup boy is at maximum capacity"
      }
    ]
  }
}
```

---

## 🤖 AUTO ASSIGNMENT

### 6. Auto-Assign Orders (Smart Assignment)
**Automatically assign orders based on location and pickup boy workload**

```bash
curl -X POST http://localhost:5000/api/orders/auto-assign \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "city": "Rajahmundry",
    "maxAssignments": 10
  }'
```

**With specific pincode:**
```bash
curl -X POST http://localhost:5000/api/orders/auto-assign \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "pincode": "533101",
    "maxAssignments": 5
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "Auto-assigned 3 orders",
  "data": {
    "assigned": 3,
    "assignments": [
      {
        "orderId": "order_id_1",
        "orderNumber": "EW000001",
        "pickupBoyId": "pickup_boy_id_1",
        "pickupBoyName": "Ravi Kumar"
      },
      {
        "orderId": "order_id_2",
        "orderNumber": "EW000002", 
        "pickupBoyId": "pickup_boy_id_2",
        "pickupBoyName": "Suresh Babu"
      }
    ]
  }
}
```

---

## 📧 EMAIL NOTIFICATIONS

### 7. Send Assignment Notification to Pickup Boy
**Manually send assignment notification email**

```bash
curl -X POST http://localhost:5000/api/users/PICKUP_BOY_ID/notify-assignment \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "orderId": "ORDER_ID"
  }'
```

**Success Response:**
```json
{
  "success": true,
  "message": "Assignment notification sent to pickup boy"
}
```

---

## 🔄 ASSIGNMENT WORKFLOW EXAMPLES

### Complete Assignment Workflow

#### Step 1: Check Pending Orders
```bash
curl -X GET http://localhost:5000/api/orders/pending-assignment \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN"
```

#### Step 2: Check Available Pickup Boys
```bash
curl -X GET http://localhost:5000/api/users/pickup-boys/availability \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN"
```

#### Step 3: Manual Assignment (if needed)
```bash
curl -X PUT http://localhost:5000/api/orders/ORDER_ID/assign \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"pickupBoyId": "PICKUP_BOY_ID"}'
```

#### Step 4: Or Auto-Assignment (smart)
```bash
curl -X POST http://localhost:5000/api/orders/auto-assign \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"city": "Rajahmundry", "maxAssignments": 10}'
```

### Daily Assignment Routine

#### Morning Assignment Check
```bash
# Get today's pending orders
curl -X GET "http://localhost:5000/api/orders/pending-assignment?date=$(date +%Y-%m-%d)" \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN"

# Auto-assign morning slot orders
curl -X POST http://localhost:5000/api/orders/auto-assign \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "city": "Rajahmundry",
    "maxAssignments": 15
  }'
```

---

## 📊 ASSIGNMENT ANALYTICS

### Get Assignment Statistics
```bash
curl -X GET http://localhost:5000/api/orders/statistics \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN"
```

**Response includes:**
```json
{
  "success": true,
  "data": {
    "total": 150,
    "pending": 5,
    "confirmed": 3,
    "assigned": 12,
    "unassigned": 8,
    "completed": 120,
    "thisWeek": 25,
    "totalRevenue": 125000
  }
}
```

### Get Pickup Boy Summary
```bash
curl -X GET http://localhost:5000/api/users/stats \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN"
```

---

## 🚨 ERROR HANDLING

### Common Assignment Errors

#### 1. Pickup Boy at Capacity
```json
{
  "success": false,
  "error": "Pickup boy is at maximum capacity (8 active orders)"
}
```

#### 2. Order Already Assigned
```json
{
  "success": false,
  "error": "Order already assigned"
}
```

#### 3. Pickup Boy Not Found
```json
{
  "success": false,
  "error": "Pickup boy not found or inactive"
}
```

#### 4. No Available Pickup Boys
```json
{
  "success": false,
  "error": "No pickup boys available in the specified area"
}
```

---

## 💡 ASSIGNMENT BEST PRACTICES

### 1. Location-Based Assignment
- Always check pickup boy location vs order location
- Prioritize same city/pincode assignments
- Consider travel time and distance

### 2. Workload Balancing
- Check current active orders before assignment
- Distribute orders evenly among available pickup boys
- Monitor weekly completion rates

### 3. Time Slot Optimization
- Group orders by time slots
- Assign morning orders to early-available pickup boys
- Consider pickup boy's preferred working hours

### 4. Automated vs Manual
- Use auto-assignment for routine, location-based assignments
- Use manual assignment for special cases or VIP customers
- Bulk assignment for processing large backlogs

---

## 📱 MOBILE/WEB DASHBOARD INTEGRATION

### Admin Dashboard API Sequence
```bash
# 1. Dashboard Load - Get overview
curl -X GET http://localhost:5000/api/orders/statistics
curl -X GET http://localhost:5000/api/users/pickup-boys/availability

# 2. Assignment Page - Get details
curl -X GET http://localhost:5000/api/orders/pending-assignment
curl -X GET http://localhost:5000/api/users/pickup-boys

# 3. Smart Assignment - Auto-assign
curl -X POST http://localhost:5000/api/orders/auto-assign

# 4. Performance Page - Analytics
curl -X GET http://localhost:5000/api/users/pickup-boys/PICKUP_BOY_ID/performance
```

This completes the assignment system implementation with all necessary routes for manual assignment, auto-assignment, and monitoring!