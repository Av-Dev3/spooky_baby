# Google Drive Photo Gallery Setup

This document explains how to set up the Google Drive-powered photo gallery that replaces the Instagram embed.

## Prerequisites

1. **Google Cloud Project** with Drive API enabled
2. **Service Account** with access to your Google Drive folder
3. **Netlify** account with environment variables configured

## Setup Steps

### 1. Google Cloud Console Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google Drive API:
   - Go to "APIs & Services" > "Library"
   - Search for "Google Drive API"
   - Click "Enable"

### 2. Create Service Account

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "Service Account"
3. Fill in the service account details:
   - Name: `spooky-baby-gallery`
   - Description: `Service account for photo gallery`
4. Click "Create and Continue"
5. Skip the roles for now (click "Continue")
6. Click "Done"

### 3. Generate Service Account Key

1. Find your service account in the credentials list
2. Click on the service account email
3. Go to the "Keys" tab
4. Click "Add Key" > "Create new key"
5. Choose "JSON" format
6. Download the JSON file

### 4. Set Up Google Drive Folder

1. Create a folder in Google Drive for your photos
2. Right-click the folder > "Share"
3. Add your service account email (from the JSON file) as a viewer
4. Copy the folder ID from the URL (the long string after `/folders/`)

### 5. Configure Netlify Environment Variables

In your Netlify dashboard:

1. Go to "Site settings" > "Environment variables"
2. Add these variables:

```
GOOGLE_CLIENT_EMAIL=your-service-account@project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour private key here\n-----END PRIVATE KEY-----"
GOOGLE_DRIVE_FOLDER_ID=your-folder-id-here
```

**Important Notes:**
- The `GOOGLE_PRIVATE_KEY` must include the full PEM format with `\n` for newlines
- The `GOOGLE_DRIVE_FOLDER_ID` is the long string from your folder URL
- Make sure there are no extra spaces or quotes around the values

### 6. Deploy to Netlify

1. Install dependencies:
   ```bash
   npm install
   ```

2. Deploy to Netlify:
   ```bash
   npm run deploy
   ```

   Or use Netlify CLI:
   ```bash
   netlify deploy --prod
   ```

## How It Works

### Backend (Netlify Function)
- **File**: `netlify/functions/drive-photos.js`
- **Endpoint**: `/.netlify/functions/drive-photos`
- **Function**: Fetches images from Google Drive using the service account
- **Returns**: JSON with image data including URLs, captions, and metadata

### Frontend (JavaScript)
- **File**: `public/js/drive-gallery.js`
- **Features**:
  - Responsive masonry grid layout
  - Lazy loading for performance
  - Accessible lightbox with keyboard navigation
  - Error handling and loading states

### Styling
- **File**: `public/css/drive-gallery.css`
- **Features**:
  - Mobile-first responsive design
  - Smooth hover effects
  - Accessible focus states
  - Print-friendly styles

## Customization

### Change Number of Photos
In `public/js/drive-gallery.js`, modify the gallery initialization:
```javascript
const gallery = new DriveGallery('driveGallery', {
  limit: 24, // Change this number
  columns: {
    mobile: 2,
    tablet: 3,
    desktop: 4
  }
});
```

### Change Grid Layout
Modify the `columns` object in the gallery configuration:
```javascript
columns: {
  mobile: 2,    // 2 columns on mobile
  tablet: 3,    // 3 columns on tablet
  desktop: 4    // 4 columns on desktop
}
```

### Add More Albums
To support multiple albums, you can:
1. Create additional folders in Google Drive
2. Modify the Netlify function to accept a `folder` parameter
3. Update the frontend to switch between folders

## Troubleshooting

### Common Issues

1. **"Server configuration error"**
   - Check that all environment variables are set correctly
   - Verify the service account email and private key format

2. **"Failed to fetch photos"**
   - Ensure the service account has access to the folder
   - Check that the folder ID is correct
   - Verify the Google Drive API is enabled

3. **Images not loading**
   - Check browser console for CORS errors
   - Verify the image URLs are accessible
   - Ensure the folder contains image files

### Testing Locally

1. Install Netlify CLI:
   ```bash
   npm install -g netlify-cli
   ```

2. Set up environment variables in `.env` file:
   ```
   GOOGLE_CLIENT_EMAIL=your-service-account@project.iam.gserviceaccount.com
   GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour private key here\n-----END PRIVATE KEY-----"
   GOOGLE_DRIVE_FOLDER_ID=your-folder-id-here
   ```

3. Run locally:
   ```bash
   netlify dev
   ```

## Security Notes

- The service account should only have read access to the specific folder
- Never commit the service account JSON file to version control
- Use environment variables for all sensitive data
- The function includes proper error handling and CORS headers

## Performance

- Images are lazy-loaded for better performance
- Thumbnails are used initially, then full images load in background
- Caching headers are set for optimal performance
- The grid layout is responsive and optimized for different screen sizes

## Adding New Photos

Simply add new images to your Google Drive folder! The gallery will automatically show them on the next page load. No code changes needed.

For immediate updates, you can:
1. Clear the Netlify function cache
2. Or implement a refresh mechanism in the frontend
