# Groundwork v3: getting the first working version live

**For David. Written 13 Nov 2026.** These are the steps only you can do: the agent never creates the projects or holds their keys. v2 (the `main` branch, its Vercel project and its Supabase project) is not touched by any of this.

About 30 minutes. Do the parts in order. Menu names in Supabase and Vercel change from time to time, so a label may differ slightly from what's written here.

## What you get

A working app on its own address, with its own empty database:

- **Students** sign in, join a class with a code, and use the app. The **Grow** tab is the new map: Identity, Connection, Purpose and Meaning over the seven levels, with every mission step and week inside. Everything they write saves as it does in v2.
- **Teachers** see their classes, each class's code, the names of students who have joined, and whole-class patterns. They never see what a student wrote.
- **A school admin** invites teachers by email and creates classes.
- **You, as platform admin,** add schools and invite each school's first admin.

What it doesn't have yet is listed at the end.

## Part 1: the Supabase project (the database)

1. At [supabase.com/dashboard](https://supabase.com/dashboard), choose **New project**. Name it `groundwork-v3`. Region: **Sydney** (`ap-southeast-2`). Save the database password in your password manager.
2. Apply the schema. Either:
   - **From GitHub (what D47 planned):** Project Settings → Integrations → GitHub. Connect `dfenwicksps/groundwork-v2`. Set the **working directory** to `supabase/v3`, the **production branch** to `v3`, and turn on **Deploy to production**. The next push to `v3` applies the migrations. If this needs a plan you don't have, use the other way.
   - **By hand:** open the SQL Editor and run the two files in `supabase/v3/supabase/migrations/`, oldest first (`20261112000000_v3_initial.sql`, then `20261113000000_v3_invites_and_join_limit.sql`). Paste each whole file and press Run.
3. Check it worked: Table Editor should list 33 tables, each marked as having row security on.
4. Authentication → URL Configuration: leave this page open. You fill it in at Part 3.

## Part 2: the Vercel project (the website)

1. At [vercel.com/new](https://vercel.com/new), import `dfenwicksps/groundwork-v2` **again**. It's fine to have two Vercel projects on one repository. Name this one `groundwork-v3`.
2. Before the first deploy, add these Environment Variables (Supabase values are under Project Settings → API in the **v3** Supabase project):

   | Name | Value |
   | --- | --- |
   | `NEXT_PUBLIC_SUPABASE_URL` | the v3 project's URL |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | the v3 project's `anon` key |
   | `SUPABASE_SERVICE_ROLE_KEY` | the v3 project's `service_role` key. Only "delete my account" uses it. Keep it out of anything named `NEXT_PUBLIC_`. |
   | `ANTHROPIC_API_KEY` | optional. Leave it out and the AI follow-up questions simply don't appear. |

3. Deploy. Then Settings → Environments → Production → **Branch Tracking**: set the production branch to `v3`. Redeploy from the `v3` branch if the first build used `main`.
4. Note the address Vercel gives you, for example `https://groundwork-v3.vercel.app`.

Your existing v2 Vercel project will also build a preview whenever `v3` is pushed. That preview points at v2's database and won't work properly. Ignore it, or switch off previews for `v3` in that project's Git settings.

## Part 3: tell Supabase where the site is

In the v3 Supabase project, Authentication → URL Configuration:

- **Site URL:** your Vercel address.
- **Redirect URLs:** add `https://YOUR-ADDRESS/auth/callback`.

Sign-in with **email and password** and **emailed links** now works. Two things to know:

- Supabase's built-in email sender allows only a few emails an hour and is meant for testing. Before a class uses it, connect a proper email service (Authentication → Emails → SMTP), or use Google or Microsoft sign-in.
- **Google:** Authentication → Providers → Google. You can reuse v2's Google client: in Google Cloud Console add the v3 project's callback address (shown on that Supabase page) to the client's authorised redirect URIs.
- **Microsoft:** needs an app registration in Azure (Entra ID) first. Once it's set up under Providers → Azure, add `NEXT_PUBLIC_MICROSOFT_SIGN_IN` = `1` in Vercel and redeploy; the button then appears.

## Part 4: make yourself the platform admin

Nobody can be made platform admin from the app. That's deliberate (rule V-A8).

1. Open your Vercel address and sign up with your own email. Confirm it from the email.
2. In the v3 Supabase project, SQL Editor, run this with your email in place of the capitals:

   ```sql
   insert into public.platform_admins (user_id)
   select id from auth.users where email = 'YOUR EMAIL HERE';
   ```

3. Go to `https://YOUR-ADDRESS/platform`.

## Part 5: set up a school and a class

1. On **Platform**, add your school. Under it, invite your own email. That makes you its school admin.
2. Reload, then open **School**. Create a class, with yourself as the teacher.
3. Open **My classes**. The class's six-character code is there.
4. To see it as a student, use a different browser (or a private window) and sign up with a **different email address**. Choose **Grow**, then **Join your class**, and type the code.
5. To invite another teacher: **School** → invite their school email. Groundwork doesn't send the invitation; tell them to sign in with that address. They become staff the first time they do, as long as they've confirmed the address.

## What this first version doesn't have

- **The selves' own pages, the self-check and lesson mode.** Those are Phase 2. The map shows each self's name and one line only.
- **The eight new activities.** They're drafts waiting for your approval and aren't in the app.
- **Stories.** v2's eight mission stories aren't in the v3 database yet, so story screens are empty.
- **Class patterns will mostly show a dash** until at least five students have joined and a day has passed.
- **Privacy and terms pages** still describe v2. They need rewriting for the teacher layer before any real class joins.
- **School settings, sharing an entry with a teacher, and leaving a class from Settings** aren't on a screen yet, though the database supports them.

## What hasn't been checked

The database rules are tested (116 tests, on an in-memory database and on a real Supabase database in CI), and the app builds. **The new screens have not been opened in a browser**, because that needs a Supabase project and the agent doesn't have one. Expect small faults on first use and report what you see.
