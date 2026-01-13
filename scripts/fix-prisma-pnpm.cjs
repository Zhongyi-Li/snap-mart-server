const fs = require('node:fs');
const path = require('node:path');

function ensureSymlink(linkPath, targetPath) {
  try {
    const stat = fs.lstatSync(linkPath);
    if (stat.isSymbolicLink()) return;
    fs.rmSync(linkPath, { recursive: true, force: true });
  } catch {
    // ignore
  }

  const relativeTarget = path.relative(path.dirname(linkPath), targetPath);
  fs.symlinkSync(relativeTarget, linkPath, 'junction');
}

function main() {
  const projectRoot = path.resolve(__dirname, '..');
  const prismaArtifactsDir = path.join(projectRoot, 'node_modules', '.prisma');
  const prismaClientPkgDir = path.join(
    projectRoot,
    'node_modules',
    '@prisma',
    'client',
  );
  const linkPath = path.join(prismaClientPkgDir, '.prisma');

  if (!fs.existsSync(prismaClientPkgDir)) {
    return;
  }

  if (!fs.existsSync(prismaArtifactsDir)) {
    // Prisma Client might not be generated yet.
    return;
  }

  ensureSymlink(linkPath, prismaArtifactsDir);
}

main();
