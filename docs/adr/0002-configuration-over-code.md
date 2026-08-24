# ADR 0002 — Configuration over code

**Status:** Accepted · **Date:** 2026-08-24

## Context

The Garis Panduan states this in three separate places, and once with a liability clause attached
(slide 53):

> *"LPKmn TIDAK AKAN BERTANGGUNGJAWAB sekiranya pembekal diarahkan membubarkan atau merombak kembali
> pengaturcaraan / paparan ... sekiranya didapati dilakukan dengan cara sedemikian."*

If hard-coding is found, the cost of tearing it out and rebuilding is ours. On a project with 0.6
months of buffer, one such finding ends the margin.

Beyond the contract, it is also operationally true: LPKmn will want to add a licence type, change a
fee, add a state to a dropdown and edit an email template — and every one of those must not require
a developer.

## Decision

**Anything LPKmn might reasonably want to change is data, editable through an admin screen.**

Specifically, all of the following live in the database:

- dropdown values (`lookup_values`)
- roles, permissions, menu visibility
- system settings, formats, branding
- email and SMS templates
- document and letterhead templates
- file upload policies
- **application types, their form schemas, their fees, their validity periods**
- **workflow stages, actors, SLAs and transitions**

Code enums are reserved for values with **behaviour attached** — `ApplicationStatus`,
`WorkflowActionType` — never for business lists.

## The test

If you are about to write:

```php
$states = ['Johor', 'Kedah', 'Kelantan', ...];
```

or

```php
if ($type === 'lesen_malim') { ... }
```

you have broken this ADR. The first is a lookup; the second is a difference that belongs in
`application_types` configuration.

## Consequences

**Good**
- Satisfies GP-01, GP-02, GP-09, GP-10, GP-11, GP-13, X-R09, X-R10 structurally rather than
  feature by feature
- Adding Lesen Malim in Phase 2 is a seeder row plus a workflow definition, not a new module
- LPKmn can operate the system without us, which is what makes the warranty period survivable
- Removes an entire category of change request

**Bad**
- Roughly 25 PD more up front than hard-coding the three Phase 1 types
- The dynamic form renderer (task 5.2, 8 PD) is the most complex single piece of code in Phase 1
- Debugging configuration is harder than debugging code — mitigated by validating `form_schema`
  against a documented contract and testing seeders

**Accepted trade-off:** the 25 PD is cheaper than one rework finding, and it is what makes Phase 2
profitable on a codebase we already have.

## Exception

Genuinely fixed structural things stay in code: the audit table shape, the reference-number format
(`LPK/{prefix}/{year}/{seq}`), the status machine's transitions. If LPKmn asks to change any of
these, it is a change request, and a legitimate one.
