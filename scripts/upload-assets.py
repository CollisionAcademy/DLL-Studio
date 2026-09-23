import json, pathlib, urllib.request, concurrent.futures
root = pathlib.Path(__file__).resolve().parents[1]
jobs = json.loads((root / 'verification/uploads.json').read_text())
def upload(job):
    data = (root / f"public/characters/{job['id']}.png").read_bytes()
    req = urllib.request.Request(job['upload_url'], data=data, headers={'Content-Type':'image/png'}, method='PUT')
    try:
        with urllib.request.urlopen(req, timeout=90) as response:
            return {'id':job['id'], 'status':response.status, 'file_url':job['file_url']}
    except Exception as error:
        return {'id':job['id'], 'error':type(error).__name__}
with concurrent.futures.ThreadPoolExecutor(max_workers=3) as pool:
    results = list(pool.map(upload, jobs))
(root / 'verification/upload-results.json').write_text(json.dumps(results,indent=2))
print(json.dumps(results))
