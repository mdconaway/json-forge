import path from 'path';
import json from 'rollup-plugin-json';
import babel from 'rollup-plugin-babel';
import uglify from 'rollup-plugin-uglify';
import filesize from 'rollup-plugin-filesize';
import commonjs from 'rollup-plugin-commonjs';
import resolve from 'rollup-plugin-node-resolve';
import progress from 'rollup-plugin-progress';

function rollupConfig({ minify, module }) {
    const moduleName = 'json-forge';
    const dest = minify
        ? `${moduleName}.min.js`
        : module ? `${moduleName}.es.js` : `${moduleName}.js`;

    return {
        input: path.resolve('src', 'index.js'),
        output: {
            name: 'JSONForge',
            file: path.resolve('dist', dest),
            format: module ? 'es' : 'umd'
        },
        plugins: [
            json({
                exclude: 'node_modules/**',
                include: 'package.json',
                preferConst: true
            }),
            module
                ? {}
                : babel({
                      exclude: 'node_modules/**',
                      plugins: ['array-includes', 'transform-object-assign']
                  }),
            commonjs({
                include: 'node_modules/**',
                extensions: ['.js']
            }),
            resolve(),
            minify ? uglify() : {},
            progress(),
            filesize()
        ]
    };
}

export default [rollupConfig({}), rollupConfig({ minify: true }), rollupConfig({ module: true })];
