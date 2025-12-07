# Supabase Reviews Setup Guide

This guide will help you set up Supabase to enable the customer reviews feature on your checkout page.

## Why Supabase?

Supabase is a great choice for reviews because:
- **Free tier**: Generous free tier perfect for small businesses
- **Easy setup**: Simple database setup with a user-friendly interface
- **Real-time**: Can enable real-time updates if needed in the future
- **Secure**: Built-in Row Level Security (RLS) for data protection
- **No backend needed**: Works directly from the frontend

## Step 1: Create a Supabase Account

1. Go to [https://supabase.com](https://supabase.com)
2. Click "Start your project" and sign up (free)
3. Create a new project
4. Choose a name for your project (e.g., "spooky-baby-sweets")
5. Set a database password (save this securely!)
6. Choose a region closest to your users
7. Click "Create new project"

## Step 2: Create the Reviews Table

Once your project is created:

1. Go to the **Table Editor** in the left sidebar
2. Click **"New table"**
3. Name it: `reviews`
4. Click **"Save"**

Now add the following columns:

### Column 1: `id`
- Type: `int8` (bigint)
- Default value: `uuid_generate_v4()` (or use auto-increment)
- Actually, let's use `uuid` type instead:
  - Type: `uuid`
  - Default value: `uuid_generate_v4()`
  - Primary key: ✓ (check this)
  - Is nullable: ✗ (uncheck)

### Column 2: `name`
- Type: `text`
- Is nullable: ✗ (uncheck)

### Column 3: `rating`
- Type: `int2` (smallint)
- Is nullable: ✗ (uncheck)

### Column 4: `text`
- Type: `text`
- Is nullable: ✗ (uncheck)

### Column 5: `image_url`
- Type: `text`
- Is nullable: ✓ (check - this is optional)

### Column 6: `created_at`
- Type: `timestamptz`
- Default value: `now()`
- Is nullable: ✗ (uncheck)

**Alternative: Use SQL Editor**

Instead of using the table editor, you can use the SQL Editor:

1. Go to **SQL Editor** in the left sidebar
2. Click **"New query"**
3. Paste this SQL:

```sql
-- Create reviews table
CREATE TABLE IF NOT EXISTS reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  rating SMALLINT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  text TEXT NOT NULL,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Enable Row Level Security
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Create policy to allow anyone to read reviews
CREATE POLICY "Anyone can read reviews" ON reviews
  FOR SELECT
  USING (true);

-- Create policy to allow anyone to insert reviews
CREATE POLICY "Anyone can insert reviews" ON reviews
  FOR INSERT
  WITH CHECK (true);
```

4. Click **"Run"** (or press Cmd/Ctrl + Enter)

## Step 3: Set Up Supabase Storage for Review Photos

1. Go to **Storage** in the left sidebar
2. Click **"New bucket"**
3. Name it: `review-photos`
4. Make it **Public** (toggle "Public bucket" to ON)
5. Click **"Create bucket"**

### Set Up Storage Policies

After creating the bucket, you need to set up policies:

1. Click on the `review-photos` bucket
2. Go to the **"Policies"** tab
3. Click **"New Policy"**
4. Choose **"For full customization"**
5. Name it: `Allow public uploads`
6. Use this SQL:

```sql
-- Allow anyone to upload photos
CREATE POLICY "Allow public uploads"
ON storage.objects FOR INSERT
TO public
WITH CHECK (bucket_id = 'review-photos');

-- Allow anyone to read photos
CREATE POLICY "Allow public reads"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'review-photos');
```

7. Click **"Review"** and then **"Save policy"**

**Note:** If you want to restrict uploads (e.g., only authenticated users), you can modify these policies. For a public review system, allowing public uploads is fine since you can add moderation later.

## Step 4: Get Your API Credentials

1. Go to **Settings** (gear icon) in the left sidebar
2. Click **"API"**
3. You'll see two important values:
   - **Project URL**: Copy this (looks like `https://xxxxx.supabase.co`)
   - **anon/public key**: Copy this (long string starting with `eyJ...`)

## Step 5: Configure Your Website

1. Open `index.html` in your project
2. Find the Supabase configuration section (around line 410):
   ```html
   <script>
       window.SUPABASE_URL = ''; // Your Supabase project URL
       window.SUPABASE_ANON_KEY = ''; // Your Supabase anon/public key
   </script>
   ```
3. Paste your credentials:
   ```html
   <script>
       window.SUPABASE_URL = 'https://xxxxx.supabase.co';
       window.SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';
   </script>
   ```

## Step 6: Test It Out

1. Deploy your site or test locally
2. Go to the homepage
3. Scroll down to the "Customer Reviews" section (below the order form)
4. Try submitting a test review with a photo
5. Check your Supabase dashboard → Table Editor → reviews table to see if it appears
6. Check your Supabase dashboard → Storage → review-photos bucket to see uploaded photos

## Security Notes

- The `anon` key is safe to use in frontend code (it's public)
- Row Level Security (RLS) policies ensure only authorized operations
- The current setup allows anyone to read and insert reviews (perfect for a public review system)
- If you want to moderate reviews, you can:
  - Add an `approved` boolean column
  - Only show approved reviews in the display
  - Manually approve reviews through the Supabase dashboard

## Troubleshooting

### Reviews not showing up?
- Check browser console for errors
- Verify your Supabase URL and key are correct
- Check Supabase dashboard → Table Editor to see if reviews are being inserted
- Check Supabase dashboard → Logs for any errors

### "Supabase credentials not configured" warning?
- Make sure you've added the URL and key in `checkout.html`
- Check that the script tags are in the correct order (Supabase client library must load first)

### CORS errors?
- Supabase handles CORS automatically, but if you see issues, check your Supabase project settings

### Database connection errors?
- Verify your Supabase project is active (not paused)
- Check that the table name is exactly `reviews` (lowercase)
- Verify column names match: `id`, `name`, `rating`, `text`, `image_url`, `created_at`

### Photo upload errors?
- Make sure the `review-photos` bucket exists and is public
- Check that Storage policies are set up correctly
- Verify file size is under 5MB
- Check browser console for detailed error messages
- Ensure the bucket name matches exactly: `review-photos`

## Optional: Add Review Moderation

If you want to moderate reviews before they appear:

1. Add a new column to the `reviews` table:
   - Name: `approved`
   - Type: `bool`
   - Default: `false`

2. Update the SQL query in `reviews.js` to only fetch approved reviews:
   ```javascript
   const { data, error } = await this.supabase
       .from('reviews')
       .select('*')
       .eq('approved', true)  // Add this line
       .order('created_at', { ascending: false });
   ```

3. Approve reviews manually in Supabase dashboard by setting `approved = true`

## Photo Upload Features

The review system now supports photo uploads:

- **File size limit**: 5MB per photo
- **Supported formats**: JPG, PNG, WebP
- **Storage**: Photos are stored in Supabase Storage bucket `review-photos`
- **Display**: Photos appear in review cards below the rating and above the text
- **Optional**: Users can submit reviews with or without photos

### Storage Limits

Supabase free tier includes:
- 1GB of storage
- 2GB bandwidth per month

For most small businesses, this is plenty for review photos. If you need more, Supabase has affordable paid plans.

## Need Help?

- Supabase Documentation: https://supabase.com/docs
- Supabase Discord: https://discord.supabase.com
- Check the browser console for detailed error messages

