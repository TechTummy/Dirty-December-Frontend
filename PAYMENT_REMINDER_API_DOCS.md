# Payment Reminder API Documentation

This document provides details for the Payment Reminder API endpoints, including both User settings and Admin controls.

---

## 1. User Endpoints
**Prefix**: `/api/v1/users/settings`
**Auth**: Bearer Token required.

### Get Payment Reminder Status
Check if the authenticated user has payment reminders enabled.

**GET** `/payment-reminder-status`

**Response (Success)**:
```json
{
  "success": true,
  "data": {
    "payment_reminder_enabled": true
  }
}
```

---

### Toggle Payment Reminder
Enable or disable payment reminders for the authenticated user.

**POST** `/toggle-payment-reminder`

**Request Body**: None

**Response (Success)**:
```json
{
  "success": true,
  "message": "Payment reminder status updated",
  "data": {
    "payment_reminder_enabled": false
  }
}
```

---

## 2. Admin Endpoints
**Prefix**: `/api/v1/admin/reminders`
**Auth**: Bearer Token required (Admin role).

### Trigger Payment Reminders
Manually trigger the process of sending SMS reminders to all eligible users who haven't paid for the current month.

**POST** `/trigger`

**Request Body**: None

**Response (Success)**:
```json
{
  "success": true,
  "message": "Payment reminders triggered successfully",
  "data": {
    "output": "Starting payment reminders send-out...\nReminder sent to John Doe (2348012345678)\nPayment reminders process completed. Total sent: 1"
  }
}
```

---

## Key Implementation Details (Frontend)
- **Default State**: By default, `payment_reminder_enabled` is `false` for all users.
- **Visual Feedback**: The frontend should provide a toggle switch or checkbox in the user's settings profile to allow them to manage this.
- **Automation**: Reminders are automatically scheduled by the backend to be sent daily, but they only trigger actual SMS messages one day before the end of the month. The Admin trigger endpoint is for manual intervention/testing.
