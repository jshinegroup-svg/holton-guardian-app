"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProgressRepository = void 0;
const types_1 = require("./types");
/** One instance per child. Local pending writes survive a failed request/reload.
 * Conflicts must be surfaced; never substitute the newest server revision and retry old state.
 */
class ProgressRepository {
    familyId;
    childId;
    local;
    cloud;
    newId;
    key;
    busy = false;
    constructor(familyId, childId, local, cloud, newId) {
        this.familyId = familyId;
        this.childId = childId;
        this.local = local;
        this.cloud = cloud;
        this.newId = newId;
        this.key = (0, types_1.childStorageKey)(familyId, childId);
    }
    async cached() {
        const raw = await this.local.getItem(this.key);
        if (!raw)
            return null;
        const data = JSON.parse(raw);
        if (data.schema !== 2 || !Number.isSafeInteger(data.revision) || data.revision < 0 || !data.state)
            throw Error('invalid_local_save');
        return data;
    }
    async load() {
        const cached = await this.cached();
        // Never overwrite unsent progress by loading an older cloud snapshot.
        if (cached?.pending)
            return { ...cached, pending: true };
        const saved = await this.cloud.load(this.childId);
        if (!saved)
            return cached ? { ...cached, pending: false } : null;
        if (saved.familyId !== this.familyId || saved.childId !== this.childId)
            throw Error('save_owner_mismatch');
        await this.local.setItem(this.key, JSON.stringify({ schema: 2, revision: saved.revision, state: saved.state }));
        return { state: saved.state, revision: saved.revision, pending: false };
    }
    async save(state, events = []) {
        if (this.busy)
            throw Error('save_in_progress');
        this.busy = true;
        try {
            const previous = await this.cached();
            if (previous?.pending)
                throw Error('pending_save_requires_retry');
            const pending = { operationId: this.newId(), expectedRevision: previous?.revision ?? 0, state, events };
            const next = { schema: 2, revision: pending.expectedRevision, state, pending };
            await this.local.setItem(this.key, JSON.stringify(next));
            await this.flush(next);
        }
        finally {
            this.busy = false;
        }
    }
    async retry() {
        if (this.busy)
            throw Error('save_in_progress');
        this.busy = true;
        try {
            const cached = await this.cached();
            if (cached?.pending)
                await this.flush(cached);
        }
        finally {
            this.busy = false;
        }
    }
    async flush(cached) {
        const p = cached.pending;
        const result = await this.cloud.save({ childId: this.childId, ...p });
        if (result.revision !== p.expectedRevision + 1)
            throw Error('unexpected_revision');
        await this.local.setItem(this.key, JSON.stringify({ schema: 2, revision: result.revision, state: p.state }));
    }
}
exports.ProgressRepository = ProgressRepository;
