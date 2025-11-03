# Firestore Security Rules for PennyPilot

## Instructions

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your PennyPilot project
3. Navigate to **Firestore Database** → **Rules** tab
4. Replace the existing rules with the rules below
5. Click **Publish**

## Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // User-specific data - only accessible by the authenticated user
    match /users/{userId}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // Deny access to everything else
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

## What This Does

- **User Authentication Required**: All data operations require the user to be logged in
- **User-Specific Access**: Users can only read/write their own data under `/users/{userId}/...`
- **Collections Protected**:
  - `/users/{userId}/transactions` - User's transactions
  - `/users/{userId}/categories` - User's categories
  - `/users/{userId}/paymentMethods` - User's payment methods
  - `/users/{userId}/settings` - User's settings
  - `/users/{userId}/categoryBudgets` - User's category budgets

## Testing

After updating the rules:

1. Try to login with a test account
2. Add a transaction - it should save successfully
3. Check that only your transactions are visible
4. Try to access another user's data - it should be denied

## Troubleshooting

If you see permission errors:
- Make sure you're logged in (check Firebase Auth console)
- Verify the rules were published successfully
- Check that your userId matches the authenticated user's UID
- Look at the Firestore Rules Playground to test specific queries
