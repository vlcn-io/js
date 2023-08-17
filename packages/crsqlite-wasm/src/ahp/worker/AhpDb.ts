/**
 * Represents _the_ DB rather than a connection to the DB.
 *
 * - Query cache should be done in-process by clients
 * - update hook only notifies across the worker boundary on transaction commit
 *
 * transactions acquire web locks?
 *
 * Lock against which statements are serialized.
 * When TX is opened, sub-lock
 *
 * New TX acquires current lock, makes new lock.
 * Queries use new lock. Sub-tx's use new lock and nest another.
 *
 * This is how current DB works.
 *
 * But.. what if a tab dies before closing the tx?
 * The lock is across boundaries. WebLocks to make this possible?
 * The tab somehow acquiring it when creating the tx rather than the ahp managing it?
 *
 * So locks must be deterministically named?
 *
 * Or just 1 lock for the DB and the _tab itself_ manages nested transaction locking?
 * I think this makes sense since the tab itself would correctly serialize its own calls.
 *
 * Then if a tab dies, its locks are released and new tabs can roll back pending transactions
 * once they acquire access.
 *
 * ---
 *
 * Can we do it w/o a lock?
 *
 * Many tabs all sending queries.
 * If those queries are not part of transactions that is fine. They get placed on the queue and run.
 *
 * If those queries open transactions... Many statements will be interleaved with other tab's transactions.
 *
 * We must avoid this.
 *
 * A tx id could do it. Place queries into txid groups. But if the txid is never closed then the db is forever
 * held.
 *
 * navigator locks are the only way.
 *
 * The AhpDb will assumed it is being used correctly by clients and just execute statements, with the exception of checking for
 * `get_autocommit` to see if a tab failed to close a tx when a new tab starts.
 *
 * Ok, so tab identifier must be present and prev_tab identifier so we know when control passes to a new tab or worker.
 */
export default class AhpDb {}
