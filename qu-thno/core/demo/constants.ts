// Not httpOnly on purpose — this only ever holds the free-text national ID
// the visitor typed into the mock Nafath screen (never anything sensitive
// or real), and the header needs to read it client-side to decide whether
// to show the avatar menu or the "تسجيل الدخول" button.
export const DEMO_USER_COOKIE = "demo_user_id"
