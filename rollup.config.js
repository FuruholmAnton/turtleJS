import resolve from 'rollup-plugin-node-resolve';
import babel from 'rollup-plugin-babel';
import uglify from 'rollup-plugin-uglify';

export default {
	entry: 'src/turtle.js',
	format: 'cjs',
	plugins: [
		resolve(),
		babel({
			exclude: 'node_modules/**', // only transpile our source code
		}),
		uglify(),
	],
	dest: 'build/turtle.js', // equivalent to --output
};
