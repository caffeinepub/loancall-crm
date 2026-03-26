import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  ArrowRight,
  Bot,
  CheckCircle2,
  ChevronRight,
  Clock,
  Copy,
  Lightbulb,
  MessageSquare,
  Pause,
  Play,
  RefreshCw,
  RotateCcw,
  Search,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

// ─── Call Scripts ────────────────────────────────────────────────────────────
type ScriptSection = { label: string; content: string };
type Script = { stage: string; sections: ScriptSection[] };

const CALL_SCRIPTS: Record<string, Script> = {
  new: {
    stage: "New Lead",
    sections: [
      {
        label: "Opener",
        content: `Hi, is this [Name]? Great — this is [Your Name] from [Company]. I'm reaching out because you expressed interest in a personal loan recently. Did I catch you at a decent time?\n\nIf now isn't great: "No worries at all — when's a better time I can reach you?"`,
      },
      {
        label: "Key Questions",
        content: `• "What's prompting you to look at a loan right now?"\n• "Roughly how much were you thinking of borrowing?"\n• "Is this for a specific purchase, consolidating debt, or something else?"\n• "Have you looked at other lenders, or are you just starting your search?"`,
      },
      {
        label: "Value Pitch",
        content: `"What I can offer you is a straightforward process — we can get you a decision quickly, sometimes same day. We work with a range of credit profiles, and our rates are competitive. There's no obligation to apply, so it literally costs you nothing to see what you qualify for."`,
      },
      {
        label: "Next Steps",
        content: `"If you're open to it, I can take a few quick details — takes about 5 minutes — and we can get a pre-qualification number in front of you today. Does that sound fair?"`,
      },
    ],
  },
  contacted: {
    stage: "Contacted",
    sections: [
      {
        label: "Opener",
        content: `"Hi [Name], it's [Your Name] from [Company] — we spoke briefly last [day/week]. I wanted to follow up and see if you'd had a chance to think things over. How are you doing?"`,
      },
      {
        label: "Key Questions",
        content: `• "Did you have any questions come up since we last talked?"\n• "Have your financing needs changed at all?"\n• "Is there anything that's holding you back from moving forward?"\n• "What would make this an easy yes for you?"`,
      },
      {
        label: "Value Pitch",
        content: `"I don't want to pressure you — but I do want to make sure you don't miss out. Rates can shift, and locking something in sooner tends to work in your favor. We've helped people in similar situations and the process is genuinely painless."`,
      },
      {
        label: "Next Steps",
        content: `"Can we set aside 10 minutes this week to go over the numbers? I'll come prepared with options that fit your situation specifically."`,
      },
    ],
  },
  qualified: {
    stage: "Qualified",
    sections: [
      {
        label: "Opener",
        content: `"Hi [Name], [Your Name] here. Good news — based on what you shared with me, you look like a strong candidate for our loan program. I wanted to walk you through what that actually means for you."`,
      },
      {
        label: "Key Questions",
        content: `• "Are you still targeting [loan amount] or has that changed?"\n• "How quickly are you looking to access the funds?"\n• "Do you have any flexibility on the repayment term?"\n• "Is there a monthly payment range that works best for your budget?"`,
      },
      {
        label: "Value Pitch",
        content: `"Based on your profile, we're looking at a rate around [X%] with monthly payments of roughly [amount]. That puts you in a very manageable position. Most clients at this stage are approved and funded within [X] business days."`,
      },
      {
        label: "Next Steps",
        content: `"The next step is a quick application — it's a soft pull so it won't affect your credit. I can walk you through it right now or send you a secure link. Which is easier for you?"`,
      },
    ],
  },
  application: {
    stage: "Application",
    sections: [
      {
        label: "Opener",
        content: `"Hi [Name], it's [Your Name]. I'm following up on your application — we have everything we need and it's currently under review. I wanted to make sure you're in the loop and answer any questions."`,
      },
      {
        label: "Key Questions",
        content: `• "Any questions about the application you submitted?"\n• "Is the bank account on file still the one you'd like funds deposited to?"\n• "Are there any changes to your income or employment since you applied?"\n• "Is there anything time-sensitive you need the funds for?"`,
      },
      {
        label: "Value Pitch",
        content: `"You're in a great position — you've done the hard part. We're in the home stretch. Our underwriting team is thorough but efficient. Once approved, funds typically hit within 1–2 business days."`,
      },
      {
        label: "Next Steps",
        content: `"I'll be in touch the moment we have a decision. If anything else comes up on our end, I'll contact you right away. Is the best number to reach you still [phone]?"`,
      },
    ],
  },
  approval: {
    stage: "Approval",
    sections: [
      {
        label: "Opener",
        content: `"[Name]! Great news — you've been approved! Congratulations. I wanted to personally call you to share the good news and walk you through next steps."`,
      },
      {
        label: "Key Questions",
        content: `• "Do you have any questions about the approval terms?"\n• "Would you like to review the loan agreement together?"\n• "Is the disbursement account still the same?"\n• "Is there anything that might delay you from signing the documents?"`,
      },
      {
        label: "Value Pitch",
        content: `"Your approved amount is [amount] at [rate]% — that's a monthly payment of [amount] over [term]. You're locking in a great rate, and once you sign, we move to funding immediately."`,
      },
      {
        label: "Next Steps",
        content: `"I'm sending over the loan documents right now. All you need to do is review, sign electronically, and return them. The whole thing takes about 5 minutes. Can I stay on the line while you open the link?"`,
      },
    ],
  },
  funded: {
    stage: "Funded",
    sections: [
      {
        label: "Opener",
        content: `"Hi [Name], it's [Your Name]. I just wanted to reach out to confirm your funds have been disbursed and make sure everything went smoothly. How's everything looking?"`,
      },
      {
        label: "Key Questions",
        content: `• "Did the funds arrive as expected?"\n• "Is there anything about the process I can help clarify?"\n• "Do you have any upcoming financial needs we might be able to help with?"\n• "Do you know anyone who might benefit from a similar loan?"`,
      },
      {
        label: "Value Pitch",
        content: `"I'm glad we could help make this happen. Our clients often come back to us for future needs — refinancing, home improvement, or debt consolidation — because they already know how smooth the process is. We'd love to be your go-to lender."`,
      },
      {
        label: "Next Steps",
        content: `"If you ever need anything or know someone who's looking for a loan, please don't hesitate to call me directly. And if you have a moment, a Google review goes a long way for us — I can send the link if you're willing!"`,
      },
    ],
  },
};

