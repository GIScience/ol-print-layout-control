import {defineConfig} from 'vite'
import {resolve} from "path";
import typescript from "rollup-plugin-typescript2";

export default defineConfig(({command, mode, ssrBuild}) => {
    console.log(command, mode);
    let baseConfig = {
        test: {
            environment: 'happy-dom', // or 'jsdom', 'happy-dom', 'node',
            dir: 'test',
            coverage:{
                provider: 'istanbul', // or 'v8'
                reportsDirectory: '../coverage'
            }
        },
        root: 'vite-dev',
        build: {
            outDir: '../dist',
            emptyOutDir: true,
            target: 'baseline-widely-available', //modules: support dynamic imports defined in ES2020 //vite v7 'baseline-widely-available'
            lib: {
                entry: resolve(__dirname, 'src/ol-print-layout-control.ts'),
                name: 'ol-print-layout-control', // fileName: 'PrintLayout',
                fileName: () => 'ol-print-layout-control.js',
                cssFileName: 'ol-print-layout-control',
                formats: ['umd']
            },
            sourcemap: true,
            rollupOptions: {
                external: ['ol', 'ol/proj', 'ol/sphere', 'ol/size', 'ol/control/Control',],
                output: {
                    globals: {
                        ol: 'ol',
                        "ol/sphere": 'ol.sphere',
                        "ol/proj": 'ol.proj',
                        "ol/control/Control": 'ol.control.Control',
                    },
                }
            }
        },
        plugins:[]
    };

    const buildTypescriptDeclarationFilePlugin = {
        ...typescript({
            tsconfig: "tsconfig.json",
            clean: true,
            abortOnError: true,
            check: true
        }),
        enforce: 'pre',
    }

    if ( command === 'build') {
        baseConfig.plugins.push(buildTypescriptDeclarationFilePlugin)
        return baseConfig;
    } else{
        //serve development | test
       return baseConfig;
    }

})
