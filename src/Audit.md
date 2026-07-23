Master Production Readiness Checklist

Tell Antigravity:

Audit the entire application from frontend to backend. Do not only fix visible bugs. Assume this application is going to production with 100,000+ users. Check every layer listed below.

1. Authentication

This is where many AI-generated apps fail.

User registration
Login
Logout
Session persistence
Session expiration
Password reset
Email verification
Anonymous users
Google login
Apple login (if needed)
Multi-device login
Same data visible on every device
Multiple browser support
Refresh page doesn't logout
Token refresh
Invalid token handling
Deleted account handling

Verify:

no duplicate accounts
no duplicate user IDs
every document belongs to correct UID
2. Database Integrity

This is probably where your current problems are.

Check

Every write operation
Every update operation
Every delete operation
Every read operation

Verify

Data actually reaches Firebase
Data survives refresh
Data survives logout
Data survives login on another device
No race conditions
No duplicate documents
No orphan documents
Correct timestamps
Server timestamps
Proper indexing
Proper document IDs
Proper document structure
3. Firestore Rules

Most AI apps have terrible security rules.

Verify

User cannot read another user's data
User cannot edit another user's data
User cannot delete another user's data
User cannot change UID
User cannot access admin collections
Proper validation
Required fields enforced
Field type validation
4. Storage

If images/files exist

Check

Upload
Delete
Replace
Compression
File limits
File types
Unauthorized access
Broken URLs
Storage rules
5. State Management

AI-generated apps often fail here.

Verify

Refresh page
Browser back
Browser forward
Opening new tab
Closing tab
Mobile browser
Desktop browser
Multiple tabs

Data should never disappear unexpectedly.

6. CRUD Audit

For every entity.

Example Journal

Create

Read

Update

Delete

Verify every field.

No partial updates.

No missing values.

7. Form Validation

Every form should validate

Required fields

Character limits

Whitespace

Special characters

Empty strings

SQL injection style inputs

HTML inputs

Emoji

Very long text

Duplicate submission

Double clicking button

Offline submission

8. Error Handling

Every API call

Success

Loading

Failure

Timeout

Offline

Permission denied

Unknown error

Retry

User-friendly messages

No crashes

9. Network Failures

Simulate

Slow internet

No internet

Reconnect

Firebase unavailable

API timeout

Browser refresh during request

Duplicate request

Cancelled request

10. Synchronization

This is your current issue.

Verify

Device A writes

↓

Device B instantly sees update

↓

Device C sees update

↓

Refresh

↓

Still correct

↓

Logout

↓

Login

↓

Still correct

↓

Open new browser

↓

Still correct

11. Real-time Updates

If using Firestore listeners

Verify

Live updates

No duplicate listeners

Listeners cleaned up

No memory leaks

No stale cache

12. Offline Behavior

What happens when

Internet lost

Internet returns

User edits offline

Conflict resolution

Queued writes

13. Performance

Measure

Page load

First paint

Largest Contentful Paint (LCP)

Interaction to Next Paint (INP)

Firestore reads

Firestore writes

Bundle size

Lazy loading

Image optimization

Caching

14. Mobile Responsiveness

Every screen

Small phone

Large phone

Tablet

Desktop

Landscape

Portrait

Safe areas

Keyboard overlap

Touch targets

15. Accessibility

Keyboard navigation

Tab order

Screen reader labels

Contrast

Focus states

ARIA labels

Buttons

Forms

16. Security

Check

XSS

CSRF

Open redirects

Sensitive data exposure

API keys

Firebase config

Environment variables

Admin credentials

Console logs

Debug information

Secrets

17. User Experience

Loading states

Skeleton loaders

Empty states

Error states

Success states

Confirmation dialogs

Delete confirmation

Autosave

Unsaved changes warning

18. Browser Compatibility

Chrome

Safari

Firefox

Edge

Mobile Chrome

Mobile Safari

Private browsing

Incognito

19. Logging

Track

Errors

Firebase failures

Authentication failures

Crash logs

Unhandled promises

Network failures

20. Analytics

Track

Sign up

Login

Journal created

Journal deleted

Session length

Retention

Daily users

21. Notifications

Success

Failure

Warning

Validation

Offline

Sync complete

22. Firebase Best Practices

Check

Indexes

Composite indexes

Server timestamps

Transactions

Batch writes

Atomic updates

Pagination

Security rules

Storage rules

Authentication rules

Firestore quotas

Read optimization

Write optimization

23. Edge Cases

User deletes account

Account disabled

Expired session

Duplicate clicks

Very fast typing

Two devices editing same journal

Deleted document while editing

Browser refresh during save

User closes tab while saving

Network disconnect while saving

24. Data Consistency

Verify

One source of truth

No local-only data

No stale cache

No duplicated state

No inconsistent timestamps

Every user sees exactly their own latest data

25. Code Quality

Remove

Unused components

Dead code

Duplicate code

Console logs

TODO comments

Unused Firebase queries

Unused packages

Memory leaks

Infinite re-renders

Unused listeners

26. Production Deployment

Check

Environment variables

Firebase production project

Error boundaries

404 page

500 page

Robots.txt

Sitemap

SEO metadata

Favicon

Manifest

PWA support (if applicable)

27. Automated Testing

Create tests for

Authentication

Journal CRUD

Firestore writes

Firestore reads

Security rules

Navigation

Forms

Validation

Multi-device synchronization

Offline behavior

28. Final Production Audit

Before considering the application production-ready, verify that:

Every feature works on desktop and mobile.
Data remains consistent across multiple devices and browsers.
Firestore security rules prevent unauthorized access.
No data loss occurs during refresh, logout, or reconnect.
All loading, empty, success, and error states are handled.
The application performs well on slow networks and low-end devices.
No console errors, warnings, or unhandled promise rejections remain.
All Firebase reads and writes are optimized to minimize cost.
The application is resilient to unexpected failures and edge cases.
The codebase is clean, maintainable, and free of dead code or memory leaks.
One improvement to your prompt

Instead of asking Antigravity to "fix bugs," ask it to act as a senior full-stack engineer performing a production readiness audit. Require it to:

Identify every issue it finds.
Explain the root cause.
Fix the issue.
Verify the fix with an explicit test.
Continue auditing until no high- or medium-severity issues remain.
Produce a final report listing all issues found, how they were resolved, and any remaining risks.

That approach tends to uncover far more problems than a simple "fix what's broken" prompt because it shifts the goal from repairing obvious defects to systematically validating the entire application.