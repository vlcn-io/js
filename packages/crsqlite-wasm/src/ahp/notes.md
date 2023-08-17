Is it worth moving to this?

webapps likely want many transactions per second rather than high throughput in a single transaction.
IDBBatchAtomicRelaxed has much better TPS from the looks of it: https://user-images.githubusercontent.com/156154/235808963-90b1d3df-4dea-4038-bd35-f582ba9fa14d.png

Maybe we could do exclusive mode and a shared idbbatchatomic in a worker? This is similar-ish to AHP given we have to multiplex all callers onto the same DB.

Here we are:
https://github.com/rhashimoto/wa-sqlite/discussions/81#discussioncomment-5675533

Exclusive IDBBatchAtomicVFS: 1722.2 TPS on Roy's hardware.

Maybe we can... shared service over idbbatchatomicvfs?
We need shared service given the android constraints :\
We should test weblock acquisition time.. and perf impact there... first. and worker post rtrip

Since, in reality, an exclusive idbbatchatomic would require:

1. Weblock acquisition in calling tab on tx start -- wait, you could not do this and just release
   all txns on port closure like you do for cleaning up prepared statements.

So:

1. async mutex acquisition in caller tab to serialize tx statements
2. message pass to worker
3. message pass back to tab

How many of these per second?

All read queries though will be a single tx since we batch into a single tx when re-rendering.

---

Relevant files:
https://github.com/rhashimoto/wa-sqlite/blob/master/demo/ahp-worker.js#L83C49-L83C63
https://github.com/rhashimoto/wa-sqlite/blob/master/demo/SharedService-sw/SharedService.js
https://github.com/rhashimoto/wa-sqlite/blob/master/demo/ahp-demo.js
