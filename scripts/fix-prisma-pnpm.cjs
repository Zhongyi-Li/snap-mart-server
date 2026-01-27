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

  const prismaArtifactsDirCandidates = [];

  // Classic layout (npm/yarn/pnpm with root artifacts)
  prismaArtifactsDirCandidates.push(
    path.join(projectRoot, 'node_modules', '.prisma'),
  );

  // pnpm store layout: generated artifacts can live next to the real package
  // path, e.g. node_modules/.pnpm/.../node_modules/.prisma
  try {
    const realPrismaClientPkgDir = fs.realpathSync(prismaClientPkgDir);
    prismaArtifactsDirCandidates.push(
      path.resolve(realPrismaClientPkgDir, '..', '..', '.prisma'),
    );
  } catch {
    // ignore
  }

  const prismaArtifactsDir = prismaArtifactsDirCandidates.find((candidate) =>
    fs.existsSync(candidate),
  );

  if (!prismaArtifactsDir) {
    // Prisma Client might not be generated yet.
    return;
  }

  ensureSymlink(linkPath, prismaArtifactsDir);
}

main();
