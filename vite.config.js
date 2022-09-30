import {defineConfig} from 'vite'
import {resolve} from "path";
import typescript from "rollup-plugin-typescript2";

export default defineConfig({
    test: {
        environment: 'happy-dom', // or 'jsdom', 'node',
        dir: 'test',b
    }, root: 'vite-dev', build: {
        outDir: '../dist', emptyOutDir: true, target: 'modules', //modules: support dynamic imports defined in ES2020
        lib: {
            entry: resolve(__dirname, 'src/ol-print-layout-control.ts'),
            name: 'ol-print-layout-control', // fileName: 'PrintLayout',
            fileName: () => 'ol-print-layout-control.js',
            formats: ['umd']
        }, sourcemap: true, rollupOptions: {
            external: ['ol', 'ol/proj', 'ol/sphere', 'ol/size', 'ol/control/Control',], output: {
                globals: {
                    ol: 'ol',
                    "ol/sphere": 'ol.sphere',
                    "ol/proj": 'ol.proj',
                    "ol/control/Control": 'ol.control.Control',
                }, assetFileNames: (chunkInfo) => {
                    if (chunkInfo.name === 'style.css') {
                        return 'ol-print-layout-control.css';
                    }
                },
            },
        }
    }, plugins: [{
        ...typescript({
            tsconfig: "tsconfig.json",
            clean: true,
            abortOnError: false,
            check: true
        }), enforce: 'pre',
    }]
})