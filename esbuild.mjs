import { context } from 'esbuild';
import { execSync } from 'child_process';

const isWatch = process.argv.includes('--watch');
const isProd = process.env.NODE_ENV === 'production';

const config = {
  entryPoints: [
    'src/index.ts',
    'src/cli.ts'
  ],
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
