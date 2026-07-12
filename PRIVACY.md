# Privacy Policy

**Effective Date:** July 12, 2026

This Privacy Policy outlines how your data is collected, stored, and managed when using the Sadhana Journal application. We are committed to protecting your privacy in accordance with global standards, including the European Union's General Data Protection Regulation (GDPR).

---

## 1. Information We Collect

We collect only the minimum amount of data required to provide a functional and personalized spiritual logging experience:

### A. Personal Identification Data
* **Email Address & Password:** When you create an account to sync your logs, we store your email address.
* **Authentication Tokens:** We use Google Firebase Authentication to manage secure logins. Your password is encrypted and never visible to us.
* **Profile Nickname:** An optional display name/nickname you choose to personalize your dashboard.

### B. App Usage & Log Data
* **Sadhana Configs:** Titles, colors, and types of practices you track (preset or custom).
* **Daily Completion Logs:** Dates, completion status (done/not done), and count values (multiples of Malas or raw repetitions) for each practice.
* **Personal Journal Reflections:** Optional text notes (`notes`) you write to record your thoughts, feelings, or experiences for any day.
* **Sankalps (Vows):** Vow titles, durations, targets, status changes, and history of previous retry attempts.

### C. Client-Side Storage
* **Local Storage:** The app caches your configuration and logs in your browser's local storage (`localStorage`) to support offline loading and immediate retrieval of guest progress.

---

## 2. How We Store and Protect Your Data

Our database architecture is designed with security and data isolation as the primary priorities:

### A. Hosting & Database Encryption
* **HTTPS Encryption:** All data transmitted between your browser and our servers is encrypted in transit using Transport Layer Security (TLS/HTTPS).
* **Cloud Storage:** Your logs are stored in Google Cloud Firestore. Firebase handles physical storage security, backups, and encryption at rest.

### B. Access Control (Firestore Security Rules)
Your cloud records are strictly isolated. We enforce server-side Firestore security rules that require user authentication and restrict access:
```javascript
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```
* **No other user** can read or write your logs.
* **No third party** has access to your journal.

---

## 3. GDPR Compliance (European Privacy Standards)

Under the GDPR, you have specific rights regarding your personal data. Here is how our app supports those rights:

1. **Right of Access (Article 15):** All information stored in the cloud is directly visible and accessible on your dashboard.
2. **Right to Rectification (Article 16):** You can update your display name, edit log entries, and modify custom practices at any time in the settings.
3. **Right to Erasure / "Right to be Forgotten" (Article 17):** 
   - You can delete individual log entries, vows, or custom practices directly from the interface.
   - If you delete your account, all associated auth credentials and Firestore database records are permanently deleted.
4. **Right to Data Portability (Article 20):** Your logs are kept in clean JSON format. You can request a complete export of your raw JSON data file.
5. **Data Minimization (Article 5(1)(c)):** We do not collect location tracking, IP logs, cookies for marketing, device identifiers, or usage telemetry.

---

## 4. Third-Party Sharing

We do not sell, rent, trade, or share your personal data, daily logs, or journal reflections with any third parties, advertisers, or marketing networks.

---

## 5. Contact & Data Deletion Requests

For any privacy-related questions, data export requests, or to request permanent account and data deletion, please contact:
* **Developer/Data Controller:** [Your Name / Email Address]
