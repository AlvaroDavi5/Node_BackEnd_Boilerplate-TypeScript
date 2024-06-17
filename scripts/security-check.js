// eslint-disable-next-line @typescript-eslint/no-var-requires
const { exec } = require('child_process');


function runAudit() {
	const callback = (error, stdout, stderr) => {
		console.log(stdout);
		if (error) {
			const lines = stdout?.split('\n');

			for (let i = 0; i < lines.length; i++) {
				if (lines[i]?.startsWith('Severity: ')) {
					if (
						lines[i]?.includes('High')
						|| lines[i]?.includes('Critical')
					) {
						throw new Error(
							'Security check failed, High or Critical vulnerability found'
						);
					} else if (
						lines[i].includes('Info')
						|| lines[i].includes('Low')
						|| lines[i].includes('Moderate')
					) {
						console.error('Security check passed, but Info, Low or Moderate vulnerability found');
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
