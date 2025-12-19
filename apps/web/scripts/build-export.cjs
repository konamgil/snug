const fs = require('node:fs');
const path = require('node:path');
const { spawn } = require('node:child_process');

const projectRoot = path.resolve(__dirname, '..');
const middlewarePath = path.join(projectRoot, 'src', 'middleware.ts');
const disabledPath = `${middlewarePath}.disabled`;
const nextBin = path.join(projectRoot, 'node_modules', 'next', 'dist', 'bin', 'next');

function ensureNoConflict() {
  if (fs.existsSync(middlewarePath) && fs.existsSync(disabledPath)) {
    console.error(
      'Both middleware.ts and middleware.ts.disabled exist. Resolve this before building.'
    );
    process.exit(1);
  }
}

function disableMiddleware() {
  if (fs.existsSync(middlewarePath)) {
    fs.renameSync(middlewarePath, disabledPath);
  }
}

function enableMiddleware() {
  if (fs.existsSync(disabledPath)) {
    fs.renameSync(disabledPath, middlewarePath);
  }
}

function runNextBuild(target) {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [nextBin, 'build', '--webpack'], {
      cwd: projectRoot,
      stdio: 'inherit',
      env: {
        ...process.env,
        WEB_BUILD: target,
      },
    });

    child.on('close', (code) => {
      if (code === 0) {
        resolve();
        return;
      }
      reject(new Error(`next build failed with exit code ${code}`));
    });
  });
}

async function main() {
  ensureNoConflict();
  disableMiddleware();

  try {
    await runNextBuild('export');
  } finally {
    enableMiddleware();
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
