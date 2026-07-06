document.addEventListener('DOMContentLoaded', () => {
    
    // --- Send Flow ---
    const sendForm = document.getElementById('sendForm');
    if (sendForm) {
        sendForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const secretFile = document.getElementById('secretImage').files[0];
            const password = document.getElementById('password').value;
            
            if (!secretFile || !password) {
                alert("Please fill all fields.");
                return;
            }
            
            const btn = document.getElementById('sendBtn');
            const loader = document.getElementById('sendLoader');
            const resultDiv = document.getElementById('sendResult');
            const qrPreview = document.getElementById('qrPreview');
            const downloadLink = document.getElementById('downloadQr');
            
            btn.disabled = true;
            loader.style.display = 'block';
            resultDiv.style.display = 'none';
            
            try {
                // 1. Encrypt image in browser
                loader.textContent = "Encrypting image locally...";
                const encryptedBlob = await encryptImage(secretFile, password);
                
                // 2. Upload encrypted payload
                loader.textContent = "Uploading encrypted payload...";
                const formData = new FormData();
                formData.append('file', encryptedBlob, 'secret.enc');
                
                const uploadRes = await fetch('/api/upload_encrypted', {
                    method: 'POST',
                    body: formData
                });
                
                if (!uploadRes.ok) throw new Error("Failed to upload encrypted file");
                
                const { link } = await uploadRes.json();
                
                // 3. Generate QR Code
                loader.textContent = "Generating QR Code...";
                const qrData = new FormData();
                qrData.append('link', link);
                
                const qrRes = await fetch('/api/generate_qr', {
                    method: 'POST',
                    body: qrData
                });
                
                if (!qrRes.ok) throw new Error("Failed to generate QR code");
                
                // 4. Download result
                const qrBlob = await qrRes.blob();
                const qrUrl = URL.createObjectURL(qrBlob);
                
                qrPreview.src = qrUrl;
                downloadLink.href = qrUrl;
                resultDiv.style.display = 'block';
                
            } catch (err) {
                console.error(err);
                alert("An error occurred: " + err.message);
            } finally {
                btn.disabled = false;
                loader.style.display = 'none';
            }
        });
    }
});
