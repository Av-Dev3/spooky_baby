# Admin Setup - Reviews

The reviews system no longer uses Supabase. Reviews are stored in Netlify Blobs.

## Setup

### 1. Environment Variable

In your Netlify site dashboard:

1. Go to **Site settings** → **Environment variables**
2. Add a variable: `ADMIN_PASSWORD` = your secret admin password
3. Deploy the site

### 2. Admin Page

- **URL**: `https://yoursite.com/admin` (or `/admin.html`)
- **Access**: No link on the public site. Bookmark or type the URL directly.
- **Login**: Enter the password you set in `ADMIN_PASSWORD`

### 3. Admin Features

- View all reviews
- Respond to reviews (responses appear below the review on the main site)
- Update existing responses

### 4. Deploy

After adding `ADMIN_PASSWORD`, redeploy so the new Netlify functions (`get-reviews`, `submit-review`, `admin-reviews`) are available.

## API Endpoints

- `GET /.netlify/functions/get-reviews` — Public: get all reviews
- `POST /.netlify/functions/submit-review` — Public: submit new review
- `GET /.netlify/functions/admin-reviews?password=xxx` — Admin: get all reviews
- `POST /.netlify/functions/admin-reviews` — Admin: add/update response (body: `{ password, action: "respond", reviewId, response }`)
