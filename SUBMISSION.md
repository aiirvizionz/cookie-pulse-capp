# Cookie Pulse Submission Packet

## Links

- Live demo: https://aiirvizionz.github.io/cookie-pulse-capp/
- Source: https://github.com/aiirvizionz/cookie-pulse-capp
- Bounty: https://superteam.fun/earn/listing/create-an-app-on-cookie-chain-app

## Summary

Cookie Pulse is a small wallet-first Cookie Chain cApp that makes the network useful and observable without taking custody of keys. It reads public network health, slot, epoch, and wallet balance data; connects an injected Solana-compatible wallet; prepares a Memo Program transaction locally; asks for separate user consent; and waits for the wallet's explicit signature before sending. After confirmation it records the signature and links to the explorer.

## Why it is safe to evaluate

- No seed phrase, private key, API key, or password is requested.
- Only the connected public address is displayed.
- Transaction preparation is separate from consent and signing.
- The app uses the public Cookie Chain RPC and explorer.
- The static frontend has no backend custody layer.

## Verification status

- GitHub Pages deployment verified with HTTP 200 on 2026-09-22.
- GitHub Actions deployment run completed successfully on 2026-09-15.
- Superteam submission has not been made yet; the final submit step requires an authorized project-owned Superteam identity.

## Sponsor checklist

- [x] Public live application URL.
- [x] Open-source GitHub repository.
- [x] Wallet connection, public address display, Cookie Chain transaction, confirmation, and error feedback.
- [x] README and deployment verification.
- [ ] Submit the listing form from an authorized project-owned Superteam session.
- [ ] Publish the required X thread from an authorized project-owned account.
- [ ] Share that thread in the Cookie Chain Telegram community from an authorized project-owned account.

### Announcement draft

Cookie Pulse is a wallet-first Cookie Chain cApp for checking public network health and recording a signed Memo transaction. It keeps preparation, consent, signing, broadcast, and confirmation separate, never requests a seed phrase or private key, and links the confirmed signature to the explorer.

Demo: https://aiirvizionz.github.io/cookie-pulse-capp/
Source: https://github.com/aiirvizionz/cookie-pulse-capp
