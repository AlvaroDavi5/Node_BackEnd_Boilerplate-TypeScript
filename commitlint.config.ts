import type { UserConfig } from '@commitlint/types';

const config: UserConfig = {
	extends: ['@commitlint/config-conventional'],
	rules: {
		'body-max-line-length': [2, 'always', 200],
		'footer-max-line-length': [2, 'always', 150],
	},
};

export default config;
