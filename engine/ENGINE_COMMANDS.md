# ENGINE_COMMANDS.md — MASTER COMMAND REFERENCE

**VERSION:** v1.0 (LOCKED)

This file defines **ALL supported commands** for autonomous project development and developer operations.  
Commands are **INTENT-LEVEL triggers**, not low-level instructions.

> ⚠️ This file ALWAYS operates under `ONBOARDING_COMMAND.txt`.  
> If any conflict arises → **ONBOARDING_COMMAND.txt wins.**

---

## GLOBAL GOVERNANCE RULES

- Commands NEVER rewrite history  
- Commands NEVER bypass `MEGA.md`  
- Commands NEVER auto-delete files  
- Commands NEVER create status files without explicit permission  
- Commands NEVER assume requirements  
- Commands NEVER violate HISTORY LOCK  
- `STOP` and `EMERGENCY_STOP` override every other command  

---

## CORE EXECUTION COMMANDS

### NEXT
**Purpose:** Identify and start the next logically correct task.

**Internal Flow:**
- Read `/engine/*`
- Read `/PROJECT_CONTEXT.md`
- Read `/dev-docs/status.md`
- Read `/dev-docs/my-demands.md`
- Detect unfinished demands, blockers, risks
- Select highest-impact safe task
- Ask permission if new files or status scopes are required

**Use When:**  
You want progress without micromanagement

---

### STOP
**Purpose:** Immediately halt all execution.

**Internal Flow:**
- Enter HALT mode
- No execution
- No planning
- No file creation or updates
- Await further instruction

**Use When:**  
Output feels wrong or you want a safety pause

---

### PAUSE_EXECUTION
**Purpose:** Soft-pause execution while retaining context.

**Internal Flow:**
- Freeze execution
- Preserve internal state
- Allow explanations only
- No new actions

---

### RESUME_EXECUTION
**Purpose:** Resume work safely after STOP / PAUSE.

**Internal Flow:**
- Re-read `/engine/*`
- Re-read `/PROJECT_CONTEXT.md`
- Re-read `/dev-docs/*`
- Validate no pending approvals
- Resume from last safe checkpoint

---

### EMERGENCY_STOP
**Purpose:** Hard freeze in case of runaway behavior.

**Internal Flow:**
- Absolute halt
- No suggestions
- No planning
- Only acknowledgment

---

## PLANNING & REALITY COMMANDS

### PLAN
**Purpose:** Produce an execution plan without executing.

---

### REPLAN
**Purpose:** Rethink direction, scope, and execution order.

**Internal Flow:**
- Re-read `PROJECT_CONTEXT.md`
- Re-evaluate all demands (history intact)
- Detect scope drift
- Propose revised plan with trade-offs

---

### VERIFY
**Purpose:** Validate alignment between intent, status, and execution.

---

### EXPLAIN
**Purpose:** Explain why a decision or proposal was made.

---

## AUDIT & TRUTH COMMANDS

### AUDIT
**Purpose:** Reveal system reality without changing anything.

**Internal Flow:**
- Scan `/dev-docs/*`
- Detect mock vs live mismatches
- Identify undocumented behavior
- Check history-lock compliance

---

### STATUS
**Purpose:** High-level current standing snapshot.

---

### SHOW_CURRENT_STATE
**Purpose:** Execution-only snapshot.

**Returns:**
- Execution state
- Active scope
- Pending approvals
- Blockers

(No file changes allowed)

---

## GAP & COVERAGE COMMANDS

### GAP
**Purpose:** Identify missing truth areas.

---

### GAP: ACTOR_COVERAGE
**Purpose:** Detect missing actor status tracking.

---

### GAP: UI_COVERAGE
**Purpose:** Detect UI flows without status tracking.

---

### GAP: DATA / BACKEND
**Purpose:** Detect backend / schema / RLS areas missing visibility.

---

### GAP: PAYMENT / RISK
**Purpose:** Detect money, security, compliance gaps.

---

## DEBUGGING & RECOVERY COMMANDS

### DEBUG
**Purpose:** Root-cause analysis + safe fix proposal.

---

### TRACE
**Purpose:** Explain an end-to-end flow.

---

### RECOVER_LAST_SAFE_STATE
**Purpose:** Recover after crash, blank screen, or lock.

**Internal Flow:**
- Identify last stable checkpoint
- Propose recovery plan
- NO execution without approval

---

### FORCE_RESTART
**Purpose:** Reset execution context after stuck state.

**Internal Flow:**
- Re-read all authorities
- Clear transient state
- Resume safely

---

## DOCUMENTATION COMMANDS

### APPEND
**Purpose:** Append new reality to documentation.

**Rules:**
- Append only
- Timestamp mandatory
- No edits

---

### PROPOSE_STATUS
**Purpose:** Propose a new status file.

**Approval Gate:**  
“Proposed new status file: `<name>` … Approve? YES / NO”

---

### SYNC_STATUS
**Purpose:** Re-align dev-docs with reality.

**Internal Flow:**
- Detect mismatch between UI / DB / status
- Append findings
- No rewrites

---

## ADMIN / CMS / CONFIG COMMANDS

### ADMIN_DEBUG
**Purpose:** Debug admin-only flows (auth, RLS, CMS, dashboard).

---

### ADMIN_VERIFY
**Purpose:** Verify admin visibility, permissions, and exclusions.

---

### REGISTRY_SYNC
**Purpose:** Sync runtime state with status registry.

**Note:**  
This explains “execute registry sync”.  
It records truth only — it does NOT change behavior.

---

## CONTROL & SAFETY COMMANDS

### BLOCK
**Purpose:** Explicitly forbid an action or direction.

---

### ROLLBACK
**Purpose:** Cancel last proposed change (not history).

---

### LOCK
**Purpose:** Permanently freeze a decision or scope.

---

## META COMMANDS

### HELP
**Purpose:** List all commands.

---

### RULES
**Purpose:** Reiterate governance constraints.

---

## FORBIDDEN COMMANDS (AUTO-REJECTED)

- Rewrite history  
- Merge documentation  
- Delete without approval  
- Assume requirements  
- Skip audit  
- Override onboarding rules  

---

## GOLDEN PRINCIPLE

Commands change **mode**, not **authority**.  
AI executes. Human governs.

---

**END OF ENGINE_COMMANDS.md**
