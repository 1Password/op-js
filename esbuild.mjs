import { context } from 'esbuild';
import { execSync } from 'child_process';
import { readdirSync, statSync } from 'fs';
import { join } from 'path';

const isWatch = process.argv.includes('--watch');
const isProd = process.env.NODE_ENV === 'production';

// Build everything except test files
const getEntryPoints = (dir) => {
  const entryPoints = [];
  
  const scanDirectory = (currentDir, relativePath = '') => {
    const items = readdirSync(currentDir);
    
    for (const item of items) {
      const fullPath = join(currentDir, item);
      const relativeItemPath = relativePath ? join(relativePath, item) : item;
      
      if (statSync(fullPath).isDirectory()) {
        scanDirectory(fullPath, relativeItemPath);
      } else if (item.endsWith('.ts') && !item.endsWith('.test.ts') && item !== "test-utils.ts") {
        entryPoints.push(join(dir, relativeItemPath));
      }
    }
  };
  
  scanDirectory(dir);
  return entryPoints;
};

const config = {
  entryPoints: getEntryPoints('src'),
  bundle: false,
  platform: 'node',
  format: 'cjs',
  outdir: 'dist/',
  sourcemap: !isProd,
  logLevel: 'warning'
};

const generateTypes = () => {
  try {
    console.log("Generating TypeScript declarations...");
    execSync('tsc -p tsconfig.release.json', { stdio: 'inherit' });
    console.log("TypeScript declarations generated successfully");
  } catch (error) {
    console.error("Failed to generate TypeScript declarations:", error.message);
    process.exit(1);
  }
};

const run = async () => {
  const ctx = await context(config);
  if (isWatch) {
    console.log("Watching for file changes...");
    await ctx.watch();
  } else {
    await ctx.rebuild().then(() => {
      ctx.dispose();
      generateTypes();
    });
  }
};

run();
