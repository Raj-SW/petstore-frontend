## Project context

This is the **frontend** repo for VitalPaws — a pet store and services platform built with React + Vite.
The companion **backend** repo lives at `../backend/` (same parent directory).

Shared memory files live in `.claude/memory/`. Read these at the start of any session:

- `STATUS.md`      — what's done, what's remaining, what's blocked (frontend view)
- `PATTERNS.md`    — shared components, CSS conventions, test patterns
- `ARCHITECTURE.md`— key design decisions that affect the frontend

For the full picture (security findings, deferred items, specs index, backend architecture):
read `../backend/.claude/memory/` if available, otherwise see `docs/` in the backend repo.

Update `STATUS.md` whenever a frontend epic ships.

---

## graphify

This project has a knowledge graph at graphify-out/ with god nodes, community structure, and cross-file relationships.

Rules:
- For codebase questions, first run `graphify query "<question>"` when graphify-out/graph.json exists. Use `graphify path "<A>" "<B>"` for relationships and `graphify explain "<concept>"` for focused concepts. These return a scoped subgraph, usually much smaller than GRAPH_REPORT.md or raw grep output.
- If graphify-out/wiki/index.md exists, use it for broad navigation instead of raw source browsing.
- Read graphify-out/GRAPH_REPORT.md only for broad architecture review or when query/path/explain do not surface enough context.
- After modifying code, run `graphify update .` to keep the graph current (AST-only, no API cost).
