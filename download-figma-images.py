#!/usr/bin/env python3
import os
import requests
import json
import time

FILE_KEY = 'sW8fM05nHmqIKarRGqYS1Z'
OUTPUT_DIR = r'C:\Users\User\workspace\snug\apps\web\public\images\host-intro'

# Try to get token from environment or Figma config
FIGMA_TOKEN = os.environ.get('FIGMA_ACCESS_TOKEN') or os.environ.get('FIGMA_TOKEN')

if not FIGMA_TOKEN:
    # Try to read from MCP config
    config_paths = [
        os.path.expanduser('~/.config/claude/config.json'),
        os.path.expanduser('~/AppData/Roaming/Claude/config.json'),
    ]

    for config_path in config_paths:
        if os.path.exists(config_path):
            try:
                with open(config_path, 'r') as f:
                    config = json.load(f)
                    # Try to find Figma token in MCP config
                    if 'mcpServers' in config and 'figma' in config['mcpServers']:
                        env = config['mcpServers']['figma'].get('env', {})
                        FIGMA_TOKEN = env.get('FIGMA_ACCESS_TOKEN') or env.get('FIGMA_PERSONAL_ACCESS_TOKEN')
                        if FIGMA_TOKEN:
                            break
            except:
                pass

if not FIGMA_TOKEN:
    print('Error: Could not find FIGMA_ACCESS_TOKEN')
    print('Please set FIGMA_ACCESS_TOKEN environment variable or configure Figma MCP server')
    exit(1)

images = [
    {'nodeId': '6246:114484', 'filename': 'pain-point-1.png'},
    {'nodeId': '6246:114482', 'filename': 'pain-point-2.png'},
    {'nodeId': '6246:113974', 'filename': 'value-illustration.png'},
    {'nodeId': '6246:113782', 'filename': 'dashboard-preview.png'},
    {'nodeId': '6246:114571', 'filename': 'dashboard-circle.png'},
    {'nodeId': '6246:114575', 'filename': 'operations-preview.png'},
    {'nodeId': '6246:113883', 'filename': 'eligibility-1.png'},
    {'nodeId': '6246:113891', 'filename': 'eligibility-2.png'},
]

# Create output directory if it doesn't exist
os.makedirs(OUTPUT_DIR, exist_ok=True)

def get_image_urls(node_ids):
    """Get image URLs from Figma API"""
    ids_param = ','.join(node_ids)
    url = f'https://api.figma.com/v1/images/{FILE_KEY}?ids={ids_param}&format=png&scale=2'

    headers = {
        'X-Figma-Token': FIGMA_TOKEN
    }

    response = requests.get(url, headers=headers)
    response.raise_for_status()

    data = response.json()

    if 'err' in data:
        raise Exception(f"Figma API error: {data['err']}")

    return data['images']

def download_image(url, filepath):
    """Download image from URL to filepath"""
    response = requests.get(url)
    response.raise_for_status()

    with open(filepath, 'wb') as f:
        f.write(response.content)

print('Starting download of Figma images...\n')

# Get all image URLs at once
node_ids = [img['nodeId'] for img in images]
try:
    print('Fetching image URLs from Figma...')
    image_urls = get_image_urls(node_ids)
    print(f'✓ Got {len(image_urls)} image URLs\n')
except Exception as e:
    print(f'✗ Error fetching image URLs: {e}')
    exit(1)

# Download each image
for image in images:
    node_id = image['nodeId']
    filename = image['filename']

    if node_id not in image_urls:
        print(f'✗ No URL found for {filename} (node: {node_id})\n')
        continue

    url = image_urls[node_id]
    if not url:
        print(f'✗ Empty URL for {filename}\n')
        continue

    filepath = os.path.join(OUTPUT_DIR, filename)

    try:
        print(f'Downloading {filename}...')
        download_image(url, filepath)

        # Verify file was created
        if os.path.exists(filepath):
            size = os.path.getsize(filepath)
            print(f'✓ {filename} saved successfully ({size:,} bytes)\n')
        else:
            print(f'✗ {filename} - file not created\n')
    except Exception as e:
        print(f'✗ Error downloading {filename}: {e}\n')

print('Download complete!')
