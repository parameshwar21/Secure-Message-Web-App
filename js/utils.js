
function encodeUTF8(str) {
  return new TextEncoder().encode(str);
}
function decodeUTF8(buf) {
  return new TextDecoder().decode(buf);
}
function bufferToBase64(buffer) {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}
function base64ToBuffer(base64) {
  const binary = atob(base64);
  const len = binary.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) bytes[i] = binary.charCodeAt(i);
  return bytes.buffer;
}
function concatArrayBuffers(...buffers) {
  let total = 0;
  for (const b of buffers) total += b.byteLength;
  const tmp = new Uint8Array(total);
  let offset = 0;
  for (const b of buffers) {
    tmp.set(new Uint8Array(b), offset);
    offset += b.byteLength;
  }
  return tmp.buffer;
}
