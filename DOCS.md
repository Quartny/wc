# App Wallet Runtime

This project is a static wallet demo powered by the hosted runtime at `https://unwc-phi.vercel.app/zunex.js`.

## 1. What You Get

The runtime provides:

- EIP-6963 wallet extension discovery.
- Wallet icons supplied by each extension.
- An optional InBuild Wallet entry.
- A responsive glass wallet picker.
- Direct wallet names without RDNS labels.
- Connected address shortened to the first five and last five characters.
- A Blockies identicon from `https://blockies.vercel.app/address:{address}`.
- Copy address and disconnect controls.
- The supplied circle-cross close icon.
- The supplied double-chevron wallet-row action icon.

## 2. Basic CDN Setup

Load the runtime before calling any App API:

```html
<script src="https://unwc-phi.vercel.app/zunex.js"></script>
```

Add two mount targets to your page:

```html
<div id="account-slot"></div>
<div id="modal-root"></div>
<span id="wallet-count"></span>
```

Mount the runtime after those elements exist:

```html
<script>
  Zunex.mount({
    accountSlot: 'account-slot',
    modalRoot: 'modal-root',
    count: 'wallet-count'
  });
</script>
```

Any element with `data-zunex-open` opens the wallet picker:

```html
<button data-zunex-open>Connect wallet</button>
```

## 3. InBuild Wallet

The InBuild option is off by default. Enable it explicitly:

```html
<script>
  Zunex.conf.set({
    inBuild: 'on',
    inBuildSrc: 'https://cdn.example.com/inbuild.js'
  });
</script>
```

`inBuildSrc` is the provider script URL. The runtime loads this script only when the user chooses InBuild, immediately before calling `eth_requestAccounts`.

The loaded script must expose an EIP-1193 provider using either global:

```js
window.Zunex.inBuildProvider = provider;
```

or:

```js
window.ZunexInBuildProvider = provider;
```

Working demo source is available at [examples/inbuild.js](examples/inbuild.js). Host that file or your production provider on HTTPS, then configure its URL:

```html
<script>
  Zunex.conf.set({
    inBuild: 'on',
    inBuildSrc: 'https://your-domain.com/inbuild.js'
  });
</script>
```

The example returns a fixed demo account and is only for integration testing. It does not create a wallet, store keys, sign transactions, or provide production custody.

The provider must implement:

```js
provider.request({ method: 'eth_requestAccounts' });
```

If the script fails to load, or does not expose a provider, the modal displays an actionable error instead of silently failing.

If the provider script is already loaded before the user clicks InBuild, it can register directly:

```html
<script>
  window.Zunex.inBuildProvider = {
    request: async ({ method }) => {
      if (method === 'eth_requestAccounts') return ['0x1234567890123456789012345678901234567890'];
      throw new Error('Unsupported method');
    }
  };
  Zunex.conf.set({ inBuild: 'on' });
</script>
```

## 4. Configuration API

Read configuration:

```js
const current = Zunex.conf.get();
```

Enable InBuild:

```js
Zunex.conf.set({ inBuild: 'on' });
```

Disable InBuild:

```js
Zunex.conf.set({ inBuild: 'off' });
```

Change the lazy-loaded provider URL:

```js
Zunex.conf.set({
  inBuildSrc: 'https://cdn.example.com/inbuild.js'
});
```

Configuration should be set before `Zunex.mount()` when possible. The runtime also reads the latest configuration when the InBuild row is selected.

## 5. EIP-6963 Extensions

The runtime listens for `eip6963:announceProvider` and requests announcements with:

```js
window.dispatchEvent(new Event('eip6963:requestProvider'));
```

An extension should announce:

```js
window.dispatchEvent(new CustomEvent('eip6963:announceProvider', {
  detail: {
    info: {
      uuid: 'wallet-uuid',
      name: 'Wallet Name',
      icon: 'data:image/svg+xml,...',
      rdns: 'com.example.wallet'
    },
    provider: eip1193Provider
  }
}));
```

The UI shows `info.name` directly. `rdns` is used internally for wallet metadata but is not displayed in the wallet row.

## 6. Wallet Provider Contract

A wallet provider must expose an EIP-1193-style `request` method:

```js
const accounts = await provider.request({
  method: 'eth_requestAccounts'
});
```

The returned value must be an array containing at least one address. The first address becomes the connected account shown by App.

## 7. Connected Account UI

After connection, the runtime renders:

- A shortened address using the first five and last five characters.
- A click-to-open account popover.
- A Blockies identicon URL based on the exact account address.
- The complete address.
- An inline copy SVG action.
- A disconnect action.

The Blockies URL format is:

```text
https://blockies.vercel.app/address:{address}
```

## 8. Deployment

The repository is a static Vite project. Install and build:

```bash
npm install
npm run build
```

The build produces `dist/index.html` and `dist/zunex.js`.

Deploy the repository to Vercel with:

- Build command: `npm run build`
- Output directory: `dist`
- Install command: `npm install`

Do not commit `dist/` or `node_modules/`; both are generated.

## 9. Local Development

Start Vite:

```bash
npm run dev
```

Open the local URL printed by Vite. For a production-like check:

```bash
npm run build
npm run preview
```

## 10. Troubleshooting

### InBuild provider could not load

Set a real JavaScript URL in `inBuildSrc` and confirm that URL returns JavaScript, not an HTML error page:

```bash
curl -I https://cdn.example.com/inbuild.js
```

### InBuild provider loaded without an EIP-1193 provider

Expose `window.Zunex.inBuildProvider` or `window.ZunexInBuildProvider` from the loaded script.

### Extension does not appear

Confirm the extension supports EIP-6963 and dispatches an announcement after receiving `eip6963:requestProvider`.

### Wallet icon is missing

Set `info.icon` to a valid HTTPS URL or data URL. The runtime falls back to the first character of the wallet name.

### Copy action does nothing

Clipboard access requires a secure context such as HTTPS or localhost. Check browser permissions and use `navigator.clipboard.writeText` support.

## 11. Security Notes

- Never put private keys or seed phrases in the page.
- The runtime only requests accounts through the wallet provider.
- Keep provider scripts on trusted HTTPS origins.
- Validate and restrict any custom `inBuildSrc` URL in production.
- Treat wallet-provided metadata as untrusted display data.
- Do not auto-connect accounts without explicit user action.
