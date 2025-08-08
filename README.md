Secure Messaging Web App (Web Crypto API)

A browser-based secure text messenger that uses the **Web Crypto API** for:
- RSA-OAEP public-key encryption
- ECDSA digital signatures
- AES-GCM symmetric encryption (hybrid model)
- Secure key exchange and message verification

This app demonstrates **intermediate-level Web Crypto concepts** in a practical end-to-end messaging flow.


 Features

- **Generate RSA & ECDSA key pairs** in-browser
- **Export and import keys** using JWK (JSON Web Key) format
- **Hybrid encryption**: AES-GCM for message, RSA-OAEP for AES key
- **Digital signatures** with ECDSA to ensure authenticity
- **Message verification** to detect tampering
- **No backend required** — all cryptographic operations happen in the browser


  How to run:

  1) Clone the repository
       git clone https://github.com/parameshwar21/Secure-Messaging-Web-App.git
       cd secure-messaging
  2)Start local server
  3)Open in browser
          http://localhost:8000




