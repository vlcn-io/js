export const util = {
  /**
   * Do we need to forward writes for the given room?
   * @param room
   */
  async shouldForwardWrites(room: string): Promise<boolean> {
    return false;
  },
};
