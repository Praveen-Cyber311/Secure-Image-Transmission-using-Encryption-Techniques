/**
 * Reads a File object and returns a Base64 Data URL string.
 */
function readFileAsDataURL(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
        reader.readAsDataURL(file);
    });
}

/**
 * Encrypts a File object using the provided password.
 * Uses CryptoJS to encrypt the Base64 representation of the image.
 * Returns a Blob containing the encrypted text.
 */
async function encryptImage(file, password) {
    // Read file as Base64 data URL
    const dataUrl = await readFileAsDataURL(file);
    
    // Encrypt the data URL string using CryptoJS AES
    const encryptedText = CryptoJS.AES.encrypt(dataUrl, password).toString();
    
    // Return as a text Blob
    return new Blob([encryptedText], { type: "text/plain" });
}

/**
 * Decrypts an ArrayBuffer (containing encrypted text) using the provided password.
 * Returns a data URL string representing the decrypted image.
 */
async function decryptImage(arrayBuffer, password) {
    // arrayBuffer contains the encrypted text
    const dec = new TextDecoder();
    const encryptedText = dec.decode(arrayBuffer);
    
    // Decrypt using CryptoJS
    const bytes = CryptoJS.AES.decrypt(encryptedText, password);
    const decryptedDataUrl = bytes.toString(CryptoJS.enc.Utf8);
    
    if (!decryptedDataUrl || !decryptedDataUrl.startsWith('data:')) {
        throw new Error("Decryption failed. Invalid password or corrupted file.");
    }
    
    // Return the data URL directly, which can be set as img.src
    return decryptedDataUrl;
}
