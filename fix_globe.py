with open('src/components/Globe3D.jsx', 'r') as f:
    g = f.read()

# 1. Full earth camera zoom
g = g.replace('altitude: 1.7', 'altitude: 2.5')

# 2. Revert height to original tall values
g = g.replace(
    'h-[750px] sm:h-[900px] lg:h-[1050px] xl:h-[1150px]',
    'h-[750px] sm:h-[900px] lg:h-[1050px] xl:h-[1150px]'
)
g = g.replace(
    'h-[55vh] sm:h-[60vh] lg:h-[70vh] xl:h-[75vh]',
    'h-[750px] sm:h-[900px] lg:h-[1050px] xl:h-[1150px]'
)

# 3. Revert translate shifts to original
g = g.replace(
    "const shiftClass = shiftRight\n    ? 'translate-x-8 sm:translate-x-12 lg:translate-x-16 xl:translate-x-20' \n    : 'translate-x-4 sm:translate-x-8 lg:translate-x-12 xl:translate-x-16';",
    "const shiftClass = shiftRight\n    ? 'translate-x-24 sm:translate-x-36 lg:translate-x-48 xl:translate-x-60' \n    : 'translate-x-16 sm:translate-x-28 lg:translate-x-36 xl:translate-x-44';"
)

# 4. Revert halo size to original
g = g.replace(
    'w-[600px] h-[600px] sm:w-[800px] sm:h-[800px] lg:w-[1000px] lg:h-[1000px]',
    'w-[800px] h-[800px] sm:w-[1000px] sm:h-[1000px] lg:w-[1350px] lg:h-[1350px]'
)

with open('src/components/Globe3D.jsx', 'w') as f:
    f.write(g)

print('Globe3D.jsx fixed for full earth view')
