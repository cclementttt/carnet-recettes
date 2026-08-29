#!/bin/bash
set -e

echo "Building web app..."
npx expo export --platform web --clear

echo "Generating PWA icons from logo..."
python3 -c "
from PIL import Image
logo = Image.open('assets/logo-recette.png').convert('RGBA')
logo.resize((192, 192), Image.LANCZOS).save('dist/icon-192.png')
logo.resize((512, 512), Image.LANCZOS).save('dist/icon-512.png')
logo.resize((180, 180), Image.LANCZOS).save('dist/apple-touch-icon.png')
logo.resize((48, 48), Image.LANCZOS).save('dist/favicon.ico', format='ICO', sizes=[(48,48)])
print('Icons generated')
"

echo "Fixing manifest..."
python3 -c "
import json
m = json.load(open('dist/manifest.json'))
m['start_url'] = '/'
for icon in m.get('icons', []):
    icon['src'] = '/' + icon['src'].split('/')[-1]
json.dump(m, open('dist/manifest.json', 'w'), indent=2)
print('Manifest fixed')
"

echo "Patching index.html..."
sed -i '' 's|<link rel="icon" href="/favicon.ico" /></head>|<link rel="icon" href="/favicon.ico" />\n<link rel="apple-touch-icon" href="/apple-touch-icon.png" />\n<link rel="manifest" href="/manifest.json" /></head>|' dist/index.html
echo "index.html patched"

echo "Deploying to Firebase..."
firebase deploy --only hosting

echo "Done! App live at https://carnet-recettes-app.web.app"
