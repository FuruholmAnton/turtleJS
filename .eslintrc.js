module.exports = {
	"root": true,
	"extends": ["google"],
	"parserOptions": {
		"ecmaVersion": 6,
        "sourceType": "module",
	},
	"rules": {
		"semi": 2,
		"require-jsdoc": 0,
		"valid-jsdoc": [1, {
			"prefer": {
				"return": "returns"
			},
			"requireReturn": false
		}],
		"keyword-spacing": 2,
		"max-len": 0,
		"object-curly-spacing": [2, "always"],
		"brace-style": 0
	},
	"env": {
		"browser": true,
		"node": true,
		"es6": true
	},
};