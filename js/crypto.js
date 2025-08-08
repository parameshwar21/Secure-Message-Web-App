
async function createPayload(recipientEncPubJwk, recipientSignPubJwk, senderSignPrivateKey, plaintext) {
  const aesKey = await crypto.subtle.generateKey({ name: "AES-GCM", length: 256 }, true, ["encrypt", "decrypt"]);
  const rawAes = await crypto.subtle.exportKey("raw", aesKey);

  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ct = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, aesKey, encodeUTF8(plaintext));

  const recipientEncKey = await importPublicKeyFromJwk(recipientEncPubJwk, "RSA-OAEP");
  const wrappedKey = await crypto.subtle.encrypt({ name: "RSA-OAEP" }, recipientEncKey, rawAes);

  const signature = await crypto.subtle.sign(
    { name: "RSASSA-PKCS1-v1_5" },
    senderSignPrivateKey,
    ct 
  );

  const senderSignPubJwk = await crypto.subtle.exportKey("jwk", senderSignPrivateKey.publicKey ? senderSignPrivateKey.publicKey : undefined).catch(()=>null);
  return {
    wrappedKey: bufferToBase64(wrappedKey),
    iv: bufferToBase64(iv.buffer),
    ciphertext: bufferToBase64(ct),
    signature: bufferToBase64(signature),
  };
}

async function createPayloadWithSenderInfo(recipientEncPubJwk, senderSignKeyPair, plaintext) {
  const aesKey = await crypto.subtle.generateKey({ name: "AES-GCM", length: 256 }, true, ["encrypt", "decrypt"]);
  const rawAes = await crypto.subtle.exportKey("raw", aesKey);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ct = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, aesKey, encodeUTF8(plaintext));

  const recipientEncKey = await importPublicKeyFromJwk(recipientEncPubJwk, "RSA-OAEP");
  const wrappedKey = await crypto.subtle.encrypt({ name: "RSA-OAEP" }, recipientEncKey, rawAes);

  const signature = await crypto.subtle.sign(
    { name: "RSASSA-PKCS1-v1_5" },
    senderSignKeyPair.privateKey,
    ct
  );

  const senderSignPubJwk = await crypto.subtle.exportKey("jwk", senderSignKeyPair.publicKey);
  return {
    wrappedKey: bufferToBase64(wrappedKey),
    iv: bufferToBase64(iv.buffer),
    ciphertext: bufferToBase64(ct),
    signature: bufferToBase64(signature),
    senderSignPub: senderSignPubJwk
  };
}

async function decryptAndVerify(payloadJson, myEncPrivateKey, friendSignPubJwk) {
  const wrappedKeyBuf = base64ToBuffer(payloadJson.wrappedKey);
  const ivBuf = base64ToBuffer(payloadJson.iv);
  const ctBuf = base64ToBuffer(payloadJson.ciphertext);
  const sigBuf = base64ToBuffer(payloadJson.signature);

  const rawAes = await crypto.subtle.decrypt({ name: "RSA-OAEP" }, myEncPrivateKey, wrappedKeyBuf);

  const aesKey = await crypto.subtle.importKey("raw", rawAes, { name: "AES-GCM" }, false, ["decrypt"]);

  const ptBuf = await crypto.subtle.decrypt({ name: "AES-GCM", iv: new Uint8Array(ivBuf) }, aesKey, ctBuf);


  const friendSignKey = await importPublicKeyFromJwk(friendSignPubJwk, "RSASSA-PKCS1-v1_5");
  const ok = await crypto.subtle.verify({ name: "RSASSA-PKCS1-v1_5" }, friendSignKey, sigBuf, ctBuf);

  return { plaintext: decodeUTF8(ptBuf), verified: ok };
}
