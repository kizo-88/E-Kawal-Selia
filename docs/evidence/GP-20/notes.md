# GP-20 — Borang Permohonan Pindaan (Change Request Form)

**Requirement ID**: `GP-20`  
**Feature**: Change Request Form Flow  
**Standard**: Garis Panduan Slide 62  
**Status**: ◐ In Progress (Code implemented & verified)  

---

## Evidence Summary

1. **End-to-End Change Request Lifecycle**:
   - Model `ChangeRequest` in `prisma/schema.prisma`.
   - Flow:
     1. User submits request to add/amend a lookup value or field option.
     2. Admin reviews the pending request.
     3. Admin amends or approves the request.
     4. Approved value is written directly into `lookup_values` live list.

2. **Audit Tracking**:
   - Every change request transition writes an audit record in `audit_logs` tracking the requester and approving officer.
