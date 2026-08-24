# 05 — Schedule

**Internal target: 8.5 months. Declared in the Borang Akuan: 10 months. Break-even: 9.1 months.**

The gap between 8.5 and 9.1 is the entire buffer. Protect it.

---

## 1. Team and real capacity

Six people is not six FTE.

| Person | Cost/month | Productive FTE | Why |
|---|---|---|---|
| Developer (lead) | RM 4,600 | **1.0** | Full-time build |
| Boss | RM 6,900 | **0.4** | Client liaison, meetings, other tenders, admin |
| Intern × 3 | RM 1,800 total | **0.3 each = 0.9** | Ramping months 1–2, useful from month 3 |
| WBL × 1 | RM 1,000 | **0.4** | Longer attachment, more embedded |
| Overhead | RM 3,200 | — | Office, internet, equipment, AI subscriptions |
| **Burn** | **RM 17,500** | Gross 2.7 | |
| Mentoring and review drag | | **−0.5** | Lead and boss reviewing intern output |
| **Net effective** | | **2.2 FTE ≈ 46 PD/month** | |

**Cost per delivered person-day: RM 380.**

Capacity ramps. Do not plan month 1 as if it were month 5:

| Month | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 |
|---|---|---|---|---|---|---|---|---|---|
| PD available | 35 | 42 | 48 | 50 | 50 | 50 | 48 | 45 | buffer |

Total months 1–8 = **368 PD**. Phase 1 needs 384 PD. The 16 PD shortfall is why month 9 exists and
why the declared period is 10 months.

---

## 2. Month by month

### Month 1 — Discovery and setup · 35 PD
🎯 URS signed, ERD approved, repo running, wireframes v1

| Who | Work |
|---|---|
| **Boss** | URS/BRS sessions with Unit M/T. **Must come back with:** the actual forms for the 3 P1 application types, the fee schedule, the licence/permit/PDA2 letter templates, and the approval hierarchy (who approves what, how many stages). Chase tender files 01/02/05. |
| **Lead** | Framework install, repo, CI, environments, `CLAUDE.md`, ERD, module boundaries, `F1` |
| **WBL** | Onboard Laravel/Filament, start `F2` config engine |
| **Intern 1** | Wireframes, design system, LPKmn theme |
| **Intern 2** | Collect and catalogue reference documents (pekeliling, UUK, ISPS, MARPOL, Green Port) |
| **Intern 3** | Onboard, build test-case template, create `docs/evidence/` structure |

> If the URS is not signed by the end of month 1, **do not start month 2**. Escalate. Every week of
> building against guesses costs RM 4,400 and gets thrown away.

### Month 2 — Platform foundation · 42 PD
| Who | Work |
|---|---|
| **Lead** | `F3` RBAC engine, `F4` soft-delete/archive base, `F5` audit interceptor |
| **WBL** | `F2` config engine complete, lookup registry, `F9` file upload policy |
| **Intern 1** | `P1` front page + login page UI |
| **Intern 2** | `F5` audit trail list + report UI |
| **Intern 3** | Test cases for auth and RBAC |

### Month 3 — Auth and shared engines · 48 PD
🎯 **MILESTONE 1** — demo to LPKmn: login + MFA + RBAC + audit trail

| Who | Work |
|---|---|
| **Lead** | `I1` login/password/lockout/session, `I2` MFA, `F6` universal list component |
| **WBL** | `F7` print and document template engine |
| **Intern 1** | `P2` UI system, responsive, dashboard shell |
| **Intern 2** | `I3` registration screens + CAPTCHA |
| **Intern 3** | Testing, first evidence screenshots (GP-01, GP-02, GP-03, GP-18) |

### Month 4 — Modul Pengguna · 50 PD
🎯 **MILESTONE 2** — Modul Pengguna complete

| Who | Work |
|---|---|
| **Lead** | `M5-1` external user categories + company↔representative linkage; start `M1-1` |
| **WBL** | `F8` notification bus (in-app + email) + template manager |
| **Intern 1** | `I4` profile + Aku-Janji UI |
| **Intern 2** | `M5-2` internal unit structure + role mapping |
| **Intern 3** | Registration flow testing, evidence for GP-04, GP-05, GP-06 |

### Month 5 — Application engine · 50 PD ⚠️ most critical month
| Who | Work |
|---|---|
| **Lead** | `M1-1`: multi-step stepper, save draft, auto reference number, status machine, cancel, freeze, status badges |
| **WBL** | Supporting-document upload within applications + validation |
| **Intern 1** | Stepper UI components, form widgets |
| **Intern 2** | `M4-1` reference repository |
| **Intern 3** | Testing |

