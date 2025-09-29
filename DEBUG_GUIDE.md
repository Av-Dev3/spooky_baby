# Debug Guide for Google Drive Gallery

## Current Issue: 500 Error

The gallery is showing a 500 error, which means there's an issue with the Netlify function. Here's how to debug it:

## Step 1: Check Environment Variables

First, test if your environment variables are set correctly:

1. **Deploy the test function** (if not already deployed)
2. **Visit**: `https://your-site.netlify.app/.netlify/functions/test-env`
3. **Check the response** - it should show which variables are present

## Step 2: Check the Main Function Error

Visit the main function directly to see the detailed error:
`https://your-site.netlify.app/.netlify/functions/drive-photos?limit=24`

This will show you the specific error message.

## Step 3: Common Issues & Solutions

### Issue 1: Missing Environment Variables
**Error**: "Server configuration error: Missing Google Drive credentials"

**Solution**:
1. Go to Netlify Dashboard → Your Site → Site Settings → Environment Variables
2. Add these three variables:
   ```
   GOOGLE_CLIENT_EMAIL=your-service-account@project.iam.gserviceaccount.com
   GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour private key here\n-----END PRIVATE KEY-----"
   GOOGLE_DRIVE_FOLDER_ID=your-folder-id-here
   ```
3. Make sure to include the quotes around the private key
4. Redeploy your site

### Issue 2: Invalid Service Account Credentials
**Error**: "Invalid service account credentials"

**Solution**:
1. Check that the `GOOGLE_CLIENT_EMAIL` matches exactly from your JSON file
2. Check that the `GOOGLE_PRIVATE_KEY` includes the full PEM format with `\n` for newlines
3. Make sure there are no extra spaces or characters

### Issue 3: Service Account Lacks Permission
**Error**: "Service account lacks permission to access folder"

**Solution**:
1. Go to your Google Drive folder
2. Right-click → Share
3. Add your service account email as a viewer
4. Make sure the folder ID is correct

### Issue 4: Google Drive Folder Not Found
**Error**: "Google Drive folder not found"

**Solution**:
1. Check that the `GOOGLE_DRIVE_FOLDER_ID` is correct
2. The folder ID is the long string in the URL after `/folders/`
3. Make sure the folder exists and is accessible

## Step 4: Test Locally (Optional)

If you want to test locally:

1. **Install Netlify CLI**:
   ```bash
   npm install -g netlify-cli
   ```

2. **Create `.env` file** in your project root:
   ```
   GOOGLE_CLIENT_EMAIL=your-service-account@project.iam.gserviceaccount.com
   GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour private key here\n-----END PRIVATE KEY-----"
   GOOGLE_DRIVE_FOLDER_ID=your-folder-id-here
   ```

3. **Run locally**:
   ```bash
   netlify dev
   ```

4. **Test the functions**:
   - `http://localhost:8888/.netlify/functions/test-env`
   - `http://localhost:8888/.netlify/functions/drive-photos?limit=24`

## Step 5: Check Browser Console

After fixing the environment variables, check the browser console for any remaining errors. The gallery should now load properly.

## Quick Fix Checklist

- [ ] Environment variables are set in Netlify
- [ ] Service account has access to the Google Drive folder
- [ ] Google Drive API is enabled in Google Cloud Console
- [ ] The folder ID is correct
- [ ] The private key format is correct (with `\n` for newlines)
- [ ] Site has been redeployed after setting environment variables

## Still Having Issues?

If you're still getting errors after following these steps, please share:
1. The response from the test-env function
2. The response from the drive-photos function
3. Any error messages in the browser console

This will help identify the specific issue.
