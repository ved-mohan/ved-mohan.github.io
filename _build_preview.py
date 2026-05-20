#!/usr/bin/env python3
"""Quick local preview: renders Jekyll-frontmatter pages with the default layout
and serves from _site_preview/ on localhost:8000.

Not a full Jekyll replacement — only handles frontmatter strip + {{ content }}
substitution + {{ page.title }} substitution. Enough to preview vedm.dev.
"""

from __future__ import annotations
import http.server
import os
import re
import shutil
import socketserver
from pathlib import Path

ROOT = Path(__file__).parent
BUILD = ROOT / "_site_preview"
LAYOUT = ROOT / "_layouts" / "default.html"

FRONT_MATTER_RE = re.compile(r"^---\s*\n(.*?)\n---\s*\n", re.DOTALL)


def parse_front_matter(text: str) -> tuple[dict, str]:
    m = FRONT_MATTER_RE.match(text)
    if not m:
        return {}, text
    raw = m.group(1)
    body = text[m.end():]
    meta = {}
    for line in raw.splitlines():
        if ":" in line:
            k, _, v = line.partition(":")
            meta[k.strip()] = v.strip()
    return meta, body


def render(html_path: Path, layout_src: str) -> str:
    text = html_path.read_text(encoding="utf-8")
    meta, body = parse_front_matter(text)
    title = meta.get("title", "")
    out = layout_src.replace("{{ content }}", body)
    out = out.replace("{{ page.title }}", title)
    return out


SKIP_DIRS = {"_site_preview", "_layouts", "_data", "_posts", ".git", "node_modules"}


def build():
    if BUILD.exists():
        shutil.rmtree(BUILD)
    BUILD.mkdir()

    layout_src = LAYOUT.read_text(encoding="utf-8")

    # Copy static asset directories directly
    for d in ("css", "jpg", "assets"):
        src = ROOT / d
        if src.exists():
            shutil.copytree(src, BUILD / d)

    # Render top-level index.html
    index_src = ROOT / "index.html"
    if index_src.exists():
        (BUILD / "index.html").write_text(render(index_src, layout_src), encoding="utf-8")

    # Walk for nested index.html under any non-skipped dir
    for src in ROOT.rglob("index.html"):
        if src == index_src:
            continue
        rel = src.relative_to(ROOT)
        if any(part in SKIP_DIRS or part.startswith(".") for part in rel.parts):
            continue
        out_path = BUILD / rel
        out_path.parent.mkdir(parents=True, exist_ok=True)
        out_path.write_text(render(src, layout_src), encoding="utf-8")

    print(f"Built {BUILD}")


def serve(port: int = 8765):
    os.chdir(BUILD)
    handler = http.server.SimpleHTTPRequestHandler
    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(("", port), handler) as httpd:
        print(f"Serving at http://localhost:{port}")
        httpd.serve_forever()


if __name__ == "__main__":
    build()
    serve()
