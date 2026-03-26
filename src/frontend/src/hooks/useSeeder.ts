import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { useActor } from "./useActor";
import { useInternetIdentity } from "./useInternetIdentity";

const SEED_KEY = "loancrm_seeded_v2";

const SAMPLE_LEADS = [
  {
    name: "Sarah Mitchell",
    phone: "(555) 012-3456",
    email: "sarah.mitchell@gmail.com",
    amount: 45000,
    stage: "new",
  },
  {
    name: "James Rodriguez",
    phone: "(555) 234-5678",
    email: "james.r@outlook.com",
    amount: 62500,
    stage: "contacted",
  },
  {
    name: "Emily Chen",
    phone: "(555) 345-6789",
    email: "emily.chen@yahoo.com",
    amount: 38750,
    stage: "qualified",
  },
  {
    name: "Michael Thompson",
    phone: "(555) 456-7890",
    email: "m.thompson@gmail.com",
    amount: 95000,
    stage: "application",
  },
  {
    name: "Lisa Anderson",
    phone: "(555) 567-8901",
    email: "lisa.anderson@email.com",
    amount: 120000,
    stage: "approval",
  },
  {
    name: "David Kim",
    phone: "(555) 678-9012",
    email: "david.kim@gmail.com",
    amount: 78500,
    stage: "funded",
  },
  {
    name: "Jennifer Walsh",
    phone: "(555) 789-0123",
    email: "j.walsh@outlook.com",
    amount: 52000,
    stage: "new",
  },
  {
    name: "Robert Martinez",
    phone: "(555) 890-1234",
    email: "robert.m@gmail.com",
    amount: 85000,
    stage: "contacted",
  },
  {
    name: "Amanda Foster",
    phone: "(555) 901-2345",
    email: "a.foster@yahoo.com",
    amount: 67250,
    stage: "qualified",
  },
  {
    name: "Christopher Lee",
    phone: "(555) 012-3457",
    email: "chris.lee@email.com",
    amount: 110000,
    stage: "application",
  },
];

const SAMPLE_TASKS = [
  "Follow up with James Rodriguez re: refinancing options",
  "Prepare loan documents for Lisa Anderson",
  "Call back Michael Thompson – application questions",
  "Review credit report for Christopher Lee",
  "Send welcome email to Sarah Mitchell",
];

export function useSeeder() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();
  const qc = useQueryClient();
  const ran = useRef(false);

  useEffect(() => {
    if (!actor || isFetching || !identity || ran.current) return;
    if (localStorage.getItem(SEED_KEY)) return;
    ran.current = true;

    (async () => {
      try {
        const existing = await actor.getAllLeads();
        if (existing.length > 0) {
          localStorage.setItem(SEED_KEY, "1");
          return;
        }

        // Create leads in parallel, get IDs
        const ids = await Promise.all(
          SAMPLE_LEADS.map((l) =>
            actor.createLead(l.name, l.phone, l.email, l.amount),
          ),
        );

        // Update stages in parallel
        await Promise.all(
          ids.map((id, i) =>
            actor.updateLead(
              id,
              SAMPLE_LEADS[i].name,
              SAMPLE_LEADS[i].phone,
              SAMPLE_LEADS[i].email,
              SAMPLE_LEADS[i].amount,
              SAMPLE_LEADS[i].stage as any,
            ),
          ),
        );

        // Create tasks
        const now = BigInt(Date.now()) * BigInt(1_000_000);
        const oneDay = BigInt(86_400) * BigInt(1_000_000_000);
        await Promise.all(
          SAMPLE_TASKS.map((title, i) =>
            actor.createTask(
              title,
              now + oneDay * BigInt(i + 1),
              identity.getPrincipal() as any,
            ),
          ),
        );

        // Log some calls against leads
        const callData = [
          {
            idx: 1,
            duration: 240n,
            outcome: "interested",
            notes: "Very interested in refinancing, wants to move forward.",
          },
          {
            idx: 2,
            duration: 420n,
            outcome: "callBack",
            notes: "Busy, asked to call back Thursday morning.",
          },
          {
            idx: 3,
            duration: 720n,
            outcome: "interested",
            notes: "Confirmed application details, uploading docs.",
          },
          {
            idx: 4,
            duration: 480n,
            outcome: "interested",
            notes: "Underwriting review in progress, positive outlook.",
          },
          {
            idx: 7,
            duration: 180n,
            outcome: "noAnswer",
            notes: "Left voicemail, will try again tomorrow.",
          },
        ];
        await Promise.all(
          callData.map(({ idx, duration, outcome, notes }) =>
            actor.logCall(ids[idx], duration, outcome as any, notes),
          ),
        );

        localStorage.setItem(SEED_KEY, "1");
        qc.invalidateQueries();
      } catch (err) {
        console.warn("Seeder error:", err);
        ran.current = false;
      }
    })();
  }, [actor, isFetching, identity, qc]);
}
