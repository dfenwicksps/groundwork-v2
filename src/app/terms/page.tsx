import type { Metadata } from "next";
import Link from "next/link";
import LegalPage, { Section, Plainly } from "@/components/legal/LegalPage";
import { OPERATOR, MIN_AGE } from "@/lib/legal";

export const metadata: Metadata = {
  title: "Terms — Groundwork",
  description:
    "The deal between you and Groundwork: what you can expect from us, and what we ask of you.",
};

export default function TermsPage() {
  return (
    <LegalPage
      title="The deal"
      intro="These are the terms of using Groundwork. Same rule as the privacy policy — if we couldn't say it plainly, we didn't say it."
    >
      <Section heading="What Groundwork is">
        <Plainly>
          A self-guided programme, not a service with a person on the other end.
        </Plainly>
        <p>
          Groundwork gives you missions, a ten-week program, reflection prompts,
          and a strengths assessment. It does not give you a counsellor, a mentor,
          or a professional of any kind. Nothing in the app is medical,
          psychological, or legal advice, and none of it is monitored in real time.
        </p>
        <p>
          The strengths assessment is a self-reflection tool built on the VIA
          character strengths framework. It is not a clinical or diagnostic
          instrument, and its results are not a verdict on who you are.
        </p>
        <p>
          <strong>It is not a crisis service.</strong> If you are in danger or
          thinking about hurting yourself, call 000, or call Kids Helpline on{" "}
          <a href="tel:1800551800" className="text-teal underline">1800 55 1800</a>
          {" "}— free, 24/7, confidential. Please don&apos;t use a journal entry to
          ask for help that a person needs to give you.
        </p>
      </Section>

      <Section heading="Who can use it">
        <p>
          You need to be at least {MIN_AGE}. If you are under 18, the age and
          parental-awareness rules in our{" "}
          <Link href="/privacy" className="text-teal underline">privacy policy</Link>{" "}
          are part of these terms too.
        </p>
        <p>
          One account per person, and it&apos;s yours — don&apos;t share your
          password, and tell us if you think someone else has got into your account.
        </p>
      </Section>

      <Section heading="What we ask of you">
        <Plainly>Be honest in your own journal; don&apos;t use the app to harm anyone.</Plainly>
        <ul className="list-disc pl-5">
          <li>Don&apos;t use Groundwork to threaten, harass, or endanger anyone.</li>
          <li>
            Don&apos;t put other people&apos;s private information into it. Your
            support circle is names and relationships only, and that&apos;s
            deliberate.
          </li>
          <li>
            Don&apos;t try to break, scrape, or overload the app, or get at other
            people&apos;s accounts.
          </li>
        </ul>
        <p>
          If someone is using Groundwork in a way that puts a person at real risk,
          we may suspend that account. We would rather talk to you first, and we
          will where we can.
        </p>
      </Section>

      <Section heading="What you write stays yours">
        <p>
          You own everything you write. We do not claim it, publish it, or use it
          to make anything else. We hold a licence to store and display it back to
          you — that is the whole extent of it, and it ends when you delete your
          account.
        </p>
      </Section>

      <Section heading="What we can and can't promise">
        <p>
          We will do our honest best to keep Groundwork running and your writing
          safe. We can&apos;t promise the app will never be down, never lose data,
          or never have a bug — nobody can, and we&apos;re not going to write a
          paragraph pretending otherwise.
        </p>
        <p>
          What we can promise is that we will tell you when something goes wrong
          rather than hoping you don&apos;t notice.
        </p>
        <p className="text-sm text-ink-muted">
          To the extent the law allows, Groundwork is provided &ldquo;as is&rdquo;,
          and our liability is limited to the amount you have paid us — which, at
          the moment, is nothing. None of this limits rights you have under
          consumer law that cannot be excluded.
        </p>
      </Section>

      <Section heading="Ending it">
        <p>
          You can delete your account whenever you like, from{" "}
          <Link href="/settings" className="text-teal underline">Settings</Link>. No
          exit survey, no &ldquo;are you sure&rdquo; three times over.
        </p>
      </Section>

      <Section heading="Changes and the boring bits">
        <p>
          If we change these terms in a way that matters, we will tell you in the
          app before it takes effect. These terms are governed by the law of{" "}
          {OPERATOR.jurisdiction}.
        </p>
        <p>
          Questions about any of this go to{" "}
          <a href={`mailto:${OPERATOR.contactEmail}`} className="text-teal underline">
            {OPERATOR.contactEmail}
          </a>.
        </p>
      </Section>
    </LegalPage>
  );
}
