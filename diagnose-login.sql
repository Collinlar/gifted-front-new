-- Why can this account not sign in?
--
-- The public.users side already checked out: the row exists, auth_id matches,
-- the email is confirmed and clean. This looks at the auth side, where the
-- things that silently block a sign-in actually live.
--
-- Read it like this:
--   banned_until NOT NULL      -> the account is banned, sign-in refused
--   deleted_at   NOT NULL      -> soft deleted, sign-in refused, row still joins
--   last_sign_in_at IS NULL    -> has NEVER signed in, not even the automatic
--                                 one at the end of signup. Points at something
--                                 systemic rather than a forgotten password.
--   last_sign_in_at NOT NULL   -> sign-in has worked before, so the account is
--                                 fine and the problem is the credential or the
--                                 client code after authentication.

SELECT
  email,
  created_at,
  email_confirmed_at,
  last_sign_in_at,
  banned_until,
  deleted_at,
  is_sso_user,
  raw_app_meta_data ->> 'provider'  AS provider,
  raw_app_meta_data ->> 'providers' AS providers,
  aud,
  role
FROM auth.users
WHERE email = 'calculus.yoa@gmail.com';


-- Widen it: are new signups as a group in a different state from claimed ones?
-- If every recent signup has last_sign_in_at NULL while claimed accounts have a
-- value, that is the pattern, not one unlucky user.

SELECT
  CASE WHEN u.mongo_id IS NOT NULL THEN 'migrated' ELSE 'new signup' END AS kind,
  count(*)                                            AS accounts,
  count(a.last_sign_in_at)                            AS have_signed_in,
  count(*) - count(a.last_sign_in_at)                 AS never_signed_in,
  count(a.banned_until)                               AS banned,
  count(a.deleted_at)                                 AS soft_deleted
FROM users u
LEFT JOIN auth.users a ON a.id = u.id
WHERE u.created_at > now() - interval '60 days'
GROUP BY 1;
