## App CDN integration

Load the hosted wallet runtime before the app and opt into the InBuild Wallet only when needed:

```html
<script src="https://connectorss.vercel.app/zunex.js"></script>
<script>
	Zunex.conf.set({ inBuild: 'on' });
</script>
```

The option is hidden by default. Browser extension wallets are discovered through EIP-6963 and use the icon supplied by each wallet. The InBuild entry is only shown after the CDN config is set to `on`.

