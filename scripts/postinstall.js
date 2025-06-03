// eslint-disable-next-line import/unambiguous, @typescript-eslint/no-var-requires
const { execSync } = require('child_process');


if (process.env.CI !== 'true') {
	execSync('npx lefthook install', { stdio: 'inherit' });
}
