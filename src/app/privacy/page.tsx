import type { Metadata } from "next";
import Link from "next/link";
import LegalPage, { Section, Plainly } from "@/components/legal/LegalPage";
import { OPERATOR, MIN_AGE, PARENTAL_AWARENESS_AGE } from "@/lib/legal";

export const metadata: Metadata = {
  title: "Privacy — Groundwork",
  description:
    "What Groundwork collects, what it never does with it, and how to get your data back or delete it.",
};

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Your privacy, in plain English"
      intro="This is the real policy — not a summary of one. We wrote it so you can actually read it in a few minutes and know exactly where you stand."
    >
      <Section heading="Who we are">
        <p>
          {OPERATOR.name} is run from {OPERATOR.jurisdiction}. If anything here is
          unclear, or you want something changed or deleted, email{" "}
          <a href={`mailto:${OPERATOR.contactEmail}`} className="text-teal underline">
            {OPERATOR.contactEmail}
          </a>{" "}
          and a person will read it.
        </p>
      </Section>

      <Section heading="What we collect">
        <Plainly>
          Your email, the name you choose, where you&apos;re at (your school year, or
          whether you&apos;ve left school), and the things you
          write and choose in the app. Nothing else.
        </Plainly>
        <ul className="list-disc pl-5">
          <li>
            <strong>Your email address and password.</strong> The password is
            hashed by our sign-in provider — we never see it, and we can&apos;t
            recover it for you.
          </li>
          <li>
            <strong>The name you give us.</strong> It can be a nickname. It only
            has to be the thing you want to be called.
          </li>
          <li>
            <strong>Where you&apos;re at.</strong> Year 7&ndash;9, 10&ndash;11 or 12, or
            whether you&apos;ve left school recently or a few years ago. It&apos;s saved
            with your account so it follows you between devices, and in a cookie on
            your device. It only changes what the app shows you first and which
            examples you see.
          </li>
          <li>
            <strong>What you write and choose.</strong> Mission reflections and
            journal entries, your strengths results, the values you pick, goals,
            habits and practice notes, your Standard check-ins, your answers to
            the nine-question check-in if you do it, and how far through the
            missions and the ten-week program you are.
          </li>
          <li>
            <strong>Your support circle.</strong> If you add a trusted person, we
            store the name and relationship you typed. That is all — we never ask
            for their contact details, and we never contact them.
          </li>
        </ul>
        <p>
          We do not ask for your date of birth, your school, your address, your
          phone number, or your location. We do not run advertising or analytics
          trackers, and there is no ad network anywhere in this app.
        </p>
      </Section>

      <Section heading="Where your writing goes">
        <Plainly>
          Stored for you and shown only to you — with one exception, described
          here, which you can switch off.
        </Plainly>
        <p>
          Your writing is stored in our database (hosted by Supabase) and is
          visible only to your own signed-in account. It is never shown to other
          users, never scored or ranked against anyone, never compared, and never
          sold. Your strengths results are yours too — they are not a test you can
          pass or fail, and nobody else sees them.
        </p>
        <p>
          <strong>The one exception is the follow-up questions.</strong> When you
          finish a reflection, the app can offer three questions to sit with. To
          write those, the first part of what you wrote is sent to Anthropic&apos;s
          API, which generates the questions and sends them back. Anthropic does
          not use API content to train its models. If you would rather that never
          happened, turn the follow-up questions off in{" "}
          <Link href="/settings" className="text-teal underline">Settings</Link>{" "}
          and nothing you write will leave our database.
        </p>
        <p>
          <strong>If something you write sounds like you might be at risk</strong>,
          for example thoughts of suicide or self-harm, or not feeling safe at
          home, the app shows you a list of free support services instead of the
          usual questions. There are two ways it notices. When follow-up
          questions are on, the same request that writes them can say so
          instead. And whether or not they&apos;re on, the app checks what you
          saved for a few specific phrases, on your own device, without sending
          anything anywhere. Neither check is saved, flagged or seen by anyone:
          it only changes what appears on your screen.
        </p>
        <p>
          <strong>The nine-question check-in</strong> is optional. If you answer
          it, your answers are stored like everything else and shown back to you
          next to your later ones. They may also be counted in totals, combined
          with everyone else&apos;s and with names removed, to find out whether
          Groundwork actually helps. Nobody looks at one person&apos;s answers.
        </p>
        <p>
          No staff member reads your journal for interest or for research. We
          access individual entries only if you ask us to — for example, to help
          recover something — or if we are legally required to.
        </p>
      </Section>

      <Section heading="How old you have to be">
        <Plainly>
          {MIN_AGE}+ to have an account. Under {PARENTAL_AWARENESS_AGE}, a parent
          or carer should know you&apos;re using it.
        </Plainly>
        <p>
          You need to be at least {MIN_AGE} to make a Groundwork account. If you
          are under {MIN_AGE} and you have made one, email us and we will delete it.
        </p>
        <p>
          If you are under {PARENTAL_AWARENESS_AGE}, we ask that a parent or carer
          knows you have an account. We don&apos;t currently verify this, and
          we&apos;re not going to pretend we do — but it matters, and here is why
          we ask rather than block: Groundwork is about honest reflection, and an
          account a young person is hiding is not a good place to be honest.
        </p>
        <p>
          A parent or carer can email us to ask what we hold about their
          child&apos;s account and to have it deleted. We verify the request before
          acting on it, and where the young person is old enough to speak for
          themselves we involve them rather than going around them.
        </p>
        <p>
          If you are in the UK or the EU, the law there treats consent for people
          under 16 as something a parent or guardian gives. If that is you, please
          have that conversation before signing up.
        </p>
      </Section>

      <Section heading="If you're using this through a school">
        <p>
          Groundwork accounts belong to the student, not to the school. If your
          teacher pointed you here, they still cannot see your journal, your
          strengths results, or your Standard check-ins — there is no teacher view
          and no class dashboard in this app. If that ever changes, we will tell
          you before it does, not after.
        </p>
      </Section>

      <Section heading="Who else can see it">
        <Plainly>Nobody, apart from the services that run the app.</Plainly>
        <p>
          We use a small number of providers to make Groundwork work at all:
          Supabase (database and sign-in), Vercel (hosting), and Anthropic (the
          follow-up questions described above). They process data on our
          instructions and cannot use it for their own purposes.
        </p>
        <p>
          We do not sell your data. We do not share it with your school, your
          parents, or anyone else — with one exception: if we genuinely believe
          someone is at immediate risk of serious harm, we may pass on what we
          have to emergency services. That is a rare, serious step, not a routine
          one, and we are telling you about it up front rather than burying it.
        </p>
      </Section>

      <Section heading="Getting your stuff back, or deleting it">
        <Plainly>Ask, and we&apos;ll send you everything or delete everything.</Plainly>
        <p>
          You can delete your account from{" "}
          <Link href="/settings" className="text-teal underline">Settings</Link> at
          any time. Deleting removes your reflections, progress, strengths results,
          goals, check-ins and support circle. Backups roll off within 30 days.
        </p>
        <p>
          You can also ask us for a copy of everything we hold about you, ask us to
          correct something, or ask us to stop using it. Email{" "}
          <a href={`mailto:${OPERATOR.contactEmail}`} className="text-teal underline">
            {OPERATOR.contactEmail}
          </a>{" "}
          and we&apos;ll get back to you within 30 days.
        </p>
      </Section>

      <Section heading="How long we keep it">
        <p>
          While your account exists, so does what you wrote — that is rather the
          point, since Groundwork asks you to revisit old reflections and see what
          changed. If you stop using the account entirely, we delete it after two
          years of no sign-ins, and we email you before we do.
        </p>
      </Section>

      <Section heading="If this policy changes">
        <p>
          If we change something that matters — what we collect, or who it goes to
          — we will tell you in the app before it takes effect, not quietly swap
          the page.
        </p>
      </Section>

      <Section heading="One more thing">
        <p className="text-ink-muted">
          Groundwork is not therapy and not a crisis service. If something feels
          too heavy to carry alone, talk to someone you trust, or call Kids
          Helpline on{" "}
          <a href="tel:1800551800" className="text-teal underline">1800 55 1800</a>{" "}
          — free, 24/7, and they will not tell anyone you called.
        </p>
      </Section>
    </LegalPage>
  );
}
