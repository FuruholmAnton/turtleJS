import resolve from 'rollup-plugin-node-resolve';
import babel from 'rollup-plugin-babel';

export default {
	entry: 'turtle.js',
	format: 'cjs',
	plugins: [
		resolve(),
		babel({
			exclude: 'node_modules/**', // only transpile our source code
		}),
	],
	dest: 'turtle.es5.js', // equivalent to --output
};
