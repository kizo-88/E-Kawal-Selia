export type NotificationChannel = "inapp" | "email" | "sms";

// In-app is mandatory (GP-16): a user can never be left with no record of a
// notice. Email/sms are optional and resolved per user/role preference in
// bus.ts. (The "in-app always" rule is encoded there, not as a hard-coded
// option list, so it never trips the no-hardcoded-lists rule.)
