(() => {
  const DB_URL = "https://xhewdrhfofwpzfogthai.supabase.co";
  const DB_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhoZXdkcmhmb2Z3cHpmb2d0aGFpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc0MDM0OTMsImV4cCI6MjEwMjk3OTQ5M30.zch7bpyq2kaYaQeW4wMrQhkSPxyzzKKiD6jRLTWYidY";
  const SK = "bitcoinizate-sb";

  function loadSess() {
    try { return JSON.parse(localStorage.getItem(SK) || "null"); } catch (e) { return null; }
  }
  function saveSess(s) {
    if (!s || !s.access_token) localStorage.removeItem(SK);
    else localStorage.setItem(SK, JSON.stringify(s));
  }
  function authHeaders(token) {
    const t = token || (loadSess() && loadSess().access_token) || DB_KEY;
    return {
      apikey: DB_KEY,
      Authorization: "Bearer " + t,
      "Content-Type": "application/json"
    };
  }
  async function readJson(r) {
    const text = await r.text();
    let d = null;
    try { d = text ? JSON.parse(text) : null; } catch (e) { d = { msg: text }; }
    return d;
  }
  function apiError(d, fallback) {
    if (!d) return new Error(fallback);
    const msg = d.msg || d.error_description || d.error || d.message || fallback;
    return new Error(typeof msg === "string" ? msg : fallback);
  }

  function createClient() {
    async function takeUrlSession() {
      if (typeof location === "undefined") return;
      const hash = new URLSearchParams((location.hash || "").replace(/^#/, ""));
      const query = new URLSearchParams(location.search || "");
      const token = hash.get("access_token") || query.get("access_token");
      const refresh = hash.get("refresh_token") || query.get("refresh_token");
      const typ = hash.get("type") || query.get("type") || "";
      const code = query.get("code");
      const tokenHash = query.get("token_hash") || query.get("token");
      if (token) {
        const next = {
          access_token: token,
          refresh_token: refresh,
          expires_at: +(hash.get("expires_at") || query.get("expires_at") || 0) || Math.floor(Date.now() / 1000) + 3600,
          user: null,
          type: typ
        };
        saveSess(next);
        try {
          const ur = await fetch(DB_URL + "/auth/v1/user", { headers: authHeaders(next.access_token) });
          const u = await readJson(ur);
          if (ur.ok && u && u.id) { next.user = u; saveSess(next); }
        } catch (e) {}
        try { history.replaceState(null, "", location.pathname); } catch (e) {}
        return;
      }
      if (code) {
        try {
          const r = await fetch(DB_URL + "/auth/v1/token?grant_type=pkce", {
            method: "POST",
            headers: authHeaders(DB_KEY),
            body: JSON.stringify({ auth_code: code })
          });
          const d = await readJson(r);
          if (r.ok && d.access_token) {
            saveSess({
              access_token: d.access_token,
              refresh_token: d.refresh_token,
              expires_at: d.expires_at || Math.floor(Date.now() / 1000) + (d.expires_in || 3600),
              user: d.user,
              type: typ || "recovery"
            });
          }
        } catch (e) {}
        try { history.replaceState(null, "", location.pathname); } catch (e) {}
        return;
      }
      if (tokenHash && (typ === "recovery" || typ === "signup" || typ === "magiclink" || typ === "email")) {
        try {
          const r = await fetch(DB_URL + "/auth/v1/verify", {
            method: "POST",
            headers: authHeaders(DB_KEY),
            body: JSON.stringify({ type: typ || "recovery", token: tokenHash })
          });
          const d = await readJson(r);
          if (r.ok && (d.access_token || (d.session && d.session.access_token))) {
            const sess = d.session || d;
            saveSess({
              access_token: sess.access_token,
              refresh_token: sess.refresh_token,
              expires_at: sess.expires_at || Math.floor(Date.now() / 1000) + 3600,
              user: sess.user || d.user,
              type: typ || "recovery"
            });
          }
        } catch (e) {}
        try { history.replaceState(null, "", location.pathname); } catch (e) {}
      }
    }

    const auth = {
      async getSession() {
        await takeUrlSession();
        const s = loadSess();
        if (!s || !s.access_token) return { data: { session: null }, error: null };
        if (s.expires_at && s.expires_at * 1000 < Date.now() + 15000) {
          const ref = await auth.refresh();
          if (ref.error) return { data: { session: null }, error: ref.error };
        }
        const cur = loadSess();
        if (!cur) return { data: { session: null }, error: null };
        return { data: { session: { user: cur.user, access_token: cur.access_token, type: cur.type || "" } }, error: null };
      },
      async refresh() {
        const s = loadSess();
        if (!s || !s.refresh_token) {
          saveSess(null);
          return { data: { session: null }, error: new Error("No refresh token") };
        }
        try {
          const r = await fetch(DB_URL + "/auth/v1/token?grant_type=refresh_token", {
            method: "POST",
            headers: authHeaders(DB_KEY),
            body: JSON.stringify({ refresh_token: s.refresh_token })
          });
          const d = await readJson(r);
          if (!r.ok || !d.access_token) {
            saveSess(null);
            return { data: { session: null }, error: apiError(d, "Session expired") };
          }
          const next = {
            access_token: d.access_token,
            refresh_token: d.refresh_token || s.refresh_token,
            expires_at: d.expires_at || Math.floor(Date.now() / 1000) + (d.expires_in || 3600),
            user: d.user || s.user
          };
          saveSess(next);
          return { data: { session: next }, error: null };
        } catch (e) {
          return { data: { session: null }, error: e };
        }
      },
      async signUp({ email, password, options }) {
        try {
          const body = { email, password };
          if (options && options.data) body.data = options.data;
          const r = await fetch(DB_URL + "/auth/v1/signup", {
            method: "POST",
            headers: authHeaders(DB_KEY),
            body: JSON.stringify(body)
          });
          const d = await readJson(r);
          if (!r.ok || d.error || d.msg && !d.id && !d.user && !d.access_token) {
            return { data: { user: null, session: null }, error: apiError(d, "Sign up failed") };
          }
          const user = d.user || (d.id ? d : null);
          if (d.access_token) {
            saveSess({
              access_token: d.access_token,
              refresh_token: d.refresh_token,
              expires_at: d.expires_at || Math.floor(Date.now() / 1000) + (d.expires_in || 3600),
              user: user
            });
          }
          return { data: { user: user, session: d.access_token ? d : null }, error: null };
        } catch (e) {
          return { data: { user: null, session: null }, error: e };
        }
      },
      async signInWithPassword({ email, password }) {
        try {
          const r = await fetch(DB_URL + "/auth/v1/token?grant_type=password", {
            method: "POST",
            headers: authHeaders(DB_KEY),
            body: JSON.stringify({ email, password })
          });
          const d = await readJson(r);
          if (!r.ok || !d.access_token) {
            return { data: { user: null, session: null }, error: apiError(d, "Sign in failed") };
          }
          const sess = {
            access_token: d.access_token,
            refresh_token: d.refresh_token,
            expires_at: d.expires_at || Math.floor(Date.now() / 1000) + (d.expires_in || 3600),
            user: d.user
          };
          saveSess(sess);
          return { data: { user: d.user, session: sess }, error: null };
        } catch (e) {
          return { data: { user: null, session: null }, error: e };
        }
      },
      async resetPasswordForEmail(email, opts) {
        try {
          const redirectTo = (opts && opts.redirectTo) || (location.origin + location.pathname);
          const r = await fetch(DB_URL + "/auth/v1/recover", {
            method: "POST",
            headers: authHeaders(DB_KEY),
            body: JSON.stringify({ email, gotrue_meta_security: {}, redirect_to: redirectTo })
          });
          const d = await readJson(r);
          if (!r.ok) return { data: null, error: apiError(d, "Could not send reset mail") };
          return { data: {}, error: null };
        } catch (e) {
          return { data: null, error: e };
        }
      },
      async updateUser({ password }) {
        try {
          const s = loadSess();
          if (!s || !s.access_token) return { data: null, error: new Error("Not signed in") };
          const r = await fetch(DB_URL + "/auth/v1/user", {
            method: "PUT",
            headers: authHeaders(s.access_token),
            body: JSON.stringify({ password })
          });
          const d = await readJson(r);
          if (!r.ok) return { data: null, error: apiError(d, "Could not update password") };
          return { data: d, error: null };
        } catch (e) {
          return { data: null, error: e };
        }
      },
      async signOut() {
        const s = loadSess();
        try {
          if (s && s.access_token) {
            await fetch(DB_URL + "/auth/v1/logout", {
              method: "POST",
              headers: authHeaders(s.access_token)
            });
          }
        } catch (e) {}
        saveSess(null);
        return { error: null };
      }
    };

    function from(table) {
      const rest = (path, opt) => fetch(DB_URL + "/rest/v1/" + table + path, opt);
      return {
        select(cols) {
          return {
            order(col, opts) {
              return {
                limit(n) {
                  return {
                    then(ok, err) {
                      return (async () => {
                        try {
                          const q = "?select=" + encodeURIComponent(cols)
                            + "&order=" + col + "." + ((opts && opts.ascending) ? "asc" : "desc")
                            + "&limit=" + n;
                          const r = await rest(q, { headers: authHeaders() });
                          const d = await readJson(r);
                          if (!r.ok) return { data: null, error: apiError(d, "Select failed") };
                          return { data: Array.isArray(d) ? d : [], error: null };
                        } catch (e) { return { data: null, error: e }; }
                      })().then(ok, err);
                    }
                  };
                }
              };
            },
            eq(field, val) {
              return {
                single: async () => {
                  try {
                    const r = await rest("?" + field + "=eq." + encodeURIComponent(val) + "&select=" + encodeURIComponent(cols), {
                      headers: Object.assign({ Accept: "application/vnd.pgrst.object+json" }, authHeaders())
                    });
                    const d = await readJson(r);
                    if (!r.ok) return { data: null, error: apiError(d, "Not found") };
                    return { data: d, error: null };
                  } catch (e) { return { data: null, error: e }; }
                }
              };
            },
            ilike(field, val) {
              return {
                limit(n) {
                  return {
                    then(ok, err) {
                      return (async () => {
                        try {
                          const q = "?select=" + encodeURIComponent(cols)
                            + "&" + field + "=ilike." + encodeURIComponent(val)
                            + "&limit=" + (n || 1);
                          const r = await rest(q, { headers: authHeaders() });
                          const d = await readJson(r);
                          if (!r.ok) return { data: null, error: apiError(d, "Select failed") };
                          return { data: Array.isArray(d) ? d : [], error: null };
                        } catch (e) { return { data: null, error: e }; }
                      })().then(ok, err);
                    }
                  };
                }
              };
            }
          };
        },
        update(fields) {
          return {
            eq(field, val) {
              return {
                then(ok, err) {
                  return (async () => {
                    try {
                      const r = await rest("?" + field + "=eq." + encodeURIComponent(val), {
                        method: "PATCH",
                        headers: Object.assign({ Prefer: "return=representation" }, authHeaders()),
                        body: JSON.stringify(fields)
                      });
                      const d = await readJson(r);
                      if (!r.ok) return { data: null, error: apiError(d, "Update failed") };
                      return { data: d, error: null };
                    } catch (e) { return { data: null, error: e }; }
                  })().then(ok, err);
                }
              };
            }
          };
        },
        insert(arr) {
          return {
            then(ok, err) {
              return (async () => {
                try {
                  const r = await rest("", {
                    method: "POST",
                    headers: Object.assign({ Prefer: "return=representation" }, authHeaders()),
                    body: JSON.stringify(arr)
                  });
                  const d = await readJson(r);
                  if (!r.ok) return { data: null, error: apiError(d, "Insert failed") };
                  return { data: d, error: null };
                } catch (e) { return { data: null, error: e }; }
              })().then(ok, err);
            }
          };
        }
      };
    }

    async function rpc(name, args) {
      try {
        const r = await fetch(DB_URL + "/rest/v1/rpc/" + encodeURIComponent(name), {
          method: "POST",
          headers: authHeaders(),
          body: JSON.stringify(args || {})
        });
        const d = await readJson(r);
        if (!r.ok) return { data: null, error: apiError(d, "RPC failed") };
        return { data: d, error: null };
      } catch (e) {
        return { data: null, error: e };
      }
    }

    return { auth, from, rpc };
  }

  const g = typeof globalThis !== "undefined" ? globalThis : window;
  g.supabase = g.supabase || {};
  g.supabase.createClient = createClient;
})();
