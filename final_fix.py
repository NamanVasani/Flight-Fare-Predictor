import re

print("=== FIXING ALL FILES ===")

# 1. Globe3D.jsx - Bigger earth + push far right
with open('src/components/Globe3D.jsx', 'r') as f:
    g = f.read()

m = re.search(r'Math\.round\((\d+) \* sizeScale\)', g)
if m:
    old = m.group(1)
    g = re.sub(r'Math\.round\(\d+ \* sizeScale\)', 'Math.round(1350 * sizeScale)', g)
    print(f"Globe size: {old} -> 1350")

# Push earth far right
g = g.replace(
    "const shiftClass = shiftRight\n    ? 'translate-x-32 sm:translate-x-44 lg:translate-x-56 xl:translate-x-72' \n    : 'translate-x-24 sm:translate-x-36 lg:translate-x-48 xl:translate-x-60';",
    "const shiftClass = shiftRight\n    ? 'translate-x-40 sm:translate-x-52 lg:translate-x-64 xl:translate-x-80' \n    : 'translate-x-32 sm:translate-x-44 lg:translate-x-56 xl:translate-x-72';"
)
print("Globe pushed far right")

with open('src/components/Globe3D.jsx', 'w') as f:
    f.write(g)

# 2. ConstellationView.jsx - More gap + text far left
with open('src/components/ConstellationView.jsx', 'r') as f:
    cv = f.read()

cv = cv.replace('gap-10 items-center', 'gap-20 items-center')
cv = cv.replace(
    'className="lg:col-span-6 space-y-8 max-w-3xl z-30"',
    'className="lg:col-span-6 space-y-8 max-w-3xl lg:-ml-20 xl:-ml-28 z-30"'
)
print("Landing page: big gap + text far left")

with open('src/components/ConstellationView.jsx', 'w') as f:
    f.write(cv)

# 3. App.jsx - More gap + text far left
with open('src/App.jsx', 'r') as f:
    app = f.read()

app = app.replace('gap-8 items-center', 'gap-16 items-center')
app = app.replace(
    'className="lg:col-span-6 flex flex-col justify-center my-auto z-30"',
    'className="lg:col-span-6 flex flex-col justify-center my-auto lg:-ml-12 xl:-ml-20 z-30"'
)
print("Spinner page: big gap + text far left")

with open('src/App.jsx', 'w') as f:
    f.write(app)

print("=== ALL FIXES DONE ===")
