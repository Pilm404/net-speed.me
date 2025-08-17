from flask import jsonify, Response, request
from app.util import stream_random_bytes
from app import app
import time

@app.route('/api/ping')
def ping():
    return jsonify({'server_ts': time.time()})

@app.route('/api/download')
def download():
    try:
        size_mb = int(request.args.get('size_mb', '16'))
    except ValueError:
        size_mb = 16
    total_bytes = max(1, size_mb) * 1024 * 1024
    headers = {
        "Content-Type": "application/octet-stream",
        "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
        "Content-Disposition": "attachment; filename=blob.bin"
    }
    return Response(stream_random_bytes(total_bytes), headers=headers)

@app.route('/api/upload', methods=['POST'])
def upload():
    chunk_size = 1024 * 64
    total = 0
    while True:
        chunk = request.stream.read(chunk_size)
        if not chunk:
            break
        total += len(chunk)
    return '', 204

@app.route('/api/ip')
def ip():
    return jsonify({'ip': request.remote_addr})
