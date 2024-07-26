// eslint-disable-next-line import/unambiguous, @typescript-eslint/no-var-requires
const { exec } = require('child_process');


function runAudit() {
	const callback = (error, stdout, stderr) => {
		console.log(stdout);
		if (error) {
			const lines = stdout?.split('\n');

			for (const line of lines) {
				if (line?.startsWith('Severity: ')) {
					if (
						line?.includes('High')
						|| line?.includes('Critical')
					) {
						console.error('Security check failed, High or Critical vulnerability found');
						throw new Error('Security check failed, High or Critical vulnerability found');
					} else if (
						line.includes('Info')
						|| line.includes('Low')
						|| line.includes('Moderate')
					) {
						console.warn('Security check passed, but Info, Low or Moderate vulnerability found');
						return;
					}
				}
			}

			throw new Error(`Error occurred: \n${stderr}`);
		}
	};

	exec('yarn audit', callback);
}

runAudit();
