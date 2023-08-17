/**
 * - We have a single connection to the DB
 * - Many tabs may have "connections" to multiplex onto this single connection
 * - We need a connection abstraction to manage these multiplexed connections such that we can isolate them
 *
 * Do we need connection isolation or just tx isolation?
 *
 * We could dump the connection abstraction if we provide tx abstraction.
 *
 * tx is open then we need to acquire a tx lock.
 * But tab could get killed while holding the tx lock... so have a timeout?
 *  or use navigator locks? What is the perf hit of navigator locks?
 *
 *
 */
