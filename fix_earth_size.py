import re

with open('src/components/Globe3D.jsx', 'r') as f:
    content = f.read()

# Find ANY number before "* sizeScale" and replace with 1250
old_match = re.search(r'desiredDimension = Math\.round\((\d+) \* sizeScale\)', content)
if old_match:
    old_num = old_match.group(1)
    content = content.replace(
        f'desiredDimension = Math.round({old_num} * sizeScale)',
        'desiredDimension = Math.round(1250 * sizeScale)'
    )
    print(f'✅ Changed globe base size from {old_num} to 1250')
else:
    print('❌ Pattern not found')

with open('src/components/Globe3D.jsx', 'w') as f:
    f.write(content)