// ─── Objections ───────────────────────────────────────────────────────────────
type Objection = {
  objection: string;
  response: string;
  tip: string;
  tag: string;
};

const OBJECTIONS: Objection[] = [
  {
    objection: "I need to think about it.",
    response:
      "Absolutely, that's smart. What specific part do you want to think through? Is it the rate, the monthly payment, or something else? I can help you think through it right now so you have all the information you need.",
    tip: "Identify the real concern hiding behind this — it's rarely the whole deal.",
    tag: "Delay",
  },
  {
    objection: "The rate is too high.",
    response:
      "I hear you — rate matters. Let me ask: what rate were you expecting, and where did that number come from? I want to make sure we're comparing apples to apples, because some quotes leave out fees that affect the true cost.",
    tip: "Anchor on APR and total cost of loan, not just the headline rate.",
    tag: "Rate",
  },
  {
    objection: "I need to talk to my spouse first.",
    response:
      "That makes total sense — big decisions are better made together. Can we schedule a call where all three of us can be on at the same time? That way I can answer both your questions at once.",
    tip: "Get a specific date and time for the follow-up call before hanging up.",
    tag: "Delay",
  },
  {
    objection: "I'm worried about my credit score.",
    response:
      "I appreciate your honesty. We work with a wide range of credit profiles — that's actually one of our specialties. A pre-qualification is a soft pull, so it won't affect your score at all. Let's just see what you qualify for.",
    tip: "Soft pull = no risk. Repeat this clearly to remove the fear.",
    tag: "Credit",
  },
  {
    objection: "I already have a lender I'm talking to.",
    response:
      "That's great — you should absolutely compare your options. Most clients who do end up choosing us because our terms tend to be more competitive and our process is faster. What offer are you looking at currently?",
    tip: "Don't badmouth competitors. Focus on differentiation and speed.",
    tag: "Competition",
  },
  {
    objection: "Now isn't the right time.",
    response:
      "I understand — timing is everything. Can I ask what would make the timing better? Sometimes people find that locking in now actually saves them money versus waiting, especially if rates shift. What's the main thing holding you back?",
    tip: "Create urgency around rate changes or life events, not pressure.",
    tag: "Timing",
  },
  {
    objection: "I don't want to go into more debt.",
    response:
      "That's a really healthy mindset, and I respect that. A lot of our clients actually use a loan to consolidate existing debt at a lower rate — which means they end up paying less per month, not more. Is that something that might apply to your situation?",
    tip: "Reframe debt as a tool for control, not a burden.",
    tag: "Mindset",
  },
  {
    objection: "I've been turned down before.",
    response:
      "I'm sorry to hear that — that can feel discouraging. Every lender uses different criteria, and a past denial doesn't determine what you qualify for today. Things change: income, credit, time on file. Let me take a fresh look with no strings attached.",
    tip: "Normalize past rejections and reframe this as a new opportunity.",
    tag: "Credit",
  },
  {
    objection: "Can you just email me the details?",
    response:
      "Of course — I'll send that right over. I want to make sure the info I send is actually relevant to your situation though. Can I get one or two quick details so I can personalize what I send you?",
    tip: "Use the email request as a way to gather more info and stay engaged.",
    tag: "Delay",
  },
  {
    objection: "What's the catch?",
    response:
      "No catch — I get why you'd ask that. There are no hidden fees, no prepayment penalties, and you can pay off early if you want. Everything is disclosed upfront in the loan agreement. Transparency is something we take seriously.",
    tip: "Be specific about what is NOT included — that builds trust faster.",
    tag: "Trust",
  },
];

