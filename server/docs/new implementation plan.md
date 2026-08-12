## Sources Feature — Implementation Plan

Based on the architecture patterns (notebooks module) and the 3-table database design.

---

### Phase 1: Database Migration

**File:** `server/migrations/YYYYMMDDHHMMSS_create-sources-tables.sql`

- Enable `pgvector` extension
- Create `sources` table (with FK to notebooks + user, JSONB metadata, status check constraint)
- Create `source_contents` table (with FK to sources, TEXT content)
- Create `source_chunks` table (with FK to sources + notebooks, vector(1536) embedding)
- Add indexes: `notebook_id`, `user_id`, `status`, `source_id`, and a vector similarity index (HNSW) on `embedding`

---

### Phase 2: Domain Layer

| File | Purpose |
|------|---------|
| `domain/entities/source.entity.ts` | Rich entity with `create()`, `fromRecord()`, metadata typing |

Enums already exist: `SourceStatus`, `SourceType` ✓

**Note:** `source_contents` and `source_chunks` do NOT get domain entities — they have no independent lifecycle (always tied to a source). They are handled as row types directly in the repository, same as `refresh_tokens` pattern in the steering docs.

---

### Phase 3: Infrastructure — Repository

| File | Purpose |
|------|---------|
| `infrastructure/repositories/sources/sources.types.ts` | `SourceRow`, `SourceContentRow`, `SourceChunkRow` DB types |
| `infrastructure/repositories/sources/sources.repository.interface.ts` | Interface for source CRUD |
| `infrastructure/repositories/sources/sources.repository.ts` | PostgreSQL implementation (raw SQL) |

**Repository methods (added incrementally as use cases need them):**
- `create(entity)` — insert source record
- `findByIdAndUserId(id, notebookId, userId)` — single source with ownership check
- `findAllByNotebookId(notebookId, userId)` — list sources for a notebook
- `updateStatus(id, status, errorMessage?)` — transition status after processing
- `softDelete(id)` — soft delete
- `createContent(sourceId, content)` — insert full extracted text
- `getContent(sourceId)` — fetch full text
- `createChunks(chunks[])` — bulk insert chunks with embeddings
- `deleteChunksBySourceId(sourceId)` — for re-processing
- `searchChunksByEmbedding(notebookId, embedding, limit)` — pgvector similarity search

---

### Phase 4: Application Layer — Use Cases + DTOs

| Use Case | Purpose |
|----------|---------|
| `create-source.use-case.ts` | Validate notebook ownership, create source record (status: pending). For text/markdown — stores content immediately and dispatches processing job |
| `list-sources.use-case.ts` | Return all sources for a notebook (lightweight, no content) |
| `get-source.use-case.ts` | Single source detail (optionally include content) |
| `delete-source.use-case.ts` | Soft delete source, decrement `notebooks.active_source_count`, cleanup chunks |

**DTOs (one file per use case):**
- `create-source.dto.ts` — request: `{ notebookId, title, type, content?, metadata? }` + response
- `list-sources.dto.ts` — request: `{ notebookId, userId }` + response (array)
- `get-source.dto.ts` — request: `{ notebookId, id, userId }` + response (with optional content)
- `delete-source.dto.ts` — request: `{ notebookId, id, userId }`

**active_source_count management:**
- Create source → when status changes to `completed` → increment `notebooks.active_source_count`
- Delete source → if status was `completed` → decrement `notebooks.active_source_count`

---

### Phase 5: Background Processing (Jobs Layer)

| File | Purpose |
|------|---------|
| `jobs/workers/process-source/process-source.worker.ts` | Orchestrates: extract content → chunk → embed → update status |
| `jobs/workers/process-source/process-source.types.ts` | Job payload type + job name constant |

**Processing flow:**
1. Create use case dispatches job via `IQueueService` (or direct call for MVP)
2. Worker picks up the job
3. Worker extracts content based on type (text/markdown immediately, PDF/URL/YouTube deferred)
4. Worker chunks the content via chunking service
5. Worker generates embeddings via embedding external service
6. Worker stores chunks + updates source status to `completed`
7. Worker increments `notebooks.active_source_count`

**For Phase 1 (MVP):** Skip queue, process text/markdown synchronously in the create use case. Move to background jobs when adding PDF/URL/YouTube.

---

### Phase 6: Shared Services + External Services

| File | Purpose |
|------|---------|
| `shared/services/chunking/chunking.service.interface.ts` | `IChunkingService` — accepts content + source type, returns chunks |
| `shared/services/chunking/chunking.service.ts` | Implementation: Strategy pattern — delegates to type-specific chunking methods |
| `shared/services/chunking/chunking.types.ts` | `ChunkResult` type (content, chunkIndex, tokenCount) |
| `infrastructure/external-services/embedding/embedding.external-service.interface.ts` | `IEmbeddingService` — generate vector embeddings |
| `infrastructure/external-services/embedding/embedding.types.ts` | Request/response types |
| `infrastructure/external-services/embedding/embedding.external-service.ts` | OpenAI embeddings API call |

