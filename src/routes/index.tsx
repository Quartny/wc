import { component$, $, useSignal, useVisibleTask$ } from '@builder.io/qwik';

type WalletInfo = { uuid: string; name: string; rdns?: string; icon?: string };
type Eip1193Provider = { request: (args: { method: string; params?: unknown[] }) => Promise<unknown> };
type AnnounceDetail = { info: WalletInfo; provider: Eip1193Provider };
type InBuildProvider = Eip1193Provider | undefined;

const providers = new Map<string, Eip1193Provider>();
const inBuildWallet: WalletInfo = { uuid: 'zunex-inbuild', name: 'Zunex InBuild Wallet', rdns: 'cdn.zunex.wallet', icon: 'zunex' };

export default component$(() => {
  const wallets = useSignal<WalletInfo[]>([]);
  const connected = useSignal<string | null>(null);
  const address = useSignal('');
  const showModal = useSignal(false);
  const showAccount = useSignal(false);
  const connecting = useSignal(false);
  const error = useSignal('');

  useVisibleTask$(({ cleanup }) => {
    const syncInBuild = () => {
      const inBuildEnabled = window.Zunex?.conf?.get()?.inBuild === 'on';
      wallets.value = inBuildEnabled
        ? [inBuildWallet, ...wallets.value.filter((item) => item.uuid !== inBuildWallet.uuid)]
        : wallets.value.filter((item) => item.uuid !== inBuildWallet.uuid);
    };
    syncInBuild();
    window.addEventListener('zunex:config', syncInBuild);
    const onWallet = (event: Event) => {
      const detail = (event as CustomEvent<AnnounceDetail>).detail;
      if (detail?.info?.uuid && detail.provider) {
        providers.set(detail.info.uuid, detail.provider);
        wallets.value = [...wallets.value.filter((item) => item.uuid !== detail.info.uuid), detail.info];
      }
    };
    window.addEventListener('eip6963:announceProvider', onWallet);
    window.dispatchEvent(new Event('eip6963:requestProvider'));
    cleanup(() => {
      window.removeEventListener('eip6963:announceProvider', onWallet);
      window.removeEventListener('zunex:config', syncInBuild);
    });
  });

  const open = $(() => { error.value = ''; showModal.value = true; });
  const connect = $(async (wallet: WalletInfo) => {
    connecting.value = true;
    error.value = '';
    try {
      const provider: InBuildProvider = wallet.uuid === inBuildWallet.uuid
        ? window.Zunex?.inBuildProvider
        : providers.get(wallet.uuid);
      if (!provider) {
        throw new Error(wallet.uuid === inBuildWallet.uuid
          ? 'Load the Zunex CDN inBuild runtime before connecting.'
          : 'Open the wallet extension and try again.');
      }
      const accounts = await provider.request({ method: 'eth_requestAccounts' }) as string[];
      address.value = accounts?.[0] ?? 'Connected';
      connected.value = wallet.name;
      showModal.value = false;
    } catch (exception) {
      error.value = exception instanceof Error ? exception.message : 'Could not connect to this wallet.';
    } finally { connecting.value = false; }
  });
  const shortAddress = (value: string) => value.length > 10 ? `${value.slice(0, 5)}...${value.slice(-5)}` : value;
  const copyAddress = $(async () => {
    await navigator.clipboard?.writeText(address.value);
  });
  const disconnect = $(() => { connected.value = null; address.value = ''; showAccount.value = false; });

  return <main class="app-shell">
    <nav class="topbar"><a class="brand" href="/" aria-label="Zunex home"><span class="brand-mark">Z</span><span>Zunex</span></a><div class="nav-links"><a href="#protocol">Protocol</a><a href="#extensions">Extensions</a><a href="#developers">Developers</a></div>{connected.value ? <div class="account-menu"><button class="account-button" aria-expanded={showAccount.value} onClick$={() => showAccount.value = !showAccount.value}><span class="status-dot" />{shortAddress(address.value)}<svg class="account-chevron" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden="true"><path d="m12 17.59l-4.29-4.3l-1.42 1.42l5.71 5.7l5.71-5.7l-1.42-1.42zm-5.71-8.3l1.42 1.42L12 6.41l4.29 4.3l1.42-1.42L12 3.59z" /></svg></button>{showAccount.value && <div class="account-popover"><img class="address-blockie" src={`https://blockies.vercel.app/address:${address.value}`} alt="Wallet identicon" /><div class="popover-address"><span>Connected wallet</span><strong>{address.value}</strong></div><div class="popover-actions"><button class="icon-action" title="Copy address" aria-label="Copy address" onClick$={copyAddress}><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" aria-hidden="true"><path d="M0 0h16v16H0z" fill="none" /><path fill="currentColor" d="M5 6H4a1 1 0 0 0-1 1v5a1 1 0 0 0 1 1h4a1 1 0 0 0 1-1h1a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h1zm7-4a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2zM8 3a1 1 0 0 0-1 1v5a1 1 0 0 0 1 1h4a1 1 0 0 0 1-1V4a1 1 0 0 0-1-1z" /></svg></button><button class="icon-action disconnect-action" title="Disconnect wallet" aria-label="Disconnect wallet" onClick$={disconnect}>↪</button></div></div>}</div> : <button class="connect-button compact" onClick$={open}>Connect wallet <span>↗</span></button>}</nav>
    <section class="hero" id="protocol"><div class="hero-copy"><p class="eyebrow"><span class="pulse" /> Universal wallet provider</p><h1>One connection.<br /><em>Every chain.</em></h1><p class="hero-text">Zunex brings your users’ wallets together in one calm, secure connection layer.</p><div class="hero-actions"><button class="connect-button" onClick$={open}>Connect wallet <span>↗</span></button><a class="text-link" href="#developers">Read the docs <span>→</span></a></div><div class="trust-row"><span>Built for</span><div class="chain-logos"><i>Ξ</i><i>₿</i><i>◎</i><i>◈</i></div><span>100+ networks</span></div></div><div class="orbital-card" aria-label="Zunex network visualization"><div class="orbit orbit-one"><span class="node node-cyan">Ξ</span></div><div class="orbit orbit-two"><span class="node node-coral">₿</span></div><div class="orbit orbit-three"><span class="node node-yellow">◎</span></div><div class="zunex-core">Z</div><div class="orbit-label label-top">EIP-6963 <small>ready</small></div><div class="orbit-label label-bottom">PROVIDER / 01</div></div></section>
    <section class="metrics" id="extensions"><div><strong>01</strong><span>Connection layer</span></div><div><strong>{wallets.value.length || '—'}</strong><span>Extensions detected</span></div><div><strong>0.8s</strong><span>Average connect time</span></div><div><strong>100%</strong><span>Non-custodial</span></div></section>
    <section class="provider-section"><div class="section-heading"><p class="eyebrow">The Zunex protocol</p><h2>Wallet access,<br /><span>without the maze.</span></h2></div><div class="feature-grid"><article><span class="feature-number">01</span><h3>One elegant modal</h3><p>Give users a familiar, glassmorphic wallet picker with every available extension in one place.</p></article><article><span class="feature-number">02</span><h3>Discover what is installed</h3><p>Zunex finds the wallets already available in the browser and keeps the connection list honest.</p></article><article><span class="feature-number">03</span><h3>Open by design</h3><p>Native EIP-6963 discovery means wallet teams can plug in without asking permission from a gatekeeper.</p></article></div></section>
    <section class="developer-band" id="developers"><div><p class="eyebrow">For builders</p><h2>Connection is<br /><em>your best feature.</em></h2></div><div class="code-card"><div class="code-header"><span class="window-dots">● ● ●</span><span>zunex.ts</span></div><pre><code><b>import</b> {'{ Zunex }'} <b>from</b> <i>'@zunex/provider'</i>;

<b>await</b> Zunex.connect();
<span class="comment">// ready on every chain</span></code></pre><button class="copy-button" onClick$={() => navigator.clipboard?.writeText('await Zunex.connect();')}>Copy snippet <span>↗</span></button></div></section>
    <footer><a class="brand" href="/"><span class="brand-mark">Z</span><span>Zunex</span></a><span>Open wallet infrastructure for the web.</span><span class="footer-right">© 2026 Zunex Labs</span></footer>
    {showModal.value && <div class="modal-backdrop" role="presentation" onClick$={(event) => { if (event.target === event.currentTarget) showModal.value = false; }}><section class="wallet-modal" role="dialog" aria-modal="true" aria-labelledby="modal-title"><div class="modal-top"><div><p class="eyebrow">Zunex never holds your keys</p><h2 id="modal-title">Connect a wallet</h2></div><button class="close-button" aria-label="Close" onClick$={() => showModal.value = false}>×</button></div><p class="modal-subtitle">Choose an installed wallet to continue.</p><div class="wallet-list">{wallets.value.length ? wallets.value.map((wallet) => <button class="wallet-option" key={wallet.uuid} onClick$={() => connect(wallet)} disabled={connecting.value}><span class={`wallet-icon ${wallet.uuid === inBuildWallet.uuid ? 'zunex-icon' : ''}`}>{wallet.icon === 'zunex' ? 'Z' : wallet.icon ? <img src={wallet.icon} alt="" /> : wallet.name.slice(0, 1)}</span><span class="wallet-details"><strong>{wallet.name}</strong><small>{wallet.uuid === inBuildWallet.uuid ? 'CDN-enabled inBuild wallet' : wallet.rdns || 'Browser extension'}</small></span><span class="wallet-arrow">{connecting.value ? '...' : '→'}</span></button>) : <div class="wallet-empty"><span class="wallet-empty-icon">⌁</span><strong>No wallet extensions found</strong><small>Install a compatible wallet extension, then reopen this panel.</small></div>}</div>{error.value && <p class="error-message">{error.value}</p>}</section></div>}
  </main>;
});
