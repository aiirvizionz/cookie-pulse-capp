# Cookie Pulse

Cookie Pulse is an original local prototype for a Cookie Chain cApp submission. It demonstrates a wallet-first workflow without taking custody of keys:

- reads health, slot, epoch, and balance data from the public Cookie Chain RPC;
- connects an injected Solana-compatible wallet and displays only its public address;
- prepares a Memo Program transaction locally;
- requires a separate consent checkbox and a manual wallet signature before sending;
- records confirmation and links to the explorer when a transaction is confirmed.

## Run locally

From this directory, start any static server, for example:

```powershell
python -m http.server 4173
```

Open `http://localhost:4173/` and use a compatible wallet. No seed phrase or private key is requested. The send control is intentionally opt-in because it can spend a network fee.

## Important status

This is a local prototype only. It has not been deployed to Cookie Chain, published to GitHub, submitted to Superteam Earn, or connected to a project-owned SSO/social identity. Those external steps require an authorized account and a verified deployment environment.

## Dependencies

The browser loads `@solana/web3.js` 1.98.4 from the unpkg CDN. The app itself has no build step and uses no API keys.
