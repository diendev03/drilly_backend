# Drilly API Documentation

> **Base URL**: `http://localhost:3000/api/v1`  
> **Authentication**: Most endpoints require `Authorization: Bearer <token>` header.

---

## 🔐 Authentication

### Create User (Register)
```bash
curl -X POST http://localhost:3000/api/v1/user/create \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "yourpassword",
    "name": "Your Name"
  }'
```

### Login
```bash
curl -X POST http://localhost:3000/api/v1/user/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "yourpassword"
  }'
```

### Refresh Token
```bash
curl -X POST http://localhost:3000/api/v1/user/refresh-token \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "<your_refresh_token>"
  }'
```

### Forgot Password
```bash
curl -X POST http://localhost:3000/api/v1/user/forgot-password \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com"
  }'
```

### Change Password
```bash
curl -X POST http://localhost:3000/api/v1/user/change-password \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "oldPassword": "currentpassword",
    "newPassword": "newpassword"
  }'
```

---

## 👤 Profile

### Get Profile
```bash
curl -X GET http://localhost:3000/api/v1/user/profile \
  -H "Authorization: Bearer <token>"
```

### Search Profiles
```bash
curl -X GET "http://localhost:3000/api/v1/user/profile/search?keyword=john" \
  -H "Authorization: Bearer <token>"
```

### Update Profile
```bash
curl -X POST http://localhost:3000/api/v1/user/profile/update \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "New Name",
    "avatar": "https://example.com/avatar.jpg"
  }'
```

---

## 💰 Wallet

### Create Wallet
```bash
curl -X POST http://localhost:3000/api/v1/wallet \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Main Wallet",
    "balance": 1000000,
    "currency": "VND"
  }'
```

### Get Wallets (by Account)
```bash
curl -X GET http://localhost:3000/api/v1/wallet \
  -H "Authorization: Bearer <token>"
```

### Get All Wallets
```bash
curl -X GET http://localhost:3000/api/v1/wallet/all \
  -H "Authorization: Bearer <token>"
```

### Get Total Balance
```bash
curl -X GET http://localhost:3000/api/v1/wallet/balance \
  -H "Authorization: Bearer <token>"
```

### Update Wallet
```bash
curl -X PUT http://localhost:3000/api/v1/wallet/{wallet_id} \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Updated Wallet Name",
    "balance": 2000000
  }'
```

### Delete Wallet
```bash
curl -X DELETE http://localhost:3000/api/v1/wallet/{wallet_id} \
  -H "Authorization: Bearer <token>"
```

---

## 📊 Transaction

### Get Transaction Summary
```bash
curl -X GET http://localhost:3000/api/v1/transaction/summary \
  -H "Authorization: Bearer <token>"
```

### Get Transaction Summary Balance
```bash
curl -X GET http://localhost:3000/api/v1/transaction/summary-balance \
  -H "Authorization: Bearer <token>"
```

### Get Monthly Chart Data
```bash
curl -X GET http://localhost:3000/api/v1/transaction/monthly-chart \
  -H "Authorization: Bearer <token>"
```

### Get Transactions (with Filter)
```bash
curl -X GET "http://localhost:3000/api/v1/transaction?wallet_id=1&start_date=2024-01-01&end_date=2024-12-31" \
  -H "Authorization: Bearer <token>"
```

### Get Transaction by ID
```bash
curl -X GET http://localhost:3000/api/v1/transaction/{id} \
  -H "Authorization: Bearer <token>"
```

### Create Transaction
```bash
curl -X POST http://localhost:3000/api/v1/transaction/create \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "wallet_id": 1,
    "category_id": 1,
    "amount": 500000,
    "type": "expense",
    "note": "Coffee"
  }'
```

### Update Transaction
```bash
curl -X PUT http://localhost:3000/api/v1/transaction/update/{id} \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 600000,
    "note": "Updated note"
  }'
```

### Delete Transaction
```bash
curl -X DELETE http://localhost:3000/api/v1/transaction/{id} \
  -H "Authorization: Bearer <token>"
```

---

## 📁 Transaction Category

### Get All Categories
```bash
curl -X GET http://localhost:3000/api/v1/transaction-category \
  -H "Authorization: Bearer <token>"
```

### Get Categories by Owner
```bash
curl -X GET http://localhost:3000/api/v1/transaction-category/owner \
  -H "Authorization: Bearer <token>"
```

### Search Category
```bash
curl -X GET "http://localhost:3000/api/v1/transaction-category/search?keyword=food" \
  -H "Authorization: Bearer <token>"
```

### Create Category
```bash
curl -X POST http://localhost:3000/api/v1/transaction-category/create \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Food & Drink",
    "icon": "🍔",
    "type": "expense"
  }'
```

