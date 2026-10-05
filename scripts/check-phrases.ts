// Checks the two on-device checks against phrases they must and mustn't match:
// the risk check (lib/help.ts) and the hard-on-yourself check (lib/hardOnSelf.ts).
//
//   npm run check:phrases
//
// Add a case here with every change to either list, including a "mustn't" for
// whatever everyday sentence the new pattern could catch by accident. A card
// that appears for everything stops being read; a missed phrase costs more.
// See docs/content-review/phrase-lists.md.

import { mentionsCrisis } from "../src/lib/help";
import { soundsHardOnSelf } from "../src/lib/hardOnSelf";

const RISK_MUST = [
  "I've been thinking about suicide",
  "sometimes I want to kill myself",
  "I just want to end it all",
  "I want to die",
  "I don't want to be here anymore",
  "everyone would be better off without me",
  "I've started self harming again",
  "I think about hurting myself",
  "I don't feel safe at home",
  "my stepdad hits me",
  "honestly I'm gonna kms",
  "I want to unalive myself",
  "thinking about unaliving",
  "sewerslide has crossed my mind",
  "people at school keep telling me to kys",
  "I want to end myself",
  "I thought about taking my own life",
  "I wish I was dead",
  "I wish I wasn't alive",
  "I don't want to wake up tomorrow",
];

const RISK_MUSTNT = [
  "I ran 5 kms before school",
  "we did a few kms on the bikes",
  "I hurt myself at footy",
  "it hit me that I'd changed",
  "this exam is killing me",
  "I was dying of laughter",
  "the end of it all was a relief",
  "my phone died on the bus",
  "I'm dead tired after training",
  "I overdosed on coffee before the exam",
  "the deadline is Friday",
];

const HARSH_MUST = [
  "I'm so useless at everything",
  "I hate myself",
  "nobody cares about me",
  "I'm such a loser",
  "I'm trash",
  "I'm a waste of space",
  "I can't do anything right",
];

const HARSH_MUSTNT = [
  "I'm tired today",
  "my room is a mess",
  "that movie was trash",
  "I used to think I was useless but I'm not",
];

let failed = 0;
function check(label: string, cases: string[], test: (t: string) => boolean, expected: boolean) {
  for (const c of cases) {
    if (test(c) !== expected) {
      failed++;
      console.log(`FAIL  ${label}: "${c}" should ${expected ? "" : "not "}match`);
    }
  }
}

check("risk", RISK_MUST, mentionsCrisis, true);
check("risk", RISK_MUSTNT, mentionsCrisis, false);
check("hard on self", HARSH_MUST, soundsHardOnSelf, true);
check("hard on self", HARSH_MUSTNT, soundsHardOnSelf, false);

const total = RISK_MUST.length + RISK_MUSTNT.length + HARSH_MUST.length + HARSH_MUSTNT.length;
console.log(failed ? `\n${failed} of ${total} cases failed.` : `All ${total} cases pass.`);
process.exit(failed ? 1 : 0);
