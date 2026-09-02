import re

print("=== FIXING EVERYTHING ===\n")

with open('src/components/Globe3D.jsx', 'r') as f:
    g = f.read()

match = re.search(r'Math\.round\((\d+) \* sizeScale\)', g)
if match:
    old_num = match.group(1)
    g = re.sub(r'Math\.round\(\d+ \* sizeScale\)', 'Math.round(1300 * sizeScale)', g)
    print(f'Globe3D: Size {old_num} -> 1300')
else:
    print('Globe3D: Pattern not found')

if 'overflow-hidden my-auto">' in g:
    g = g.replace(
        'className="relative w-full h-[750px] sm:h-[900px] lg:h-[1050px] xl:h-[1150px] flex items-center justify-end pointer-events-auto overflow-hidden my-auto">',
        'className="relative w-full h-[750px] sm:h-[900px] lg:h-[1050px] xl:h-[1150px] flex items-center justify-end pointer-events-auto overflow-visible my-auto">'
    )
    print('Globe3D: overflow-visible')

with open('src/components/Globe3D.jsx', 'w') as f:
    f.write(g)

with open('src/components/ConstellationView.jsx', 'r') as f:
    cv = f.read()

if 'gap-10 items-center' in cv:
    cv = cv.replace('gap-10 items-center', 'gap-16 items-center')
    print('ConstellationView: gap-16')

if 'lg:col-span-6 space-y-8 max-w-3xl z-30' in cv:
    cv = cv.replace(
        'className="lg:col-span-6 space-y-8 max-w-3xl z-30"',
        'className="lg:col-span-6 space-y-8 max-w-3xl lg:-ml-12 xl:-ml-20 z-30"'
    )
    print('ConstellationView: text pushed left')

with open('src/components/ConstellationView.jsx', 'w') as f:
    f.write(cv)

with open('src/App.jsx', 'r') as f:
    app = f.read()

if 'gap-8 items-center' in app:
    app = app.replace('gap-8 items-center', 'gap-12 items-center')
    print('App.jsx: gap-12')

if 'overflow-hidden my-auto"' in app:
    app = app.replace(
        'className="lg:col-span-6 flex items-center justify-end relative overflow-hidden my-auto"',
        'className="lg:col-span-6 flex items-center justify-end relative overflow-visible my-auto"'
    )
    print('App.jsx: overflow-visible')

with open('src/App.jsx', 'w') as f:
    f.write(app)

print("\nAll fixes applied!")
