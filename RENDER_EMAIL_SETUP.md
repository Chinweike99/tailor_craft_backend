# Fix Email Issues on Render

## The Problem
Registration works locally but fails on Render with: `"Error: Failed to send email"`

This is because your **email environment variables are not properly configured on Render**.

## Solution Steps

### 1. Get Gmail App Password
Since you're using Gmail, you need an **App Password** (not your regular Gmail password):

1. Go to your Google Account: https://myaccount.google.com/
2. Select **Security** from the left menu
3. Enable **2-Step Verification** (if not already enabled)
4. After enabling 2FA, go back to Security
5. Under "How you sign in to Google", click on **App passwords**
6. Select app: **Mail**
7. Select device: **Other (Custom name)**
8. Enter: "TailorCraft Backend"
9. Click **Generate**
10. **Copy the 16-character password** (it will look like: `abcd efgh ijkl mnop`)

### 2. Configure Environment Variables on Render

1. Go to your Render dashboard: https://dashboard.render.com/
2. Click on your **tailor_craft_backend** service
3. Go to the **Environment** tab
4. Add/Update these environment variables:

```
EMAIL_SERVICE=gmail
EMAIL_USER=chinweiketwitter@gmail.com
EMAIL_PASS=<your-16-character-app-password>
EMAIL_FROM=chinweiketwitter@gmail.com
```

**Important:** 
- Replace `<your-16-character-app-password>` with the actual App Password you generated
- Remove any spaces from the App Password (use: `abcdefghijklmnop` not `abcd efgh ijkl mnop`)
- Make sure `EMAIL_USER` matches your Gmail address
- Use the same email for `EMAIL_FROM`

### 3. Save and Redeploy

1. Click **Save Changes** in Render
2. Render will automatically redeploy your service
3. Wait for the deployment to complete (check the logs)

### 4. Verify the Fix

After redeployment:

1. Check the deployment logs for these messages:
   - `✅ Database connected successfully`
   - Should NOT see: `⚠️ WARNING: EMAIL_USER is not set`
   
2. Try registering again from your frontend

3. Check the logs for:
   ```
   === Gmail Configuration Debug ===
   Service: gmail
   User exists: true
   From email: chinweiketwitter@gmail.com
   Transporter is ready to send emails ✅
   ===================================
   Email sent successfully to [user-email]
   ```

## Alternative: Using a Different Email Service

If Gmail doesn't work, you can use **SendGrid** or **Mailgun** (both have free tiers):

### SendGrid Setup:
1. Sign up at https://sendgrid.com/
2. Create an API key
3. Update your Render environment variables:
```
EMAIL_SERVICE=sendgrid
EMAIL_USER=apikey
EMAIL_PASS=<your-sendgrid-api-key>
EMAIL_FROM=noreply@yourdomain.com
```

## Troubleshooting

If it still doesn't work after setting up:

1. **Check Render logs** - Look for the detailed error message we added
2. **Verify App Password** - Make sure there are no spaces and it's the full 16 characters
3. **Check Gmail settings** - Make sure "Less secure app access" is OFF (you should use App Passwords instead)
4. **Try a different email** - Sometimes Gmail blocks certain IP addresses

## What We Changed in the Code

1. **Better error logging** - Now shows the actual error message instead of generic "Failed to send email"
2. **Configuration validation** - Warns on startup if email variables are missing
3. **Fallback for EMAIL_FROM** - Uses EMAIL_USER if EMAIL_FROM is not set

These changes will help you debug the issue in production.
