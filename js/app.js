
const generateKeysBtn = document.getElementById("generateKeysBtn");
const exportPubBtn = document.getElementById("exportPubBtn");
const myEncPubEl = document.getElementById("myEncPub");
const mySignPubEl = document.getElementById("mySignPub");
const friendEncPubEl = document.getElementById("friendEncPub");
const friendSignPubEl = document.getElementById("friendSignPub");
const importFriendBtn = document.getElementById("importFriendBtn");
const plaintextEl = document.getElementById("plaintext");
const sendBtn = document.getElementById("sendBtn");
const payloadOutEl = document.getElementById("payloadOut");
const payloadInEl = document.getElementById("payloadIn");
const receiveBtn = document.getElementById("receiveBtn");
const decryptedOutEl = document.getElementById("decryptedOut");
const verifyStatusEl = document.getElementById("verifyStatus");

let friendEncPubJwk = null;
let friendSignPubJwk = null;

generateKeysBtn.addEventListener("click", async () => {
  generateKeysBtn.disabled = true;
  try {
    await generateMyKeys();
    alert("Generated key pairs for encryption and signing.");
  } catch (err) {
    console.error(err);
    alert("Key generation failed: " + err.message);
  } finally {
    generateKeysBtn.disabled = false;
  }
});

exportPubBtn.addEventListener("click", async () => {
  try {
    const { encPubJwk, signPubJwk } = await exportMyPublicKeysToJwk();
    myEncPubEl.value = JSON.stringify(encPubJwk, null, 2);
    mySignPubEl.value = JSON.stringify(signPubJwk, null, 2);
    alert("Public keys exported to the textareas. Share these with your friend (only public keys).");
  } catch (err) {
    console.error(err);
    alert("Export failed: " + err.message);
  }
});

importFriendBtn.addEventListener("click", async () => {
  try {
    if (!friendEncPubEl.value || !friendSignPubEl.value) {
      alert("Please paste both friend's encryption and signing public key JWKs.");
      return;
    }
    friendEncPubJwk = JSON.parse(friendEncPubEl.value);
    friendSignPubJwk = JSON.parse(friendSignPubEl.value);
    // test import
    await importPublicKeyFromJwk(friendEncPubJwk, "RSA-OAEP");
    await importPublicKeyFromJwk(friendSignPubJwk, "RSASSA-PKCS1-v1_5");
    alert("Friend public keys imported OK.");
  } catch (err) {
    console.error(err);
    alert("Import failed: " + (err.message || err));
  }
});

sendBtn.addEventListener("click", async () => {
  try {
    if (!friendEncPubJwk) { alert("Import friend's public keys first."); return; }
    if (!mySignKeyPair || !myEncKeyPair) { alert("Generate your keys first."); return; }
    const plaintext = plaintextEl.value;
    if (!plaintext) { alert("Enter plaintext to send."); return; }

    const payload = await createPayloadWithSenderInfo(friendEncPubJwk, mySignKeyPair, plaintext);
    // add sender's signing public key so the receiver can verify
    payload.senderSignPub = await crypto.subtle.exportKey("jwk", mySignKeyPair.publicKey);

    payloadOutEl.value = JSON.stringify(payload, null, 2);
    alert("Payload created. Copy & send the JSON to your friend.");
  } catch (err) {
    console.error(err);
    alert("Failed to create payload: " + (err.message || err));
  }
});


receiveBtn.addEventListener("click", async () => {
  try {
    if (!myEncKeyPair) { alert("Generate your keys (so you have decrypting private key)."); return; }
    const raw = payloadInEl.value;
    if (!raw) { alert("Paste payload JSON from sender."); return; }
    const payload = JSON.parse(raw);

    if (!payload.senderSignPub) { alert("Payload missing senderSignPub (public signing key)."); return; }

    const result = await decryptAndVerify(payload, myEncKeyPair.privateKey, payload.senderSignPub);
    decryptedOutEl.value = result.plaintext;
    verifyStatusEl.value = result.verified ? "Signature verified ✓" : "Signature INVALID ✗";
    alert("Decryption complete. Check verification status.");
  } catch (err) {
    console.error(err);
    alert("Failed to decrypt/verify: " + (err.message || err));
  }
});
