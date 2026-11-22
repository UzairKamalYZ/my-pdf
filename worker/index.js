/* Worker for pdf.kamtechsolutions.eu: serves the static site and the visitor counter.

   GET  /api/count  -> {"value": n}        read the total
   POST /api/count  -> {"value": n + 1}    a browser's first visit (the page remembers in
                                           localStorage that it was counted, so it posts once)

   The total lives in one Durable Object. The first time it starts it copies the total from the
   Abacus counter the site used before, so the count carries on instead of restarting at zero. */
import { DurableObject } from 'cloudflare:workers';

const OLD_COUNTER = 'https://abacus.jasoncameron.dev/get/kamtechsolutions.eu/fill-and-sign-users';
const FALLBACK_START = 23;  // the old counter's total when this was set up, used if it can't be reached

export class Counter extends DurableObject {
  constructor(ctx, env) {
    super(ctx, env);
    // Runs before any request reaches this object, so the starting value is set exactly once.
    ctx.blockConcurrencyWhile(async () => {
      this.total = await ctx.storage.get('total');
      if (typeof this.total !== 'number') {
        this.total = await importOldTotal();
        await ctx.storage.put('total', this.total);
      }
    });
  }
  read() { return this.total; }
  async add() {
    this.total += 1;
    await this.ctx.storage.put('total', this.total);
    return this.total;
  }
}

async function importOldTotal() {
  try {
    const r = await fetch(OLD_COUNTER, { signal: AbortSignal.timeout(10000) });
    const { value } = await r.json();
    if (Number.isInteger(value) && value >= FALLBACK_START) return value;
  } catch (e) { /* old service slow or down: use the fallback */ }
  return FALLBACK_START;
}

const json = (body, status = 200, extra = {}) =>
  Response.json(body, { status, headers: { 'cache-control': 'no-store', ...extra } });

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === '/api/count') {
      const counter = env.COUNTER.get(env.COUNTER.idFromName('fill-and-sign-users'));
      if (request.method === 'GET') return json({ value: await counter.read() });
      if (request.method === 'POST') return json({ value: await counter.add() });
      return json({ error: 'method not allowed' }, 405, { allow: 'GET, POST' });
    }
    return env.ASSETS.fetch(request);
  },
};
