# Square Payment Setup (Test Page)

The test page at `/test` includes Square card payment. Configure it as follows:

## 1. Square Developer Dashboard

1. Go to [Square Developer Dashboard](https://developer.squareup.com/apps)
2. Create an app or use an existing one
3. **Sandbox** (for testing):
   - Application ID → `test/square-config.js` → `applicationId`
   - Location ID → `test/square-config.js` → `locationId`
   - Access Token → Netlify env → `SQUARE_ACCESS_TOKEN`

## 2. Client-Side Config

Edit `test/square-config.js`:

```javascript
const SQUARE_CONFIG = {
  applicationId: 'YOUR_SANDBOX_APP_ID',
  locationId: 'YOUR_SANDBOX_LOCATION_ID',
  useSandbox: true  // Set false for production
};
```

## 3. Netlify Environment Variables

In Netlify: Site settings → Environment variables:

| Variable | Value |
|----------|-------|
| `SQUARE_ACCESS_TOKEN` | Your Square sandbox access token |
| `SQUARE_LOCATION_ID` | (Optional) Location ID if not sent from frontend |
| `SQUARE_SANDBOX` | `true` for sandbox, `false` for production |

## 4. Production

- Use `https://web.squarecdn.com/v1/square.js` (no "sandbox") in `test/index.html`
- Use production Application ID, Location ID, and Access Token
