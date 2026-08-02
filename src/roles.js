// 👇 After creating your 3 accounts in Firebase Authentication, replace these
// with the exact email addresses you used. This is how the app knows whether
// a logged-in person is Mom, Dad, or Amelie.
export const ROLE_BY_EMAIL = {
  "a.gianella.burger@gmail.com": "mom",
  "remy.burger@gmail.com": "dad",
  "me@amelieburger.com": "amelie",
};

export const ROLE_LABELS = {
  mom: "Mom",
  dad: "Dad",
  amelie: "Amelie",
};

export function getRoleForEmail(email) {
  if (!email) return null;
  return ROLE_BY_EMAIL[email.toLowerCase()] || null;
}
