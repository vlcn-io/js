// We don't have to write it at this layer.
// The easier route would be to do it in the websocket layer.
// If we receive a message type that is a write, just forward it to the primary
// and return the primaries repsonse.

/**
 * Expose http endpoints to receive writes from non-primary nodes
 *
 * Should be attachable to nodejs / whatever server.
 */

export const endpoints = {
  createDb() {},
  // How will we ensure all other connections on all other replicas are torn down on migrate?
  // We can check `schema_version` pragma
  applySchema() {},
  applyChangesetAndSetLastSeen() {},
};
