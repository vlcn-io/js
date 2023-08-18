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

10,000 per second. So still quick even transferring 500 rows of JSON.
Diffing slows us down if we want to preserve ref equality. 10k per second -> ~7.5 k.
of course this will change with dataset size.

10k per second is 166 per 16ms or per frame.
1722 TPS is is ~ 30 per frame. 30 active queries per frame 🤔
Well we batch all reads in a single TX so its faster.

How many selects can we do in a single batch in non-exclusive idbbatch vs exclusive over worker idbbatch?

Increasing JSON size is a linear slow down. 10x the payload, 10x slower.
So we could do query caching in the worker... and send diffs to the client.
Client would of course need a query cache too.

Async mutex is a big hit itself. 35k ops -> 27k ops

All read queries though will be a single tx since we batch into a single tx when re-rendering.

---

Numbers:
16k iterations per second, just with worker code and sychronization.
Add SQLite... even with a single tx, maybe we're at 10k iterations per second

10k iterations per second is 167 iterations per frame.

167 active queries if every query is re-run on every mutation.

But then there's rendering and other things in the budget. It isn't just a query budget.
So many half queries half rendering?
~85 active queries.

This number can be hit in Strut with slide previews and a hundred slides.

1. Paginate slide well
2. Fetch data aggregates? rather than points?
3. Smarter RX via pre-update hook?

- Aggregate fetch will cause re-renders unless we keep reference equality which would have to be done via diff.
  Diffing slows down our tps as well. Hash based diffing rather than shallow compare?

- Smarter rx... we can know the rowids of what was returned and not re-run. Order by would kill us here..
  What position does the new row go in?

We can safely not run point queries. Anything with `where id = ` but we'd need to know that it is the pk being used...

-> update all the things via pre-update hook
-> re-run queries against _those rows only_ to see if they still match the query, joining in things as needed.
-> e.g., flat tbl|rowid indexed structure that is updated by pre-update hooks. Structure has pointers to projections/queries used in. Queries run against updated row to determine whether or not still included.

---

Relevant files:
https://github.com/rhashimoto/wa-sqlite/blob/master/demo/ahp-worker.js#L83C49-L83C63
https://github.com/rhashimoto/wa-sqlite/blob/master/demo/SharedService-sw/SharedService.js
https://github.com/rhashimoto/wa-sqlite/blob/master/demo/ahp-demo.js
