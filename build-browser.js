const esbuild = require('esbuild');
const path = require('path');

// List of files to build
const entryPoints = [
    'src/core/bot.ts',
    'src/core/client-detector.ts',
    'src/core/pixel-detector.ts',
    'src/core/game-interaction.ts',
    'src/core/chat.ts',
    'src/core/combat.ts',
    'src/core/pathfinding.ts',
    'src/types.ts'
].map(file => path.resolve(__dirname, file));

async function build() {
    try {
        // Build all files
        await esbuild.build({
            entryPoints,
            bundle: true,
            outdir: 'public/js',
            format: 'esm',
            platform: 'browser',
            target: 'es2020',
            sourcemap: true,
            loader: { '.ts': 'ts' },
            external: ['express', 'socket.io', 'http'],
            define: {
                'process.env.NODE_ENV': '"development"'
            }
        });

        console.log('Build completed successfully!');
    } catch (error) {
        console.error('Build failed:', error);
        process.exit(1);
    }
}

build();
