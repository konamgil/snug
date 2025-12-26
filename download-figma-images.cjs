const https = require('https');
const fs = require('fs');
const path = require('path');

const FILE_KEY = 'sW8fM05nHmqIKarRGqYS1Z';
const OUTPUT_DIR = 'C:/Users/User/workspace/snug/apps/web/public/images/host-intro';

// Get Figma token from environment
const FIGMA_TOKEN = process.env.FIGMA_ACCESS_TOKEN;

if (!FIGMA_TOKEN) {
  console.error('Error: FIGMA_ACCESS_TOKEN environment variable not set');
  process.exit(1);
}

const images = [
  { nodeId: '6246:114484', filename: 'pain-point-1.png' },
  { nodeId: '6246:114482', filename: 'pain-point-2.png' },
  { nodeId: '6246:113974', filename: 'value-illustration.png' },
  { nodeId: '6246:113782', filename: 'dashboard-preview.png' },
  { nodeId: '6246:114571', filename: 'dashboard-circle.png' },
  { nodeId: '6246:114575', filename: 'operations-preview.png' },
  { nodeId: '6246:113883', filename: 'eligibility-1.png' },
  { nodeId: '6246:113891', filename: 'eligibility-2.png' },
];

function getImageUrl(nodeId) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.figma.com',
      path: `/v1/images/${FILE_KEY}?ids=${nodeId}&format=png&scale=2`,
      headers: {
        'X-Figma-Token': FIGMA_TOKEN
      }
    };

    https.get(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (json.err) {
            reject(new Error(json.err));
          } else {
            resolve(json.images[nodeId]);
          }
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

function downloadImage(url, filepath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(filepath);
    https.get(url, (response) => {
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve();
      });
    }).on('error', (err) => {
      fs.unlink(filepath, () => {});
      reject(err);
    });
  });
}

async function downloadAll() {
  console.log('Starting download of Figma images...\n');

  for (const image of images) {
    try {
      console.log(`Fetching URL for ${image.filename}...`);
      const url = await getImageUrl(image.nodeId);

      const filepath = path.join(OUTPUT_DIR, image.filename);
      console.log(`Downloading to ${filepath}...`);
      await downloadImage(url, filepath);

      console.log(`✓ ${image.filename} saved successfully\n`);
    } catch (error) {
      console.error(`✗ Error downloading ${image.filename}:`, error.message, '\n');
    }
  }

  console.log('Download complete!');
}

downloadAll();
