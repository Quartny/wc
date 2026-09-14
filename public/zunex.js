(function (window, document) {
  var config = { inBuild: 'off' };
  var runtime = window.Zunex || {};
  var wallets = new Map();
  var providers = new Map();
  var account = null;
  var mounted = false;
  var inBuildLoad = null;
  var inBuild = { uuid: 'zunex-inbuild', name: 'Zunex InBuild Wallet', rdns: 'cdn.zunex.wallet', icon: 'zunex' };
  var copyIcon = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M0 0h16v16H0z" fill="none"/><path d="M5 6H4a1 1 0 0 0-1 1v5a1 1 0 0 0 1 1h4a1 1 0 0 0 1-1h1a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h1zm7-4a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2zM8 3a1 1 0 0 0-1 1v5a1 1 0 0 0 1 1h4a1 1 0 0 0 1-1V4a1 1 0 0 0-1-1z"/></svg>';
  var chevronIcon = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m12 17.59l-4.29-4.3l-1.42 1.42l5.71 5.7l-5.71 5.7l-1.42-1.42z"/></svg>';
    var closeIcon = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M0 0h16v16H0z" fill="none"/><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"><path d="m10.25 5.75-4.5 4.5m0-4.5 4.5 4.5"/><circle cx="8" cy="8" r="6.25"/></g></svg>';
    var inBuildIcon = '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M0 0h20v20H0z" fill="none"/><path fill="currentColor" d="M1 4.25a3.73 3.73 0 0 1 2.25-.75h13.5c.844 0 1.623.279 2.25.75A2.25 2.25 0 0 0 16.75 2H3.25A2.25 2.25 0 0 0 1 4.25m0 3a3.73 3.73 0 0 1 2.25-.75h13.5c.844 0 1.623.279 2.25.75A2.25 2.25 0 0 0 16.75 5H3.25A2.25 2.25 0 0 1 1 7.25M7 8a1 1 0 0 1 1 1a2 2 0 1 0 4 0a1 1 0 0 1 1-1h3.75A2.25 2.25 0 0 1 19 10.25v5.5A2.25 2.25 0 0 1 16.75 18H3.25A2.25 2.25 0 0 1 1 15.75v-5.5A2.25 2.25 0 0 1 3.25 8z"/></svg>';
    var externalIcon = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M0 0h24v24H0z" fill="none"/><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m13 8l4 4l-4 4M7 8l4 4l-4 4"/></svg>';

  function escapeHtml(value) { return String(value).replace(/[&<>"']/g, function (char) { return ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#039;' })[char]; }); }
  function shortAddress(value) { return value.length > 10 ? value.slice(0, 5) + '...' + value.slice(-5) : value; }
  function getWallets() { return Array.from(wallets.values()).concat(config.inBuild === 'on' ? [inBuild] : []); }
  function findBrowserInBuildProvider() { return window.ZunexInBuildProvider || window.inBuildProvider || window.ethereum; }
  function loadInBuildProvider() {
    var browserProvider = window.Zunex.inBuildProvider || findBrowserInBuildProvider();
    if (browserProvider) return Promise.resolve(browserProvider);
    if (inBuildLoad) return inBuildLoad;
    var source = config.inBuildSrc || runtime.inBuildSrc;
    if (!source) return Promise.reject(new Error('No browser InBuild wallet found. Set inBuildSrc to load one.'));
    inBuildLoad = new Promise(function (resolve, reject) {
      var script = document.querySelector('script[data-zunex-inbuild]') || document.createElement('script');
      script.onload = function () {
        var provider = window.Zunex.inBuildProvider || window.ZunexInBuildProvider;
        if (provider) resolve(provider);
        else reject(new Error('InBuild provider loaded without an EIP-1193 provider.'));
      };
      script.onerror = function () { reject(new Error('Could not load the InBuild provider. Set conf.inBuildSrc to its CDN URL.')); };
      if (!script.parentNode) {
        script.src = source;
        script.async = true;
        script.dataset.zunexInbuild = 'true';
        document.head.appendChild(script);
      }
    }).catch(function (error) { inBuildLoad = null; throw error; });
    return inBuildLoad;
  }
  function addStyles() {
    if (document.getElementById('zunex-runtime-styles')) return;
    var style = document.createElement('style');
    style.id = 'zunex-runtime-styles';
    style.textContent = '.zunex-account-menu{position:relative}.zunex-account-button{display:flex;align-items:center;gap:8px;padding:11px 15px;border:1px solid rgba(131,216,208,.3);border-radius:999px;background:rgba(131,216,208,.13);color:#83d8d0;font:12px monospace;cursor:pointer}.zunex-dot{width:7px;height:7px;border-radius:50%;background:#83d8d0}.zunex-chevron{width:16px;height:16px;fill:currentColor}.zunex-popover{position:absolute;z-index:20;top:calc(100% + 12px);right:0;width:270px;padding:14px;border:1px solid rgba(255,255,255,.18);border-radius:14px;background:rgba(16,21,39,.97);box-shadow:0 18px 45px rgba(0,0,0,.32)}.zunex-popover[hidden]{display:none}.zunex-blockie{display:block;width:100%;height:92px;object-fit:cover;border-radius:9px;background:#252d44}.zunex-full-address{display:flex;flex-direction:column;gap:7px;padding:14px 2px}.zunex-full-address span{color:#9294a2;font:10px monospace;text-transform:uppercase}.zunex-full-address strong{overflow-wrap:anywhere;color:#f5f3ec;font:11px/1.5 monospace}.zunex-actions{display:flex;gap:8px;border-top:1px solid rgba(255,255,255,.12);padding-top:12px}.zunex-icon-action{display:grid;width:38px;height:34px;place-items:center;border:1px solid rgba(255,255,255,.12);border-radius:7px;background:rgba(255,255,255,.04);color:#83d8d0;cursor:pointer}.zunex-icon-action svg{width:17px;height:17px;fill:currentColor}.zunex-disconnect{color:#ff785f}.zunex-backdrop{position:fixed;z-index:30;inset:0;display:grid;place-items:center;padding:20px;background:rgba(3,5,12,.78);backdrop-filter:blur(15px)}.zunex-modal{width:min(100%,450px);padding:30px;border:1px solid rgba(255,255,255,.2);border-radius:18px;background:linear-gradient(145deg,rgba(34,42,67,.94),rgba(12,16,31,.98));color:#f5f3ec}.zunex-modal-head{display:flex;justify-content:space-between}.zunex-modal h2{margin:0;font:700 28px sans-serif;letter-spacing:-1px}.zunex-close{display:grid;width:32px;height:32px;place-items:center;border:1px solid rgba(255,255,255,.12);border-radius:50%;background:rgba(255,255,255,.05);color:inherit;cursor:pointer}.zunex-close svg{width:18px;height:18px}.zunex-subtitle{margin:9px 0 23px;color:#9294a2;font:12px sans-serif}.zunex-wallet-list{display:grid;gap:9px}.zunex-wallet{display:flex;align-items:center;gap:13px;width:100%;padding:14px;border:1px solid rgba(255,255,255,.12);border-radius:10px;background:rgba(255,255,255,.055);color:#f5f3ec;text-align:left;cursor:pointer}.zunex-wallet-icon{display:grid;width:39px;height:39px;flex:0 0 39px;place-items:center;overflow:hidden;border-radius:11px;background:#31384e;font-weight:800}.zunex-wallet-icon img{width:100%;height:100%;object-fit:cover}.zunex-wallet-icon svg{width:21px;height:21px;fill:currentColor}.zunex-inbuild{color:#06141b;background:#83d8d0}.zunex-wallet-info{display:flex;flex:1;flex-direction:column;gap:4px}.zunex-wallet-info strong{font:700 13px sans-serif}.zunex-arrow{display:grid;place-items:center;color:#ff785f}.zunex-arrow svg{width:20px;height:20px}.zunex-empty{padding:27px 18px;border:1px dashed rgba(255,255,255,.2);border-radius:10px;color:#9294a2;text-align:center;font:13px sans-serif}.zunex-empty small{display:block;margin-top:8px;font:10px/1.6 monospace}.zunex-error{margin:14px 0 0;color:#ff785f;font:11px sans-serif}@media(max-width:780px){.zunex-popover{right:-8px;width:min(270px,calc(100vw - 40px))}.zunex-modal{padding:24px}}';
    document.head.appendChild(style);
  }
  function walletIcon(wallet) { return wallet.icon === 'zunex' ? '<span class="zunex-wallet-icon zunex-inbuild">' + inBuildIcon + '</span>' : '<span class="zunex-wallet-icon">' + (wallet.icon ? '<img src="' + escapeHtml(wallet.icon) + '" alt="">' : escapeHtml(wallet.name.slice(0, 1))) + '</span>'; }
  function mount(options) {
    if (mounted) return;
    mounted = true;
    addStyles();
    var slot = document.getElementById(options.accountSlot || 'account-slot');
    var modalRoot = document.getElementById(options.modalRoot || 'modal-root');
    var count = document.getElementById(options.count || 'wallet-count');
    function closeModal() { modalRoot.innerHTML = ''; }
    function renderAccount() {
      if (!account) { slot.innerHTML = '<button class="connect-button compact" data-zunex-open>Connect wallet <span>↗</span></button>'; slot.querySelector('[data-zunex-open]').onclick = openModal; return; }
      slot.innerHTML = '<div class="zunex-account-menu"><button class="zunex-account-button" data-toggle><span class="zunex-dot"></span>' + escapeHtml(shortAddress(account.address)) + chevronIcon + '</button><div class="zunex-popover" data-popover hidden><img class="zunex-blockie" src="https://blockies.vercel.app/address:' + encodeURIComponent(account.address) + '" alt="Wallet identicon"><div class="zunex-full-address"><span>Connected wallet</span><strong>' + escapeHtml(account.address) + '</strong></div><div class="zunex-actions"><button class="zunex-icon-action" data-copy aria-label="Copy address">' + copyIcon + '</button><button class="zunex-icon-action zunex-disconnect" data-disconnect aria-label="Disconnect wallet">↪</button></div></div></div>';
      slot.querySelector('[data-toggle]').onclick = function () { var popover = slot.querySelector('[data-popover]'); popover.hidden = !popover.hidden; };
      slot.querySelector('[data-copy]').onclick = function () { if (navigator.clipboard) navigator.clipboard.writeText(account.address); };
      slot.querySelector('[data-disconnect]').onclick = function () { account = null; renderAccount(); };
      document.addEventListener('pointerdown', function closeAccount(event) {
        if (!slot.contains(event.target)) {
          var popover = slot.querySelector('[data-popover]');
          if (popover) popover.hidden = true;
        }
      });
    }
    function connect(uuid) {
      var error = modalRoot.querySelector('[data-error]');
      var providerPromise = uuid === inBuild.uuid ? loadInBuildProvider() : Promise.resolve(providers.get(uuid));
      providerPromise.then(function (provider) {
        if (!provider) throw new Error('Open the wallet extension and try again.');
        return provider.request({ method: 'eth_requestAccounts' });
      }).then(function (accounts) { account = { address: accounts[0] }; closeModal(); renderAccount(); }).catch(function (reason) { error.textContent = reason.message || 'Could not connect to this wallet.'; });
    }
    function openModal() {
      var list = getWallets();
      modalRoot.innerHTML = '<div class="zunex-backdrop" data-backdrop><section class="zunex-modal" role="dialog" aria-modal="true"><div class="zunex-modal-head"><h2>Connect a wallet</h2><button class="zunex-close" data-close aria-label="Close">' + closeIcon + '</button></div><p class="zunex-subtitle">Choose an installed wallet to continue.</p><div class="zunex-wallet-list">' + (list.length ? list.map(function (wallet) { return '<button class="zunex-wallet" data-wallet="' + escapeHtml(wallet.uuid) + '">' + walletIcon(wallet) + '<span class="zunex-wallet-info"><strong>' + escapeHtml(wallet.name) + '</strong></span><span class="zunex-arrow">' + externalIcon + '</span></button>'; }).join('') : '<div class="zunex-empty"><strong>No wallet extensions found</strong><small>Install a compatible wallet extension, then reopen this panel.</small></div>') + '</div><p class="zunex-error" data-error></p></section></div>';
      modalRoot.querySelector('[data-close]').onclick = closeModal;
      modalRoot.querySelector('[data-backdrop]').onclick = function (event) { if (event.target === event.currentTarget) closeModal(); };
      modalRoot.querySelectorAll('[data-wallet]').forEach(function (button) { button.onclick = function () { connect(button.dataset.wallet); }; });
    }
    renderAccount();
    document.querySelectorAll('[data-zunex-open]').forEach(function (button) { button.onclick = openModal; });
    if (count) count.textContent = wallets.size || '—';
    window.addEventListener('eip6963:announceProvider', function (event) { var detail = event.detail; if (!detail || !detail.info || !detail.provider) return; wallets.set(detail.info.uuid, detail.info); providers.set(detail.info.uuid, detail.provider); if (count) count.textContent = wallets.size; });
    window.dispatchEvent(new Event('eip6963:requestProvider'));
  }
  runtime.conf = { get: function () { return config; }, set: function (next) { config = Object.assign({}, config, next); window.dispatchEvent(new CustomEvent('zunex:config', { detail: config })); } };
  runtime.mount = mount;
  window.Zunex = runtime;
}(window, document));
