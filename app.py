from flask import Flask, render_template, request, jsonify, send_file, url_for
import os
import uuid
import time
import qrcode
import socket
from werkzeug.utils import secure_filename
from io import BytesIO
import threading

app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = 'uploads'
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16 MB limit

os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

def get_local_ip():
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    try:
        # doesn't have to be reachable
        s.connect(('10.255.255.255', 1))
        IP = s.getsockname()[0]
    except Exception:
        IP = '127.0.0.1'
    finally:
        s.close()
    return IP

# Helper function to clean up old files in the uploads folder
def cleanup_uploads():
    while True:
        time.sleep(3600) # Run every hour
        now = time.time()
        for filename in os.listdir(app.config['UPLOAD_FOLDER']):
            filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            # Delete files older than 24 hours
            if os.path.isfile(filepath) and os.stat(filepath).st_mtime < now - 86400:
                try:
                    os.remove(filepath)
                except Exception:
                    pass

threading.Thread(target=cleanup_uploads, daemon=True).start()

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/view/<image_id>')
def view_image(image_id):
    file_path = os.path.join(app.config['UPLOAD_FOLDER'], secure_filename(image_id))
    if not os.path.exists(file_path):
        return render_template('view.html', error="Image not found or has expired.")
    return render_template('view.html', image_id=image_id)

@app.route('/api/upload_encrypted', methods=['POST'])
def upload_encrypted():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
    
    # Save the encrypted file
    image_id = str(uuid.uuid4()) + ".enc"
    file_path = os.path.join(app.config['UPLOAD_FOLDER'], image_id)
    file.save(file_path)
    
    # Generate the link using the local IP so phones on the same WiFi can connect
    local_ip = get_local_ip()
    port = request.host.split(':')[-1] if ':' in request.host else '5000'
    base_url = f"http://{local_ip}:{port}"
    
    link = base_url + url_for('view_image', image_id=image_id)
    return jsonify({'link': link, 'id': image_id})

@app.route('/api/get_encrypted/<image_id>')
def get_encrypted(image_id):
    file_path = os.path.join(app.config['UPLOAD_FOLDER'], secure_filename(image_id))
    if not os.path.exists(file_path):
        return jsonify({'error': 'File not found'}), 404
    return send_file(file_path)

@app.route('/api/generate_qr', methods=['POST'])
def generate_qr():
    if 'link' not in request.form:
        return jsonify({'error': 'Missing link'}), 400
        
    link = request.form['link']
    
    try:
        qr = qrcode.make(link)
        img_io = BytesIO()
        qr.save(img_io, 'PNG')
        img_io.seek(0)
        return send_file(img_io, mimetype='image/png', as_attachment=True, download_name="secure_qr.png")
    except Exception as ex:
        return jsonify({'error': str(ex)}), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
