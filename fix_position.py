import re

with open('src/components/Globe3D.jsx', 'r') as f:
    g = f.read()

# Push earth FAR RIGHT (large translate values)
g = g.replace(
    "const shiftClass = shiftRight\n    ? 'translate-x-8 sm:translate-x-12 lg:translate-x-16 xl:translate-x-20' \n    : 'translate-x-4 sm:translate-x-8 lg:translate-x-12 xl:translate-x-16';",
    "const shiftClass = shiftRight\n    ? 'translate-x-32 sm:translate-x-44 lg:translate-x-56 xl:translate-x-72' \n    : 'translate-x-24 sm:translate-x-36 lg:translate-x-48 xl:translate-x-60';"
)
print('Globe3D: Earth pushed far right')

with open('src/components/Globe3D.jsx', 'w') as f:
    f.write(g)

with open('src/components/ConstellationView.jsx', 'r') as f:
    cv = f.read()

# Push text FAR LEFT (negative margin)
if 'lg:col-span-6 space-y-8 max-w-3xl z-30' in cv:
    cv = cv.replace(
        'className="lg:col-span-6 space-y-8 max-w-3xl z-30"',
        'className="lg:col-span-6 space-y-8 max-w-3xl lg:-ml-16 xl:-ml-24 z-30"'
    )
    print('ConstellationView: Text pushed far left')

with open('src/components/ConstellationView.jsx', 'w') as f:
    f.write(cv)

with open('src/App.jsx', 'r') as f:
    app = f.read()

# Push text left on spinner page too
if 'lg:col-span-6 flex flex-col justify-center my-auto z-30' in app:
    app = app.replace(
        'className="lg:col-span-6 flex flex-col justify-center my-auto z-30"',
        'className="lg:col-span-6 flex flex-col justify-center my-auto lg:-ml-10 xl:-ml-16 z-30"'
    )
    print('App.jsx: Text pushed left on spinner page')

with open('src/App.jsx', 'w') as f:
    f.write(app)

print('All positioning fixes applied')
