Additional prep for litefs:

- Need a DB implementation for LiteFS
  - On write request, check if we're primary
  - If primary, check if write stmts are prepred
    - If not, prep them
    - If so, ok
      --- no need to check, we can prepare write statements on readonly db. Just can't run them. Woo.
  - If not primary, read `.primary`
    - forward write to endpoint on server that'll accept it

https://github.com/vlcn-io/js/blob/322daec57acd2a75cf209718e4ac9f083d985370/js/packages
https://github.com/vlcn-io/js/tree/4e737a078cb1f3226d35e163b77bd3ea56926be9/js/packages/client-websocket
