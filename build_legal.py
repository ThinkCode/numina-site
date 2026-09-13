#!/usr/bin/env python3
"""Regenerate privacy.html / terms.html from the app's bundled Markdown, so the
website and the in-app pages can never disagree. Run from the numina-site root
with the BrainTuner repo path as the only argument."""
import re, sys, html, pathlib

def inline(t):
    t = html.escape(t, quote=False)
    t = re.sub(r"\*\*(.+?)\*\*", r"<strong>\1</strong>", t)
    t = re.sub(r"\[(.+?)\]\((.+?)\)", r'<a href="\2">\1</a>', t)
    return t

def convert(md):
    out, para = [], []
    def flush():
        if para: out.append(f"<p>{inline(' '.join(para))}</p>"); para.clear()
    in_ul = False
    for raw in md.split("\n"):
        line = raw.strip()
        if line.startswith("- "):
            flush()
            if not in_ul: out.append("<ul>"); in_ul = True
            out.append(f"<li>{inline(line[2:])}</li>"); continue
        if in_ul: out.append("</ul>"); in_ul = False
        if not line: flush(); continue
        if line.startswith("## "): flush(); out.append(f"<h2>{inline(line[3:])}</h2>")
        elif line.startswith("# "): flush(); out.append(f"<h1>{inline(line[2:])}</h1>")
        elif line.startswith("**Effective:**"): flush(); out.append(f'<p class="meta">{inline(line)}</p>')
        else: para.append(line)
    flush()
    if in_ul: out.append("</ul>")
    return "\n".join(out)

TEMPLATE = """<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>{title} — Numina</title>
<meta name="theme-color" content="#0B1026">
<link rel="icon" href="img/icon.png"><link rel="stylesheet" href="style.css">
</head>
<body>
<div class="sky"></div><div class="stars"></div>
<div class="wrap">
<nav><a class="brand" href="/"><img src="img/icon.png" alt=""> Numina</a>
<ul><li><a href="privacy.html">Privacy</a></li><li><a href="terms.html">Terms</a></li><li><a href="mailto:support@bytexio.com">Support</a></li></ul></nav>
<main class="legal">
{body}
</main>
<footer><div class="row"><div>© 2026 ByteXio · Numina</div>
<div><a href="privacy.html">Privacy Policy</a><a href="terms.html">Terms of Use</a><a href="mailto:support@bytexio.com">Support</a></div></div></footer>
</div></body></html>
"""

repo = pathlib.Path(sys.argv[1])
here = pathlib.Path(__file__).parent
for name, title in [("privacy", "Privacy Policy"), ("terms", "Terms of Use")]:
    md = (repo / "Numina/Resources/Legal" / f"{name}.md").read_text()
    # In-app the Terms link to the privacy policy by absolute URL; on the site
    # a relative link keeps it working on the github.io fallback too.
    md = md.replace("https://numina.bytexio.com/privacy", "privacy.html")
    (here / f"{name}.html").write_text(TEMPLATE.format(title=title, body=convert(md)))
    print("wrote", f"{name}.html")
