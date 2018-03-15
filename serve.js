import path from 'path';
import json from 'rollup-plugin-json';
import babel from 'rollup-plugin-babel';
import commonjs from 'rollup-plugin-commonjs';
import resolve from 'rollup-plugin-node-resolve';
import serve from 'rollup-plugin-serve';
import livereload from 'rollup-plugin-livereload';

const basePath = path.resolve('tmp');
const dest = `json-forge.js`;

export default {
    input: path.resolve('src', 'index.js'),
    output: {
        name: 'JSONForge',
        file: path.resolve(basePath, dest),
        format: 'umd'
    },
    plugins: [
        json({
            exclude: 'node_modules/**',
            include: 'package.json',
            preferConst: true
        }),
        babel({
            exclude: 'node_modules/**',
            plugins: ['array-includes', 'transform-object-assign']
        }),
        commonjs({
            include: 'node_modules/**',
            extensions: ['.js']
        }),
        resolve(),
        serve({
            open: false,
            verbose: true,
            contentBase: ['public', 'tmp', 'src'],
            port: 3000
        }),
        livereload()
    ]
};