> No leave, no side projects, no other tenders this month. If month 5 slips, everything slips.

### Month 6 — Workflow and licence generation · 50 PD
🎯 **MILESTONE 3** — end-to-end: apply → review → approve → generate licence with QR → scan and verify

| Who | Work |
|---|---|
| **Lead** | `M1-2` workflow engine (multi-stage, remarks, return, SLA), `M1-3` licence generation + QR |
| **WBL** | Public verification page `/semak/{qr_token}` |
| **Intern 1** | `M4-2` repository UI, notis sistem, scrolling display |
| **Intern 2** | Configure the 3 P1 application types (seeders + form schema) |
| **Intern 3** | Full regression pass |

### Month 7 — Three application types + dashboard · 48 PD
| Who | Work |
|---|---|
| **Lead** | `M1-4` Lesen Sokongan, `M1-5` Permit Aktiviti, `M1-6` PDA2 letter; `P3` security hardening |
| **WBL** | `M3-1` role-based dashboard, `M3-2` basic statistics + valid licence-holder registry |
| **Intern 1** | UI polish, help notes on critical pages, responsive fixes, Lighthouse tuning |
| **Intern 2** | Online user manual, privacy policy page, footer |
| **Intern 3** | UAT scripts, **compliance evidence pack assembly** |

> Intern rotation usually lands around here. New interns get UI, docs and testing — never core logic.

### Month 8 — SIT, UAT, compliance · 45 PD
🎯 **MILESTONE 4** — UAT passed

| Who | Work |
|---|---|
| **All** | SIT, bug fixing |
| **Boss** | UAT sessions with LPKmn, user training |
| **Lead** | VAPT remediation, performance tuning, load test at 50 concurrent users |
| **Intern 2 + 3** | Complete the 23-feature evidence pack with screenshots (`07-compliance-checklist.md`) |

### Month 9 — Buffer, go-live, handover
UAT round 2, production deploy, HTTPS + HSTS, backup verification, document handover, warranty start.

🎯 **GO-LIVE**

---

## 3. Gantt

```
Month           1     2     3     4     5     6     7     8     9
Discovery      ███
Foundation      ██████████████
Auth + MFA             ████████
Modul Pengguna              ████████
App engine                        ██████████████
Workflow + QR                            ████████
3 types + dash                                 ████████
SIT / UAT                                            ████████
Buffer / go-live                                           ██████
                 M1↑        M2↑   M3↑         M4↑         GL↑
```

---

## 4. Standing rhythm

| Cadence | What |
|---|---|
| Daily, 15 min | Standup. Blockers only. |
| Weekly, Friday | Code review sweep by lead. Nothing merges to `main` unreviewed. |
| Fortnightly | Sprint close. Update PD burned vs planned in this file. |
| Monthly | Boss reports progress to LPKmn against the milestone. |
| Monthly | **Burn check:** months elapsed × RM 17,500 vs percentage complete. |

---

## 5. Control points — stop and reassess

| When | Trigger | Action |
|---|---|---|
| End month 1 | URS unsigned, or forms/templates not received | **Do not start coding.** Escalate to LPKmn in writing. |
| End month 3 | Milestone 1 not demoed | Cut scope now, not in month 7. First candidates: `M3-2`, `M4-2`, `P2` polish. |
| End month 5 | Application engine incomplete | Project is in danger. Boss must be told the same week. |
| End month 6 | Milestone 3 not achieved | Move to a reduced Phase 1: two application types instead of three. |
| Month 9 crossed | Any reason | Every further month = **−RM 17,500**. Escalate to a commercial decision, not a technical one. |
| Any time | Intern rotates out | Reassign to UI, docs, testing. Never hand core logic to a new intern. |

---

## 6. Risk register

| Risk | Impact | Mitigation |
|---|---|---|
| **Bus factor = 1** | Project dies if the lead is unavailable | Boss must know the codebase. Enforce reviews, keep docs current, no undocumented work. |
| Intern rotation | Re-onboarding cost, mid-project | Interns own separable work: UI, documentation, testing. Never the workflow engine. |
| No dedicated QA | Bugs surface at UAT under pressure | Intern 3 goes full-time testing from month 4. |
| No security specialist | Auth, MFA, uploads, QR tokens | Budget RM 15,000 for external VAPT. Do not skip it. |
| Unknown warranty period | 24 months free support = RM 60k–80k unbilled | Get tender files 01/02/05 **before bidding** |
| Scope creep from LPKmn | Silent yes costs RM 17,500/month | Route every request to `01-scope-baseline.md`. Boss quotes it. |
| Evidence pack left to the end | 15 PD under UAT pressure | Screenshot per task, enforced in Definition of Done |
