Here's a complete guide on how the forgot password flow works and how to test it in Postman.

---

## 🔐 How Forgot Password Works (Step by Step)

### The Full Flow

```
User                    Backend                      Email (Gmail SMTP)
 |                         |                               |
 |-- POST /forgot-password→|                               |
 |   { email }             |                               |
 |                         |-- Find user by email          |
 |                         |-- Generate rawToken (64 hex chars via crypto.randomBytes)
 |                         |-- Hash rawToken → SHA-256 → hashedToken
 |                         |-- Save hashedToken + expiry (1hr) to DB
 |                         |-- Build reset link with rawToken --------→|
 |                         |                               | Send email |
 |←-- 200 "If account exists, link was sent" ←------------|            |
 |                         |                               |            |
 |  (User clicks link in email)                                         |
 |                         |                               |            |
 |-- POST /reset-password/:rawToken →|                                  |
 |   { password: "newPass" }         |                                  |
 |                         |-- Hash rawToken → SHA-256                  |
 |                         |-- Find user where hashedToken matches      |
 |                         |   AND resetPasswordExpires > NOW           |
 |                         |-- Update password (bcrypt re-hashes it)    |
 |                         |-- Clear resetPasswordToken + Expires       |
 |←-- 200 "Password reset successfully" ←-----|
```

### Why is the token hashed in the DB?

| What's stored | Where |
|---|---|
| **Raw token** (e.g. `a3f9...bc12`) | Only in the email link |
| **SHA-256 hash of token** | In MongoDB (`resetPasswordToken` field) |

This means even if your database is breached, attackers **cannot use the tokens** from the DB — they only have hashes.

---

## 🧪 Testing in Postman

Make sure your server is running first:
```bash
cd backend
npm run dev
```

---

### Step 1 — Request a Password Reset

**`POST http://localhost:5000/api/auth/forgot-password`**

| Setting | Value |
|---|---|
| Method | `POST` |
| URL | `http://localhost:5000/api/auth/forgot-password` |
| Headers | `Content-Type: application/json` |
| Body (raw JSON) | `{ "email": "rbiswas01999@gmail.com" }` |

**Expected Response:**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "If an account with that email exists, a password reset link has been sent.",
  "data": null
}
```

> ✅ Check your Gmail inbox for a **"Reset Your Password"** email from VerbaSense Support.

---

### Step 2 — Copy the Token from the Email

The email contains a link like:
```
http://localhost:5000/api/auth/reset-password/a3f9b12c4e...64hexchars...bc12
```
**Copy the long token after `/reset-password/`** — you'll need it for the next request.

---

### Step 3 — Reset the Password

**`POST http://localhost:5000/api/auth/reset-password/:token`**

| Setting | Value |
|---|---|
| Method | `POST` |
| URL | `http://localhost:5000/api/auth/reset-password/PASTE_TOKEN_HERE` |
| Headers | `Content-Type: application/json` |
| Body (raw JSON) | `{ "password": "myNewPassword123" }` |

**Expected Response:**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Password has been reset successfully. You can now log in with your new password.",
  "data": null
}
```

---

### Step 4 — Verify Login Works with New Password

**`POST http://localhost:5000/api/auth/login`**
```json
{
  "email": "rbiswas01999@gmail.com",
  "password": "myNewPassword123"
}
```

---

## ⚠️ Edge Cases to Test

| Scenario | How to test | Expected response |
|---|---|---|
| **Email doesn't exist** | Use a fake email in Step 1 | Same 200 response (anti-enumeration) |
| **Token already used** | Repeat Step 3 with the same token | `400 - Token is invalid or has expired` |
| **Token expired** | Wait 1 hour, then use token | `400 - Token is invalid or has expired` |
| **Password too short** | Send `"password": "abc"` | `400 - Password must be at least 6 characters` |
| **Missing password field** | Send empty body in Step 3 | `400 - Token and new password are required` |