import zipfile
import os

zip_path = '/home/lowkey/Downloads/Kimi_Agent_Football 2026 Theme Design.zip'
dest = '/home/lowkey/matchstake/design_ref'

os.makedirs(dest, exist_ok=True)

with zipfile.ZipFile(zip_path, 'r') as z:
    names = z.namelist()
    for n in names[:60]:
        print(n)
    print(f'--- total: {len(names)} files ---')
