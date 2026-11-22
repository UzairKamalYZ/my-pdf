/* Worker for pdf.kamtechsolutions.eu: serves the static site (index.html, assets/).
   It has no logic of its own. It is kept because the Durable Object that held the old visitor
   counter (removed in v1.3.0) is deleted by a migration in wrangler.jsonc, which needs a Worker. */
export default {
  fetch(request, env) {
    return env.ASSETS.fetch(request);
  },
};
