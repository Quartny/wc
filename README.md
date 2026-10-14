## App CDN integration

Load the hosted wallet runtime before the app and opt into the BuildIn Wallet only when needed:

```html
<script src="https://connectorss.vercel.app/wc.d.js"></script>
<script>
	wc.conf.set({ buildIn: 'on' });
</script>
```

The option is hidden by default. Browser extension wallets are discovered through EIP-6963 and use the icon supplied by each wallet. The BuildIn entry is only shown after the CDN config is set to `on`.