// ─── Active Call ──────────────────────────────────────────────────────────────
const CALL_PHASES = [
  {
    label: "Opener",
    color: "bg-blue-100 text-blue-700",
    tips: [
      "Smile before you dial — your energy is audible.",
      "State your name, company, and reason for calling in 10 seconds.",
      "Ask if now is a good time — it signals respect.",
    ],
  },
  {
    label: "Discovery",
    color: "bg-yellow-100 text-yellow-700",
    tips: [
      "Listen 70%, talk 30% during this phase.",
      "Ask open-ended questions — avoid yes/no.",
      "Repeat back what you hear to show you understand.",
    ],
  },
  {
    label: "Pitch",
    color: "bg-orange-100 text-orange-700",
    tips: [
      "Tailor your pitch to the pain points uncovered in discovery.",
      "Lead with benefits, not features.",
      "Keep it under 90 seconds — then check for understanding.",
    ],
  },
  {
    label: "Handle Objections",
    color: "bg-red-100 text-red-700",
    tips: [
      "Acknowledge before you counter — never dismiss.",
      "Ask clarifying questions to uncover the real concern.",
      "Use stories: 'I had another client who felt the same way...'",
    ],
  },
  {
    label: "Close",
    color: "bg-purple-100 text-purple-700",
    tips: [
      "Ask for the next step directly — don't hint at it.",
      "Offer two options: 'Do you want to start now or schedule for tomorrow?'",
      "Silence is powerful — after you ask, wait.",
    ],
  },
  {
    label: "Wrap Up",
    color: "bg-green-100 text-green-700",
    tips: [
      "Summarize what was agreed and what happens next.",
      "Confirm the best contact method and time.",
      "Thank them genuinely — this is the last impression.",
    ],
  },
];

const POST_CALL_TEMPLATE = `CALL NOTES — [DATE]

Lead Name: 
Phone: 
Loan Amount Discussed: $

Call Outcome: [ ] Interested  [ ] Call Back  [ ] Not Interested  [ ] No Answer

Key Points Discussed:
• 
• 
• 

Objections Raised:
• 

Next Step Agreed:

Follow-up Date: 
Follow-up Action: 

Notes:
`;

// ─── Checklist ────────────────────────────────────────────────────────────────
const BEFORE_ITEMS = [
  "Review the lead's profile and loan amount",
  "Check previous call notes and outcome",
  "Set your environment: quiet space, headset ready",
  "Have loan rate sheet and product details open",
  "Research borrower profile (employment, credit range)",
  "Set your goal for the call (qualify, schedule app, close)",
];

