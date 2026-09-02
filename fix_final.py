import re

# ===== REVERT + FIX Globe3D.jsx =====
with open('src/components/Globe3D.jsx', 'r') as f:
    g = f.read()

# 1. Revert altitude back to original 1.7 (not too zoomed out)
g = g.replace('altitude: 2.5', 'altitude: 1.7')
g = g.replace('altitude: 3.5', 'altitude: 1.7')

# 2. Keep original tall heights
g = g.replace(
    'h-[55vh] sm:h-[60vh] lg:h-[70vh] xl:h-[75vh]',
    'h-[750px] sm:h-[900px] lg:h-[1050px] xl:h-[1150px]'
)

# 3. Revert translate shifts to original
g = g.replace(
    "const shiftClass = shiftRight\n    ? 'translate-x-8 sm:translate-x-12 lg:translate-x-16 xl:translate-x-20' \n    : 'translate-x-4 sm:translate-x-8 lg:translate-x-12 xl:translate-x-16';",
    "const shiftClass = shiftRight\n    ? 'translate-x-24 sm:translate-x-36 lg:translate-x-48 xl:translate-x-60' \n    : 'translate-x-16 sm:translate-x-28 lg:translate-x-36 xl:translate-x-44';"
)

# 4. Revert halo to original
g = g.replace(
    'w-[600px] h-[600px] sm:w-[800px] sm:h-[800px] lg:w-[1000px] lg:h-[1000px]',
    'w-[800px] h-[800px] sm:w-[1000px] sm:h-[1000px] lg:w-[1350px] lg:h-[1350px]'
)

# 5. CRITICAL FIX: Change outer container from overflow-hidden back to overflow-visible
# BUT add a max-width check so it doesn't overflow on Windows
g = g.replace(
    'className="relative w-full h-[750px] sm:h-[900px] lg:h-[1050px] xl:h-[1150px] flex items-center justify-end pointer-events-auto overflow-hidden my-auto"',
    'className="relative w-full h-[750px] sm:h-[900px] lg:h-[1050px] xl:h-[1150px] flex items-center justify-end pointer-events-auto overflow-visible my-auto"'
)

# 6. KEY FIX: Reduce base globe size so it fits on all screens without overflowing
# 1150 -> 950 (smaller globe = fits inside viewport = no scrollbar)
g = g.replace('1150 * sizeScale', '950 * sizeScale')

with open('src/components/Globe3D.jsx', 'w') as f:
    f.write(g)
print("✅ Globe3D.jsx: Original layout + smaller size (950px base)")

# ===== REVERT App.jsx =====
with open('src/App.jsx', 'r') as f:
    app = f.read()

app = app.replace(
    'className="min-h-screen bg-[#FAF7F2] text-[#3C1318] flex flex-col justify-between selection:bg-[#00F2FE]/30 selection:text-[#3C1318] relative font-sans"',
    'className="min-h-dvh bg-[#FAF7F2] text-[#3C1318] flex flex-col justify-between overflow-x-hidden selection:bg-[#00F2FE]/30 selection:text-[#3C1318] relative font-sans"'
)

app = app.replace(
    'className="lg:col-span-6 flex items-center justify-end relative overflow-hidden my-auto"',
    'className="lg:col-span-6 flex items-center justify-end relative overflow-visible my-auto"'
)

with open('src/App.jsx', 'w') as f:
    f.write(app)
print("✅ App.jsx reverted to original")

# ===== REVERT ConstellationView.jsx =====
with open('src/components/ConstellationView.jsx', 'r') as f:
    cv = f.read()

cv = cv.replace('min-h-screen', 'min-h-[calc(100dvh-100px)]')
cv = cv.replace(
    'className="lg:col-span-6 space-y-8 max-w-3xl z-30"',
    'className="lg:col-span-6 space-y-8 max-w-3xl lg:-ml-12 xl:-ml-20 z-30"'
)
cv = cv.replace(
    'className="lg:col-span-6 flex items-center justify-end relative my-auto overflow-hidden"',
    'className="lg:col-span-6 flex items-center justify-end relative my-auto"'
)

with open('src/components/ConstellationView.jsx', 'w') as f:
    f.write(cv)
print("✅ ConstellationView.jsx reverted to original")

# ===== REVERT index.css (remove my additions) =====
with open('src/index.css', 'r') as f:
    css = f.read()

# Remove box-sizing if present
css = css.replace('* { box-sizing: border-box; }\n\n', '')
# Revert clip back to hidden
css = css.replace('overflow-x: clip;', 'overflow-x: hidden;')
# Remove width/max-width/position additions from html/body
css = re.sub(r'    width: 100%;\n    max-width: 100vw;\n', '', css, count=1)
css = re.sub(r'    width: 100%;\n    position: relative;\n', '', css, count=1)

with open('src/index.css', 'w') as f:
    f.write(css)
print("✅ index.css reverted to original")

print("\n🎉 All files reverted + globe size reduced to fit all screens!")
