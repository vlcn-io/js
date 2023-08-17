/**
 * Represents a "connection" from a client tab/worker to the Ahp DB
 *
 * Hmm. we also have to solve prepared statement cleanup.
 *
 * Prepared statements will reside in the worker now.
 *
 * A tab could die before closing its prepared statements.. how might we know?
 * The message port we hold would be closed? In which case we can reclaim all statements?
 */

export default class AhpConnection {
  constructor() {}
}
