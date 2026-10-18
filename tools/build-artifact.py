"""Builds dist/lilopia.html: the page body used to publish the hosted Claude artifact.
index.html stays the full document you open directly; this copy drops the outer
<html>/<head>/<body> tags because the artifact host adds its own."""
import pathlib
root = pathlib.Path(__file__).resolve().parent.parent
src = (root / 'index.html').read_text()
def between(a, b):
    return src[src.index(a) + len(a):src.index(b)].strip('\n')
out = between('<!-- @@HEAD-START@@ -->', '<!-- @@HEAD-END@@ -->') + '\n' + between('<!-- @@BODY-START@@ -->', '<!-- @@BODY-END@@ -->') + '\n'
(root / 'dist').mkdir(exist_ok=True)
(root / 'dist' / 'lilopia.html').write_text(out)
print('wrote dist/lilopia.html', len(out), 'bytes')
