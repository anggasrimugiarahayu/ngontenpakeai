export const SUPER_ADMIN_EMAILS: string[] = [
  "anggasrimugiarahayu@gmail.com",
];

export function isAdminEmail(email?: string | null): boolean {
  if (!email || typeof email !== "string") return false;
  const clean = email.trim().toLowerCase();
  if (SUPER_ADMIN_EMAILS.includes(clean)) return true;
  const envAdmin = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  if (envAdmin && clean === envAdmin) return true;
  return false;
}

export function isAdminUser(
  user?: { role?: string | null; email?: string | null } | null
): boolean {
  if (!user) return false;
  if (user.role === "ADMIN") return true;
  return isAdminEmail(user.email);
}

export function assertAdminUser(
  user?: { role?: string | null; email?: string | null } | null
): void {
  if (!isAdminUser(user)) {
    throw new Error(
      "Unauthorized: Akses ditolak. Hanya Administrator yang dapat melakukan tindakan ini."
    );
  }
}
