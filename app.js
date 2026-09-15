(function () {
  "use strict";

  const RPC_URL = "https://rpc.cookiescan.io";
  const EXPLORER_URL = "https://cookiescan.io/tx/";
  const MEMO_PROGRAM_ID = "MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr";
  const state = { provider: null, publicKey: null, preparedTransaction: null, events: 0 };

  const $ = (id) => document.getElementById(id);
  if (!window.solanaWeb3) {
    $("sessionMessage").textContent = "Solana web3 could not be loaded. Check the network connection and reload.";
    $("connectButton").disabled = true;
    $("refreshButton").disabled = true;
    return;
  }
  const connection = new solanaWeb3.Connection(RPC_URL, "confirmed");

  function toPublicKey(value) {
    if (!value) return null;
    if (value instanceof solanaWeb3.PublicKey) return value;
    return new solanaWeb3.PublicKey(value.toString());
  }

  function addEvent(message) {
    const list = $("activityList");
    const empty = list.querySelector(".empty-state");
    if (empty) empty.remove();
    const item = document.createElement("li");
    item.textContent = message;
    const time = document.createElement("time");
    time.textContent = new Date().toLocaleTimeString();
    item.appendChild(time);
    list.prepend(item);
    state.events += 1;
    $("logCount").textContent = `${state.events} event${state.events === 1 ? "" : "s"}`;
  }

  function setSessionMessage(message) { $("sessionMessage").textContent = message; }

  function providerLabel(provider) {
    if (provider === window.nightly?.solana) return "Nightly wallet";
    if (provider === window.phantom?.solana) return "Phantom wallet";
    return "Injected wallet";
  }

  function detectProvider() {
    return window.nightly?.solana || window.phantom?.solana || window.solana || null;
  }

  function setWalletState(connected) {
    $("prepareButton").disabled = !connected;
    $("consentCheckbox").disabled = !connected;
    $("sendButton").disabled = !connected || !state.preparedTransaction;
    $("walletState").textContent = connected ? "Connected" : "Read only";
    $("walletState").style.color = connected ? "var(--green)" : "var(--yellow)";
  }

  async function refreshNetwork() {
    $("healthValue").textContent = "Checking";
    try {
      const [health, slot, epoch] = await Promise.all([
        connection.getHealth(),
        connection.getSlot(),
        connection.getEpochInfo(),
      ]);
      $("healthValue").textContent = health === "ok" ? "Healthy" : String(health);
      $("healthValue").style.color = health === "ok" ? "var(--green)" : "var(--yellow)";
      $("slotValue").textContent = slot.toLocaleString();
      $("epochValue").textContent = `${epoch.epoch.toLocaleString()} / ${epoch.slotIndex.toLocaleString()}`;
      if (state.publicKey) {
        const lamports = await connection.getBalance(state.publicKey);
        $("balanceValue").textContent = `${(lamports / solanaWeb3.LAMPORTS_PER_SOL).toFixed(6)} SOL`;
      } else {
        $("balanceValue").textContent = "Connect wallet";
      }
      $("updatedValue").textContent = `Updated ${new Date().toLocaleTimeString()}`;
      setSessionMessage("Network readings refreshed from Cookie Chain RPC.");
      addEvent(`Network checked: ${health}, slot ${slot.toLocaleString()}.`);
    } catch (error) {
      $("healthValue").textContent = "Unavailable";
      $("healthValue").style.color = "var(--red)";
      setSessionMessage(`Network check failed: ${error.message}`);
      addEvent(`Network check failed: ${error.message}`);
    }
  }

  async function connectWallet() {
    const provider = detectProvider();
    if (!provider) {
      setSessionMessage("No compatible injected wallet was detected. Install Nightly or another Solana-compatible wallet.");
      addEvent("Wallet connection skipped: no provider detected.");
      return;
    }
    try {
      const response = await provider.connect();
      state.provider = provider;
      state.publicKey = toPublicKey(response.publicKey || provider.publicKey);
      if (!state.publicKey) throw new Error("The wallet did not return a public key.");
      const address = state.publicKey.toBase58();
      $("walletLabel").textContent = providerLabel(provider);
      $("walletAddress").textContent = address;
      $("connectButton").textContent = "Wallet connected";
      setSessionMessage("Wallet connected. All signing remains user-controlled.");
      setWalletState(true);
      addEvent(`Connected ${providerLabel(provider)}: ${address.slice(0, 8)}...${address.slice(-6)}.`);
      await refreshNetwork();
    } catch (error) {
      setSessionMessage(`Wallet connection failed: ${error.message}`);
      addEvent(`Wallet connection failed: ${error.message}`);
    }
  }

  async function prepareMemo() {
    if (!state.publicKey) return;
    try {
      const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash("confirmed");
      const memo = new TextEncoder().encode("Cookie Pulse capability check");
      const transaction = new solanaWeb3.Transaction({ feePayer: state.publicKey, recentBlockhash: blockhash });
      transaction.lastValidBlockHeight = lastValidBlockHeight;
      transaction.add(new solanaWeb3.TransactionInstruction({
        keys: [],
        programId: new solanaWeb3.PublicKey(MEMO_PROGRAM_ID),
        data: memo,
      }));
      state.preparedTransaction = transaction;
      $("sendButton").disabled = !$("consentCheckbox").checked;
      setSessionMessage("Memo transaction prepared. It has not been signed or sent.");
      addEvent("Prepared a memo transaction; no network action occurred.");
    } catch (error) {
      setSessionMessage(`Transaction preparation failed: ${error.message}`);
      addEvent(`Transaction preparation failed: ${error.message}`);
    }
  }

  async function sendMemo() {
    if (!state.provider || !state.preparedTransaction || !$("consentCheckbox").checked) return;
    try {
      setSessionMessage("Awaiting wallet signature...");
      const result = await state.provider.signAndSendTransaction(state.preparedTransaction);
      const signature = result.signature || result;
      setSessionMessage("Transaction sent. Waiting for confirmation...");
      await connection.confirmTransaction({
        signature,
        blockhash: state.preparedTransaction.recentBlockhash,
        lastValidBlockHeight: state.preparedTransaction.lastValidBlockHeight,
      }, "confirmed");
      setSessionMessage("Transaction confirmed on Cookie Chain.");
      addEvent(`Confirmed memo transaction: ${signature}`);
      const link = document.createElement("a");
      link.href = `${EXPLORER_URL}${signature}`;
      link.target = "_blank";
      link.rel = "noreferrer";
      link.textContent = "Open explorer";
      $("activityList").firstChild.appendChild(document.createTextNode(" "));
      $("activityList").firstChild.appendChild(link);
      state.preparedTransaction = null;
      $("sendButton").disabled = true;
    } catch (error) {
      setSessionMessage(`Transaction was not confirmed: ${error.message}`);
      addEvent(`Transaction not confirmed: ${error.message}`);
    }
  }

  $("connectButton").addEventListener("click", connectWallet);
  $("refreshButton").addEventListener("click", refreshNetwork);
  $("prepareButton").addEventListener("click", prepareMemo);
  $("sendButton").addEventListener("click", sendMemo);
  $("consentCheckbox").addEventListener("change", () => {
    $("sendButton").disabled = !state.publicKey || !state.preparedTransaction || !$("consentCheckbox").checked;
  });
  refreshNetwork();
})();