### Update Category
```bash
curl -X PUT http://localhost:3000/api/v1/transaction-category/update/{id} \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Updated Category Name"
  }'
```

### Delete Category
```bash
curl -X DELETE http://localhost:3000/api/v1/transaction-category/delete/{id} \
  -H "Authorization: Bearer <token>"
```

---

## 📈 Transaction Report

### Get Report Summary
```bash
curl -X GET "http://localhost:3000/api/v1/transaction-report/summary?start_date=2024-01-01&end_date=2024-12-31" \
  -H "Authorization: Bearer <token>"
```

### Get Summary by Category
```bash
curl -X GET "http://localhost:3000/api/v1/transaction-report/summary-category?start_date=2024-01-01&end_date=2024-12-31" \
  -H "Authorization: Bearer <token>"
```

---

## 💬 Conversation

### Get Conversations
```bash
curl -X GET http://localhost:3000/api/v1/conversation \
  -H "Authorization: Bearer <token>"
```

### Create Conversation
```bash
curl -X POST http://localhost:3000/api/v1/conversation/create \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "private",
    "members": [2]
  }'
```

### Mark Conversation as Read
```bash
curl -X POST http://localhost:3000/api/v1/conversation/{id}/read \
  -H "Authorization: Bearer <token>"
```

---

## 📨 Message

### Send Message
```bash
curl -X POST http://localhost:3000/api/v1/message/send \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "conversation_id": 1,
    "content": "Hello!",
    "type": "text"
  }'
```

### Get Messages (with Pagination)
```bash
curl -X GET "http://localhost:3000/api/v1/message/{conversationId}?page=1&limit=20" \
  -H "Authorization: Bearer <token>"
```

---

## 👥 Follow System

### Follow User
```bash
curl -X POST http://localhost:3000/api/v1/follow/{userId} \
  -H "Authorization: Bearer <token>"
```

### Unfollow User
```bash
curl -X DELETE http://localhost:3000/api/v1/follow/{userId} \
  -H "Authorization: Bearer <token>"
```

### Get Followers
```bash
curl -X GET http://localhost:3000/api/v1/follow/followers \
  -H "Authorization: Bearer <token>"
```

### Get Following
```bash
curl -X GET http://localhost:3000/api/v1/follow/following \
  -H "Authorization: Bearer <token>"
```

### Get Follow Status
```bash
curl -X GET http://localhost:3000/api/v1/follow/status/{userId} \
  -H "Authorization: Bearer <token>"
```

---

## 🚫 Block System

### Block User
```bash
curl -X POST http://localhost:3000/api/v1/block/{userId} \
  -H "Authorization: Bearer <token>"
```

### Unblock User
```bash
curl -X DELETE http://localhost:3000/api/v1/block/{userId} \
  -H "Authorization: Bearer <token>"
```

### Get Blocked Users
```bash
curl -X GET http://localhost:3000/api/v1/block/list \
  -H "Authorization: Bearer <token>"
```

---

## 🔔 Notifications

### Get Notifications
```bash
curl -X GET http://localhost:3000/api/v1/notifications \
  -H "Authorization: Bearer <token>"
```

### Mark Notification as Read
```bash
curl -X PUT http://localhost:3000/api/v1/notifications/{id}/read \
  -H "Authorization: Bearer <token>"
```

---

## 🔌 Socket Events

| Event Name | Direction | Description |
|------------|-----------|-------------|
| `connect` | Client → Server | Connection established |
| `disconnect` | Client ↔ Server | Connection closed |
| `join_room` | Client → Server | Join a conversation room |
| `leave_room` | Client → Server | Leave a conversation room |
| `send_message` | Client → Server | Send a message |
| `receive_message` | Server → Client | Receive a new message |
| `update_last_message` | Server → Client | Update last message in conversation list |
| `typing` | Client ↔ Server | User is typing |
| `stop_typing` | Client ↔ Server | User stopped typing |
| `message_read` | Server → Client | Message marked as read |
| `user_online` | Server → Client | User came online |
| `user_offline` | Server → Client | User went offline |
| `follow_update` | Server → Client | Follow status changed |
| `transaction_created` | Server → Client | New transaction created |
| `transaction_updated` | Server → Client | Transaction updated |
| `transaction_deleted` | Server → Client | Transaction deleted |

---

## Response Format

### Success Response
```json
{
  "status": true,
  "message": "Success message",
  "data": { ... }
}
```

### Error Response
```json
{
  "status": false,
  "message": "Error message",
  "data": null
}
```

---

*Generated on 2026-01-06*
