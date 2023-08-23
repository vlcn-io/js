export interface IWriteForwarder {
  // forwards the AnnouncePresence write.
  // Blocks the caller until the local db has replicated up to the changes
  // made by the forwarded write.
  announcePresence(): Promise<void>;

  // forwards the Changes write.
  // Does not block the caller as the caller does not
  // need to post a response or read the db.
  changes(): Promise<void>;
}
