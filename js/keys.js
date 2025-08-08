let myEncKeyPair = null;   
let mySignKeyPair = null;  

async function generateMyKeys() {
  
  myEncKeyPair = await crypto.subtle.generateKey(
    {
      name: "RSA-OAEP",
      modulusLength: 2048,
      publicExponent: new Uint8Array([1, 0, 1]),
      hash: "SHA-256",
    },
    true,
    ["encrypt", "decrypt"]
  );


  mySignKeyPair = await crypto.subtle.generateKey(
    {
      name: "RSASSA-PKCS1-v1_5",
      modulusLength: 2048,
      publicExponent: new Uint8Array([1, 0, 1]),
      hash: "SHA-256",
    },
    true,
    ["sign", "verify"]
  );

  return { myEncKeyPair, mySignKeyPair };
}

async function exportMyPublicKeysToJwk() {
  if (!myEncKeyPair || !mySignKeyPair) throw new Error("Generate keys first");
  const encPubJwk = await crypto.subtle.exportKey("jwk", myEncKeyPair.publicKey);
  const signPubJwk = await crypto.subtle.exportKey("jwk", mySignKeyPair.publicKey);
  return { encPubJwk, signPubJwk };
}

async function importPublicKeyFromJwk(jwk, alg) {
  
  let usages = alg === "RSA-OAEP" ? ["encrypt"] : ["verify"];
  const key = await crypto.subtle.importKey(
    "jwk",
    jwk,
    { name: alg, hash: "SHA-256" },
    true,
    usages
  );
  return key;
}
