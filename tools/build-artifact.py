"""Builds dist/lilopia.html: the page body used to publish the hosted Claude artifact.
index.html stays the full document you open directly; this copy drops the outer
<html>/<head>/<body> tags because the artifact host adds its own."""
import pathlib
root = pathlib.Path(__file__).resolve().parent.parent
src = (root / 'index.html').read_text()
def between(a, b):
    return src[src.index(a) + len(a):src.index(b)].strip('\n')
import re
head = between('<!-- @@HEAD-START@@ -->', '<!-- @@HEAD-END@@ -->')
# The hosted preview is not installable, and its security policy only allows Google Fonts stylesheets.
head = re.sub(r'<!-- @@PWA-START@@ -->.*?<!-- @@PWA-END@@ -->\n?', '', head, flags=re.S)
head = head.replace('<link rel="stylesheet" href="fonts/fonts.css">', '<link rel="preconnect" href="https://fonts.googleapis.com">\n<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Baloo+2:wght@600;700;800&family=Nunito:wght@600;700;800;900&display=swap">')
out = head + '\n' + between('<!-- @@BODY-START@@ -->', '<!-- @@BODY-END@@ -->') + '\n'
(root / 'dist').mkdir(exist_ok=True)
(root / 'dist' / 'lilopia.html').write_text(out)
print('wrote dist/lilopia.html', len(out), 'bytes')
