import re

with open('src/index.css', 'r') as f:
    css = f.read()

if '* { box-sizing: border-box; }' not in css:
    css = '* { box-sizing: border-box; }\n\n' + css

if 'max-width: 100vw' not in css:
    css = css.replace('overflow-x: hidden;', 'overflow-x: hidden;\n    width: 100%;\n    max-width: 100vw;', 1)

if 'position: relative;' not in css:
    css = css.replace('    overflow-x: hidden;\n    margin: 0;', '    overflow-x: hidden;\n    width: 100%;\n    position: relative;\n    margin: 0;', 1)

with open('src/index.css', 'w') as f:
    f.write(css)
print("index.css fixed")

with open('src/App.jsx', 'r') as f:
    app = f.read()

app = app.replace(
    'className="min-h-dvh bg-[#FAF7F2] text-[#3C1318] flex flex-col justify-between overflow-x-hidden selection:bg-[#00F2FE]/30 selection:text-[#3C1318] relative font-sans"',
    'className="min-h-screen bg-[#FAF7F2] text-[#3C1318] flex flex-col justify-between selection:bg-[#00F2FE]/30 selection:text-[#3C1318] relative font-sans"'
)

app = app.replace(
    'className="lg:col-span-6 flex items-center justify-end relative overflow-visible my-auto"',
    'className="lg:col-span-6 flex items-center justify-end relative overflow-hidden my-auto"'
)

with open('src/App.jsx', 'w') as f:
    f.write(app)
print("App.jsx fixed")

with open('src/components/ConstellationView.jsx', 'r') as f:
    cv = f.read()

cv = cv.replace('min-h-[calc(100dvh-100px)]', 'min-h-screen')
cv = cv.replace('className="lg:col-span-6 space-y-8 max-w-3xl lg:-ml-12 xl:-ml-20 z-30"', 'className="lg:col-span-6 space-y-8 max-w-3xl z-30"')
cv = cv.replace('className="lg:col-span-6 flex items-center justify-end relative my-auto">', 'className="lg:col-span-6 flex items-center justify-end relative my-auto overflow-hidden">')

with open('src/components/ConstellationView.jsx', 'w') as f:
    f.write(cv)
print("ConstellationView.jsx fixed")

with open('src/components/Globe3D.jsx', 'r') as f:
    globe = f.read()

globe = globe.replace(
    'className="relative w-full h-[750px] sm:h-[900px] lg:h-[1050px] xl:h-[1150px] flex items-center justify-end pointer-events-auto overflow-visible my-auto"',
    'className="relative w-full h-[55vh] sm:h-[60vh] lg:h-[70vh] xl:h-[75vh] flex items-center justify-end pointer-events-auto overflow-hidden my-auto"'
)

globe = globe.replace(
    "const shiftClass = shiftRight\n    ? 'translate-x-24 sm:translate-x-36 lg:translate-x-48 xl:translate-x-60' \n    : 'translate-x-16 sm:translate-x-28 lg:translate-x-36 xl:translate-x-44';",
    "const shiftClass = shiftRight\n    ? 'translate-x-8 sm:translate-x-12 lg:translate-x-16 xl:translate-x-20' \n    : 'translate-x-4 sm:translate-x-8 lg:translate-x-12 xl:translate-x-16';"
)

globe = globe.replace(
    'className={`absolute w-[800px] h-[800px] sm:w-[1000px] sm:h-[1000px] lg:w-[1350px] lg:h-[1350px] rounded-full bg-[#00F2FE]/18 blur-3xl pointer-events-none -z-10 ${shiftClass}`}',
    'className={`absolute w-[600px] h-[600px] sm:w-[800px] sm:h-[800px] lg:w-[1000px] lg:h-[1000px] rounded-full bg-[#00F2FE]/18 blur-3xl pointer-events-none -z-10 ${shiftClass}`}'
)

with open('src/components/Globe3D.jsx', 'w') as f:
    f.write(globe)
print("Globe3D.jsx fixed")

print("All fixes applied")
