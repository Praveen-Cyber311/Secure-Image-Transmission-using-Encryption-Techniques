# Secure Image Transmission

A modern, highly secure web application for transmitting images confidentially using QR codes and industry-standard AES client-side encryption.

## Overview

This project allows you to encrypt any image with a password entirely within your browser (using AES-CBC via CryptoJS). The server never sees your password or your unencrypted image. It then generates a unique QR code. When the recipient scans the QR code with their phone, they are taken to a secure portal where they can enter the password to instantly decrypt and view the image.

## Features

- **Zero-Knowledge Architecture:** Your password never leaves your browser.
- **Client-Side Encryption:** Uses CryptoJS (AES) to encrypt your image *before* uploading.
- **QR Code Generation:** Easily share the encrypted payload via a scannable QR code.
- **Auto-Cleanup:** The backend automatically deletes encrypted files after 24 hours.
- **Mobile Friendly:** Decrypt images directly on your mobile device just by scanning the QR code.
- **Beautiful UI:** A modern glassmorphic dark-theme interface.

## Tech Stack

- **Frontend:** HTML, CSS, JavaScript, CryptoJS
- **Backend:** Python, Flask
- **Libraries:** `qrcode`

## Running Locally

1. Install the required Python packages:
   ```bash
   pip install Flask qrcode[pil]
   ```

2. Start the Flask server:
   ```bash
   python app.py
   ```

3. Open your browser and navigate to:
   ```
   http://localhost:5000
   ```

**Note:** If you want to scan the QR code with your phone, make sure your phone and the computer running the server are connected to the same Wi-Fi network. The application automatically generates QR codes using your computer's local network IP address to ensure phones can successfully connect.
