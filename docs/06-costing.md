# 06 — Costing and Commercial Position

---

## 1. The core problem

| | |
|---|---|
| LPKmn indicative budget | **RM 180,000 – RM 200,000** |
| Full written scope, our team, lean + AI-assisted | **≈ RM 332,000** |
| Full written scope, normal market vendor | **≈ RM 480,000** |

**The tender is underfunded by roughly 1.7× against our own cost base, and ~2.4× against a normal
vendor's.** This is not a negotiating position, it is arithmetic. The scope was written by the
operations unit and the price set by finance, and the two were never reconciled.

Our advantage is that our cost per person-day is RM 380 against a market RM 500–600. That is the only
reason a bid is viable at all.

---

## 2. Monthly burn

| Person | Gross | Loading | Cost/month |
|---|---|---|---|
| Developer (lead) | RM 4,000 | ×1.15 EPF/SOCSO | RM 4,600 |
| Boss | RM 6,000 | ×1.15 | RM 6,900 |
| Intern × 3 | RM 600 each | — | RM 1,800 |
| WBL × 1 | RM 1,000 | — | RM 1,000 |
| **Payroll** | | | **RM 14,300** |
| Overhead: office, internet, equipment, AI subscriptions | | | RM 3,200 |
| **Total burn** | | | **RM 17,500 / month** |

> **If UMPSA Holding absorbs overhead, burn drops to RM 14,300/month.** That single fact moves profit
> from RM 11,450 to RM 38,650 and pushes break-even from 9.1 to 11.2 months. **Confirm it with the
> boss before finalising the bid** — it is the difference between a marginal project and a decent one.

Delivered capacity: **46 PD/month** → **RM 380 per person-day**.

---

## 3. Phase 1 P&L at the bid ceiling

Bid at **RM 198,000**. Bidding low leaves no room at all.

| Line | Amount |
|---|---|
| Revenue | RM 198,000 |
| Labour, 8.5 months × RM 17,500 | −RM 148,750 |
| Non-labour (below) | −RM 37,800 |
| **Profit** | **+RM 11,450 (5.8%)** |

### Non-labour detail

| Item | Amount |
|---|---|
| VAPT / external security assessment | RM 15,000 |
| AI subscriptions, RM 1,200/month × 9 | RM 10,800 |
| Hosting during development | RM 3,000 |
| SSL, transactional email service | RM 2,000 |
| Travel to Kemaman (URS, milestones, UAT, go-live) | RM 5,000 |
| Tooling and licences | RM 2,000 |
| **Total** | **RM 37,800** |

---

## 4. Sensitivity — this is the table that matters

Every month the project runs costs RM 17,500. Revenue is fixed.

| Delivered in | Labour | Non-labour | Total cost | Result |
|---|---|---|---|---|
| 7.0 months | RM 122,500 | RM 35,000 | RM 157,500 | **+RM 40,500** ✅ |
| 8.0 months | RM 140,000 | RM 36,000 | RM 176,000 | **+RM 22,000** ✅ |
| **8.5 months (target)** | RM 148,750 | RM 37,800 | RM 186,550 | **+RM 11,450** ⚠️ |
| **9.1 months** | RM 159,250 | RM 38,750 | RM 198,000 | **BREAK-EVEN** |
| 10.0 months | RM 175,000 | RM 40,000 | RM 215,000 | **−RM 17,000** ❌ |
| 12.0 months | RM 210,000 | RM 43,000 | RM 253,000 | **−RM 55,000** ❌ |
| 16.6 months (full written scope) | RM 290,500 | RM 48,000 | RM 338,500 | **−RM 140,500** ❌ |

**Buffer between target and break-even: 0.6 months.** That is 13 working days for the entire project.

### With overhead absorbed by UMPSA Holding (burn RM 14,300)

| Delivered in | Total cost | Result |
|---|---|---|
| 8.5 months | RM 159,350 | **+RM 38,650** ✅ |
| 11.2 months | RM 198,000 | BREAK-EVEN |

---

## 5. Why Phase 1 and not the full scope

| | Full written scope | Phase 1 |
|---|---|---|
| Effort | 763 PD | 384 PD |
| Duration at 46 PD/month | 16.6 months | 8.5 months |
| Cost | RM 338,500 | RM 186,550 |
| Result at RM 198,000 | **−RM 140,500** | **+RM 11,450** |

There is no version of the full scope that makes money at this price. The only question is whether a
scoped Phase 1 is acceptable to LPKmn.

---

## 6. Bid strategy

**Bid RM 198,000 for Phase 1, with Phase 2 quoted separately.**

Present it as a **phased implementation schedule**, not as an exclusion list. Malaysian government
procurement can rule a qualified bid *tidak patuh*, so the framing matters:

- ✅ *"Pelaksanaan secara berfasa: Fasa 1 (8 modul teras) dalam tempoh 10 bulan, Fasa 2 disebut harga
  berasingan."*
- ❌ *"Kami tidak akan bekalkan Modul Aset dan Modul Kawal Selia."*

The Borang Akuan has a blank **"Dalam tempoh ________"**. That field is ours to fill. Put **10 bulan**.

**Raise phasing at the briefing session and get it minuted.** If LPKmn confirms phasing is acceptable,
the risk mostly disappears. If they insist on the full scope at a fixed RM 200,000, the answer is
no-bid — see §8.

---

## 7. Post-go-live warranty — the hidden line item

Malaysian government contracts commonly require 12–24 months of free warranty and support.

| Warranty | Unbilled cost at 15% of contract value/year |
|---|---|
| 12 months | ≈ RM 30,000 |
| 24 months | ≈ RM 60,000 |

At 24 months, Phase 1's RM 11,450 profit becomes a **RM 48,550 loss**, and the lead is on call while
working the next project.

**The warranty period is in tender files 01/02/05, which we do not have.** Nothing else in this
document is reliable until that number is known.

---

## 8. Decision gates

**Bid if all of these hold:**

- [ ] Tender files 01, 02, 05 obtained and reviewed
- [ ] Warranty ≤ 12 months, or priced separately
- [ ] Delivery period ≥ 9 months, or phasing acceptable
- [ ] LAD penalty understood and survivable
- [ ] Lampiran C can be completed — we have a credible project reference
- [ ] Overhead treatment confirmed with UMPSA Holding
- [ ] Boss commits to 0.4 FTE for 9 months, in writing

**No-bid if any of these hold:**

- Fixed price for the full written scope with no phasing
- Warranty 24 months with no separate payment
- Delivery period under 6 months
- Payment only on final delivery, with no progress milestones
- Cannot complete Lampiran C

---

## 9. What we get even if the margin is thin

The 81 PD platform layer is built to LPKmn's own Garis Panduan — RBAC, audit, universal list,
document engine, notification bus, config engine. It is domain-agnostic and reusable.

That has real value beyond this contract:

1. **Pre-qualifies us for every future LPKmn system**, since it already satisfies their mandatory
   feature list
2. **Reusable for other Malaysian agency portals** — the Garis Panduan is broadly typical of what
   agencies ask for
3. **Phase 2 is the actual revenue**: ~270 PD, RM 180k–200k, on a codebase we already know
4. **Annual maintenance**: RM 30,000–40,000/year
5. **A government reference for Lampiran C** on future tenders

If the margin on Phase 1 comes in near zero, this list is the justification — but say so openly to
the boss rather than pretending the project pays for itself.
