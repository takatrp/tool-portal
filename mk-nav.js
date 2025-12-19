(() => {
  const DEFAULT_PORTAL = 'https://takatrp.github.io/tool-portal/';

  const safeGet = (k) => { try { return localStorage.getItem(k); } catch (e) { return null; } };
  const safeSet = (k, v) => { try { localStorage.setItem(k, v); } catch (e) {} };

  const strip = (u) => {
    try {
      const x = new URL(u, location.href);
      return x.origin + x.pathname;
    } catch (e) {
      return u;
    }
  };

  const sameHostOk = (u) => {
    try {
      const x = new URL(u, location.href);
      return x.hostname.endsWith('github.io');
    } catch (e) { return false; }
  };

  const withPortalParam = (u, portal) => {
    try {
      const x = new URL(u);
      x.searchParams.set('portal', portal);
      x.searchParams.set('from', 'tool-nav');
      return x.toString();
    } catch (e) {
      return u;
    }
  };

  // portal
  const params = new URLSearchParams(location.search);
  let portal = params.get('portal') || safeGet('mk_portal_url') || DEFAULT_PORTAL;
  if (!portal.endsWith('/')) portal += '/';
  safeSet('mk_portal_url', portal);

  // next: URL param first, else mk_flow
  let next = params.get('next');

  if (!next) {
    let flow = null;
    try { flow = JSON.parse(safeGet('mk_flow') || 'null'); } catch (e) { flow = null; }

    if (Array.isArray(flow) && flow.length) {
      const here = strip(location.href);
      let idx = -1;

      for (let i = 0; i < flow.length; i++) {
        if (strip(flow[i]) === here) { idx = i; break; }
      }

      if (idx < 0) {
        const saved = parseInt(safeGet('mk_flow_i') || '0', 10);
        if (!Number.isNaN(saved)) idx = saved;
      }

      if (idx >= 0 && idx < flow.length - 1) {
        next = flow[idx + 1];
        safeSet('mk_flow_i', String(idx));
      }
    }
  }

  // style
  const css = `
    :root{ --mk-brand:#578899; --mk-line:#e2e8f0; --mk-ink:#0f172a; --mk-muted:#64748b; }
    .mk-nav{position:fixed; left:0; right:0; bottom:0; z-index:999;
      padding:10px 12px calc(10px + env(safe-area-inset-bottom));
      background:rgba(255,255,255,.92); border-top:1px solid var(--mk-line);
      backdrop-filter:saturate(180%) blur(10px);
    }
    .mk-nav .inner{max-width:1100px; margin:0 auto; display:flex; gap:10px; align-items:center; justify-content:space-between;}
    .mk-nav .left{display:flex; flex-direction:column; gap:2px; min-width:0;}
    .mk-nav .brand{font-weight:900; color:var(--mk-ink); font-size:13px; line-height:1.2;}
    .mk-nav .hint{font-size:11px; color:var(--mk-muted); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; line-height:1.2;}
    .mk-nav .btns{display:flex; gap:8px; flex:0 0 auto;}
    .mk-nav a{display:inline-flex; align-items:center; justify-content:center; height:36px; padding:0 12px;
      border-radius:12px; border:1px solid var(--mk-line); text-decoration:none; font-weight:900;
      color:var(--mk-ink); background:#fff;
    }
    .mk-nav a.primary{border-color:transparent; background:linear-gradient(135deg, var(--mk-brand) 0%, #7aa5b4 100%); color:#fff;}
    .mk-nav a:active{transform:translateY(1px);}
    @media (max-width:420px){ .mk-nav .hint{display:none;} .mk-nav a{height:34px; padding:0 10px; font-size:12px;} }
  `;
  const style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);

  const pad = document.createElement('style');
  pad.textContent = `body{ padding-bottom: calc(62px + env(safe-area-inset-bottom)); }`;
  document.head.appendChild(pad);

  // DOM
  const nav = document.createElement('div');
  nav.className = 'mk-nav';
  nav.setAttribute('role', 'navigation');
  nav.innerHTML = `
    <div class="inner">
      <div class="left">
        <div class="brand">松本会計ツール</div>
        <div class="hint">ポータルへ戻る／次のおすすめへ</div>
      </div>
      <div class="btns">
        <a href="${portal}" id="mk-back">← ポータル</a>
        <a href="#" id="mk-next" class="primary" style="display:none;">次へ →</a>
      </div>
    </div>
  `;
  document.body.appendChild(nav);

  // wire next
  const nextBtn = nav.querySelector('#mk-next');
  if (next && sameHostOk(next)) {
    const nextUrl = withPortalParam(next, portal);
    nextBtn.href = nextUrl;
    nextBtn.style.display = '';

    nextBtn.addEventListener('click', () => {
      try {
        const flow = JSON.parse(safeGet('mk_flow') || 'null');
        if (Array.isArray(flow) && flow.length) {
          const here = strip(location.href);
          let idx = -1;
          for (let i = 0; i < flow.length; i++) { if (strip(flow[i]) === here) { idx = i; break; } }
          if (idx >= 0) safeSet('mk_flow_i', String(Math.min(idx + 1, flow.length - 1)));
        }
      } catch (e) {}
    }, { passive: true });
  }
})();
