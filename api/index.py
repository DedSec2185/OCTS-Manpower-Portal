import sys
from pathlib import Path

# Add project root and backend directory to Python sys.path
root_dir = Path(__file__).resolve().parent.parent
backend_dir = root_dir / "backend"

sys.path.insert(0, str(root_dir))
sys.path.insert(0, str(backend_dir))

from app.main import app as _app

# Vercel passes the request with the /api prefix since the file is in api/
# We wrap the ASGI app to strip /api from the path so FastAPI routing works.
async def app(scope, receive, send):
    if scope["type"] == "http":
        path = scope.get("path", "")
        if path.startswith("/api"):
            scope["path"] = path[4:] or "/"
    await _app(scope, receive, send)
