// eslint-disable-next-line import/unambiguous
module.exports = {
	extends: ['@commitlint/config-conventional'],
	rules: {
		'body-max-line-length': [2, 'always', 200],
		'footer-max-line-length': [2, 'always', 150],
	},
};