const AFTER_ITEMS = [
  "Log call outcome in CRM (Interested / Not Interested / etc.)",
  "Update lead stage if it changed",
  "Schedule a follow-up task with a specific date",
  "Send follow-up message or email if promised",
  "Update notes with key points from the conversation",
  "Add any new objections to your objection tracker",
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatTime(secs: number): string {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function copyText(text: string) {
  navigator.clipboard.writeText(text);
  toast.success("Copied to clipboard");
}

// ─── Sub-components ───────────────────────────────────────────────────────────
function CallScriptTab() {
  const [stage, setStage] = useState("");
  const script = stage ? CALL_SCRIPTS[stage] : null;

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-4">
        <div className="w-64">
          <Select value={stage} onValueChange={setStage}>
            <SelectTrigger data-ocid="script.stage.select">
              <SelectValue placeholder="Select a lead stage…" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(CALL_SCRIPTS).map(([key, s]) => (
                <SelectItem key={key} value={key}>
                  {s.stage}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {script && (
          <Badge className="bg-primary/10 text-primary border-0">
            {script.stage} Script
          </Badge>
        )}
      </div>

      {!script && (
        <div
          data-ocid="script.empty_state"
          className="flex flex-col items-center justify-center py-20 text-center text-muted-foreground"
        >
          <MessageSquare className="w-10 h-10 mb-3 opacity-30" />
          <p className="font-medium">Select a stage to load the call script</p>
          <p className="text-sm mt-1">
            Each stage has a tailored script with opener, questions, pitch, and
            close.
          </p>
        </div>
      )}

      <AnimatePresence mode="wait">
        {script && (
          <motion.div
            key={stage}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="grid gap-4"
          >
            {script.sections.map((sec) => (
              <Card key={sec.label} className="border-border shadow-sm">
                <CardHeader className="pb-2 pt-4 px-5">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-semibold text-foreground">
                      {sec.label}
                    </CardTitle>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 px-2 text-muted-foreground hover:text-foreground"
                      data-ocid={`script.${sec.label.toLowerCase().replace(/ /g, "_")}.copy.button`}
                      onClick={() => copyText(sec.content)}
                    >
                      <Copy className="w-3.5 h-3.5 mr-1" /> Copy
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="px-5 pb-4">
                  <p className="text-sm text-muted-foreground whitespace-pre-line leading-relaxed">
                    {sec.content}
                  </p>
                </CardContent>
              </Card>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ObjectionsTab() {
  const [search, setSearch] = useState("");
  const filtered = OBJECTIONS.filter(
    (o) =>
      o.objection.toLowerCase().includes(search.toLowerCase()) ||
      o.tag.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          data-ocid="objections.search_input"
          className="pl-9"
          placeholder="Search objections or tags…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {filtered.length === 0 && (
        <div
          data-ocid="objections.empty_state"
          className="text-center py-12 text-muted-foreground"
        >
          <p>No objections match your search.</p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {filtered.map((obj, i) => (
          <motion.div
            key={obj.objection}
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.03 }}
          >
            <Card
              data-ocid={`objections.item.${i + 1}`}
              className="h-full border-border shadow-sm hover:shadow-md transition-shadow"
            >
              <CardContent className="p-5 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <p className="font-semibold text-sm text-foreground leading-snug">
                    "{obj.objection}"
                  </p>
                  <Badge
                    variant="outline"
                    className="text-[10px] shrink-0 mt-0.5"
                  >
                    {obj.tag}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed border-l-2 border-primary/30 pl-3">
                  {obj.response}
                </p>
                <div className="flex items-start gap-2 bg-amber-50 rounded-lg px-3 py-2">
                  <Lightbulb className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-700">
                    <span className="font-semibold">Pro tip:</span> {obj.tip}
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function ActiveCallTab() {
  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(false);
  const [phase, setPhase] = useState(0);
  const [showPostCall, setShowPostCall] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startTimer = useCallback(() => {
    if (intervalRef.current) return;
    intervalRef.current = setInterval(() => {
      setElapsed((prev) => prev + 1);
    }, 1000);
    setRunning(true);
  }, []);

  const pauseTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setRunning(false);
  }, []);

  const resetTimer = useCallback(() => {
    pauseTimer();
    setElapsed(0);
    setPhase(0);
    setShowPostCall(false);
  }, [pauseTimer]);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const endCall = () => {
    pauseTimer();
    setShowPostCall(true);
  };

  const currentPhase = CALL_PHASES[phase];

  return (
    <div className="space-y-5">
      {/* Timer */}
      <Card className="border-border shadow-sm">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
                Call Timer
              </p>
              <p
                className="text-5xl font-mono font-bold tracking-tight text-foreground"
                data-ocid="activecall.timer"
              >
                {formatTime(elapsed)}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {!running ? (
                <Button
                  data-ocid="activecall.start.button"
                  onClick={startTimer}
                  className="gap-2"
                >
                  <Play className="w-4 h-4" /> Start
                </Button>
              ) : (
                <Button
                  data-ocid="activecall.pause.button"
                  onClick={pauseTimer}
                  variant="secondary"
                  className="gap-2"
                >
                  <Pause className="w-4 h-4" /> Pause
                </Button>
              )}
              <Button
                data-ocid="activecall.reset.button"
                variant="outline"
                onClick={resetTimer}
                className="gap-2"
              >
                <RotateCcw className="w-4 h-4" /> Reset
              </Button>
              <Button
                data-ocid="activecall.endcall.button"
                variant="destructive"
                onClick={endCall}
                className="gap-2"
              >
                End Call
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Phase tracker */}
      <Card className="border-border shadow-sm">
        <CardHeader className="pb-2 pt-4 px-5">
          <CardTitle className="text-sm font-semibold">Call Phase</CardTitle>
        </CardHeader>
        <CardContent className="px-5 pb-5 space-y-4">
          {/* Phase pills */}
          <div className="flex items-center gap-1 flex-wrap">
            {CALL_PHASES.map((p, i) => (
              <button
                type="button"
                key={p.label}
                data-ocid={`activecall.phase.${i + 1}`}
                onClick={() => setPhase(i)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all",
                  i === phase
                    ? `${p.color} ring-2 ring-offset-1 ring-primary/40`
                    : i < phase
                      ? "bg-primary/10 text-primary opacity-70"
                      : "bg-muted text-muted-foreground",
                )}
              >
                {i < phase && <CheckCircle2 className="w-3 h-3" />}
                {i === phase && <ArrowRight className="w-3 h-3" />}
                {p.label}
              </button>
            ))}
          </div>

          {/* Current phase tips */}
          <AnimatePresence mode="wait">
            <motion.div
              key={phase}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.15 }}
              className="space-y-2"
            >
              <div
                className={cn(
                  "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold mb-2",
                  currentPhase.color,
                )}
              >
                <Clock className="w-3 h-3" />
                {currentPhase.label} — Coaching Tips
              </div>
              {currentPhase.tips.map((tip) => (
                <div
                  key={tip}
                  className="flex items-start gap-2.5 bg-muted/50 rounded-lg px-3 py-2.5"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                  <p className="text-sm text-foreground">{tip}</p>
                </div>
              ))}
            </motion.div>
          </AnimatePresence>

          {/* Advance button */}
          {phase < CALL_PHASES.length - 1 && (
            <Button
              variant="outline"
              size="sm"
              data-ocid="activecall.next_phase.button"
              onClick={() => setPhase((p) => p + 1)}
              className="gap-2"
            >
              Next Phase <ChevronRight className="w-4 h-4" />
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Post-call notes */}
      <AnimatePresence>
        {showPostCall && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            <Card
              data-ocid="activecall.postcall.card"
              className="border-primary/30 shadow-sm"
            >
              <CardHeader className="pb-2 pt-4 px-5">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-semibold">
                    Post-Call Notes Template
                  </CardTitle>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 px-2"
                    data-ocid="activecall.copy_notes.button"
                    onClick={() => copyText(POST_CALL_TEMPLATE)}
                  >
                    <Copy className="w-3.5 h-3.5 mr-1" /> Copy
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="px-5 pb-5">
                <Textarea
                  data-ocid="activecall.notes.textarea"
                  defaultValue={POST_CALL_TEMPLATE}
                  rows={14}
                  className="font-mono text-xs resize-none"
                />
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

type ChecklistState = { before: boolean[]; after: boolean[] };

function ChecklistTab() {
  const [checks, setChecks] = useState<ChecklistState>({
    before: Array(BEFORE_ITEMS.length).fill(false),
    after: Array(AFTER_ITEMS.length).fill(false),
  });

  const toggle = (section: "before" | "after", idx: number) => {
    setChecks((prev) => {
      const arr = [...prev[section]];
      arr[idx] = !arr[idx];
      return { ...prev, [section]: arr };
    });
  };

  const reset = () => {
    setChecks({
      before: Array(BEFORE_ITEMS.length).fill(false),
      after: Array(AFTER_ITEMS.length).fill(false),
    });
  };

  const beforeDone = checks.before.filter(Boolean).length;
  const afterDone = checks.after.filter(Boolean).length;

  return (
    <div className="space-y-5">
      <div className="flex justify-end">
        <Button
          variant="outline"
          size="sm"
          data-ocid="checklist.reset.button"
          onClick={reset}
          className="gap-2"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Reset Checklist
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        {/* Before */}
        <Card className="border-border shadow-sm">
          <CardHeader className="pb-2 pt-4 px-5">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold">
                Before the Call
              </CardTitle>
              <Badge
                variant="secondary"
                className={cn(
                  "text-xs",
                  beforeDone === BEFORE_ITEMS.length &&
                    "bg-green-100 text-green-700",
                )}
              >
                {beforeDone}/{BEFORE_ITEMS.length}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="px-5 pb-5 space-y-3">
            {BEFORE_ITEMS.map((item, i) => (
              <div
                key={item}
                className="flex items-start gap-3 cursor-pointer group"
              >
                <Checkbox
                  data-ocid={`checklist.before.checkbox.${i + 1}`}
                  checked={checks.before[i]}
                  onCheckedChange={() => toggle("before", i)}
                  className="mt-0.5 shrink-0"
                />
                <span
                  className={cn(
                    "text-sm leading-snug transition-colors",
                    checks.before[i]
                      ? "line-through text-muted-foreground"
                      : "text-foreground group-hover:text-primary",
                  )}
                >
                  {item}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* After */}
        <Card className="border-border shadow-sm">
          <CardHeader className="pb-2 pt-4 px-5">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold">
                After the Call
              </CardTitle>
              <Badge
                variant="secondary"
                className={cn(
                  "text-xs",
                  afterDone === AFTER_ITEMS.length &&
                    "bg-green-100 text-green-700",
                )}
              >
                {afterDone}/{AFTER_ITEMS.length}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="px-5 pb-5 space-y-3">
            {AFTER_ITEMS.map((item, i) => (
              <div
                key={item}
                className="flex items-start gap-3 cursor-pointer group"
                onClick={() => toggle("after", i)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") toggle("after", i);
                }}
              >
                <Checkbox
                  data-ocid={`checklist.after.checkbox.${i + 1}`}
                  checked={checks.after[i]}
                  onCheckedChange={() => toggle("after", i)}
                  className="mt-0.5 shrink-0"
                />
                <span
                  className={cn(
                    "text-sm leading-snug transition-colors",
                    checks.after[i]
                      ? "line-through text-muted-foreground"
                      : "text-foreground group-hover:text-primary",
                  )}
                >
                  {item}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function Assistant() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="space-y-6"
      data-ocid="assistant.page"
    >
      {/* Header */}
      <div className="flex items-start gap-4">
        <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
          <Bot className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            AI Sales Assistant
          </h1>
          <p className="text-muted-foreground mt-0.5">
            Scripts, objection handlers, live call coaching, and checklists —
            everything you need to close more loans.
          </p>
        </div>
      </div>

      <Tabs defaultValue="script" className="w-full">
        <TabsList className="mb-5" data-ocid="assistant.tabs">
          <TabsTrigger value="script" data-ocid="assistant.script.tab">
            Call Script
          </TabsTrigger>
          <TabsTrigger value="objections" data-ocid="assistant.objections.tab">
            Objections
          </TabsTrigger>
          <TabsTrigger value="activecall" data-ocid="assistant.activecall.tab">
            Active Call
          </TabsTrigger>
          <TabsTrigger value="checklist" data-ocid="assistant.checklist.tab">
            Pre-Call Checklist
          </TabsTrigger>
        </TabsList>

        <TabsContent value="script">
          <CallScriptTab />
        </TabsContent>
        <TabsContent value="objections">
          <ObjectionsTab />
        </TabsContent>
        <TabsContent value="activecall">
          <ActiveCallTab />
        </TabsContent>
        <TabsContent value="checklist">
          <ChecklistTab />
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}