**Chunking Strategy (by source type):**

```
IChunkingService.chunk(content, sourceType) →
  ├── TEXT       → chunkByFixedSize (paragraphs with overlap)
  ├── MARKDOWN   → chunkByFixedSize (same for MVP, later: split by headings)
  ├── PDF        → chunkByFixedSize (same for MVP, later: split by pages)
  ├── URL        → chunkByFixedSize (same for MVP, later: split by sections)
  └── YOUTUBE    → chunkByFixedSize (same for MVP, later: split by timestamps)
```

**MVP:** All source types use the same fixed-size chunking (~500 chars with overlap). The strategy pattern is in place so type-specific chunking can be added later without changing any interfaces or use cases.

**Future commits for type-specific chunking:**
- `feat(chunking): add markdown heading-aware chunking strategy`
- `feat(chunking): add PDF page-based chunking strategy`
- `feat(chunking): add URL section-based chunking strategy`
- `feat(chunking): add YouTube timestamp-based chunking strategy`

---

### Phase 7: Presentation Layer

| File | Purpose |
|------|---------|
| `modules/sources/presentation/sources.validation.ts` | Zod schemas: create body, params (`:notebookId`, `:id`) |
| `modules/sources/presentation/sources.controller.ts` | Route handlers delegating to use cases |
| `modules/sources/presentation/sources.routes.ts` | Express Router + auth + validation middleware |

**API Endpoints (all nested under notebooks for consistent ownership validation):**
```
POST   /api/notebooks/:notebookId/sources          → create source
GET    /api/notebooks/:notebookId/sources          → list sources for notebook
GET    /api/notebooks/:notebookId/sources/:id      → get single source
DELETE /api/notebooks/:notebookId/sources/:id      → soft delete source
POST   /api/notebooks/:notebookId/sources/:id/retry → retry failed source
```

---

### Phase 8: Module Wiring

| File | Change |
|------|--------|
| `modules/sources/sources.factory.ts` | Wire: Repository → Services → Use Cases → Controller |
| `route-registry.ts` | Add `SourcesRoutes` instantiation + mount |

---

### Execution Order

1. Migration SQL (3 tables + indexes)
2. Domain entity (source only)
3. Repository (types → interface → implementation)
4. Shared services (chunking)
5. External services (embedding)
6. DTOs
7. Use cases (with active_source_count management)
8. Validation schemas
9. Controller
10. Routes
11. Factory
12. Route registry update
13. Verify build compiles (`npx tsc --noEmit`)

---

### Phase 1 Scope (MVP — what we build first)

Only **text** and **markdown** sources fully functional end-to-end:
- User adds text/markdown → content stored immediately → chunked → embedded → status: completed
- PDF/URL/YouTube → source created in `pending` status (processing deferred to later phases)
- All source types use fixed-size chunking (strategy pattern in place for future type-specific methods)

This gets the full RAG pipeline working for text input, which can then be extended to other source types by adding extraction logic per type.

---

### Commit Message Guide

Use these commit messages as you build each phase so git history is clean and navigable for future sub-features:

| Phase | Commit Message |
|-------|----------------|
| Migration | `feat(sources): create sources, source_contents, source_chunks tables` |
| Domain | `feat(sources): add source entity and enums` |
| Repository | `feat(sources): add sources repository with CRUD + chunk operations` |
| Chunking service | `feat(chunking): add fixed-size chunking service with strategy pattern` |
| Embedding service | `feat(embedding): add OpenAI embedding external service` |
| DTOs + Use cases | `feat(sources): add create, list, get, delete use cases` |
| Presentation | `feat(sources): add routes, controller, validation` |
| Wiring | `feat(sources): wire module into route registry` |
| Active count | `feat(sources): manage notebooks.active_source_count on status change` |

**Future sub-feature commits:**
| Feature | Commit Message |
|---------|----------------|
| PDF upload + extraction | `feat(sources): add PDF upload and text extraction` |
| URL scraping | `feat(sources): add URL content extraction via web scraper` |
| YouTube transcript | `feat(sources): add YouTube transcript extraction` |
| Markdown chunking | `feat(chunking): add markdown heading-aware chunking strategy` |
| PDF chunking | `feat(chunking): add PDF page-based chunking strategy` |
| URL chunking | `feat(chunking): add URL section-based chunking strategy` |
| YouTube chunking | `feat(chunking): add YouTube timestamp-based chunking strategy` |
| Re-process source | `feat(sources): add retry/re-process failed sources` |
