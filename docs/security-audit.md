# Security audit and hardening

## What is protected

- Public content is read-only for anonymous visitors.
- Editing content, media, news and storage objects is allowed only for users listed in `public.admin_users`.
- A Supabase Auth login alone is not enough to edit the site.
- Uploaded files are limited in the admin UI by type and size.
- Public rendering escapes text from the CMS and rejects unsafe media URLs.
- Render serves security headers, including CSP, HSTS, Referrer-Policy and Permissions-Policy.
- Backend only allows `GET` and `OPTIONS` and returns JSON with security headers.

## Required admin bootstrap

After applying `supabase/migrations/20260713200000_harden_admin_access.sql`, add your real Supabase Auth user to the admin list:

```sql
insert into public.admin_users (user_id, email)
select id, email
from auth.users
where email = 'YOUR_ADMIN_EMAIL@example.com'
on conflict (user_id) do update set email = excluded.email;
```

Run this in Supabase SQL Editor as the project owner. Replace the email with the exact email used for `/admin.html`.

To see current admins:

```sql
select user_id, email, created_at
from public.admin_users
order by created_at;
```

To remove access:

```sql
delete from public.admin_users
where email = 'OLD_ADMIN_EMAIL@example.com';
```

## Supabase dashboard settings to verify

- Authentication signups should be disabled unless you intentionally need new accounts.
- Every admin account should use a strong unique password.
- Enable MFA for admin users if available on the Supabase plan.
- Never expose `service_role` keys in frontend code, GitHub or Render frontend env.
- Keep only the anon public key in `frontend/src/site-config.ts`.
- Rotate leaked credentials immediately in Supabase Dashboard.

## Storage policy

The `parish-media` bucket remains public for reading because the public site must display photos and files. Upload, update and delete actions are restricted by RLS to `public.admin_users`.

## Remaining operational risks

- If an admin email/password is compromised, the attacker can edit site content. Use MFA and remove old admin users.
- GitHub and Render accounts must also be protected with MFA.
- Review uploaded documents before publishing, especially PDFs received from third parties.
