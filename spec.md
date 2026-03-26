# LoanCall CRM - AI Sales Assistant

## Current State
App has Dashboard, Leads, Calls, Tasks pages. Users can manage leads through a pipeline, log calls with outcomes, and track tasks.

## Requested Changes (Diff)

### Add
- New "Assistant" page accessible from sidebar navigation
- AI Sales Call Assistant with smart, rule-based guidance:
  - Call Script Generator: produces a personalized call script based on lead stage, loan amount, and previous call outcomes
  - Objection Handling: searchable library of common loan objections with suggested responses
  - Active Call Panel: timer, live coaching tips based on call phase (opener, discovery, pitch, close)
  - Pre-call checklist: steps to prepare before dialing a lead
  - Post-call summary template: structured notes template to fill after each call

### Modify
- Sidebar to include "Assistant" navigation item
- App.tsx to route to the new Assistant page
- crm.ts types to add `Page = "assistant"`

### Remove
- Nothing removed

## Implementation Plan
1. Add `"assistant"` to `Page` type in crm.ts
2. Create `src/frontend/src/pages/Assistant.tsx` with:
   - Tab layout: Script | Objections | Active Call | Checklist
   - Script tab: select a lead from dropdown, generate stage-appropriate script
   - Objections tab: searchable cards with common objections + responses
   - Active Call tab: call timer, phase tracker, tips per phase
   - Checklist tab: pre/post call checklist items
3. Update Sidebar.tsx to add Assistant nav item
4. Update App.tsx to render Assistant page
