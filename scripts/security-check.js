// eslint-disable-next-line import/unambiguous, @typescript-eslint/no-var-requires
const { exec } = require('child_process');


function runAudit() {
	const callback = (error, stdout, stderr) => {
		console.log(stdout);

		if (error) {
			const lines = stdout?.split('\n');
			let shouldThrow = true;

			for (const line of lines) {
				if (line?.startsWith('Severity: ')) {
					if (line?.includes('critical') || line?.includes('high')) {
						const errorMsg = 'Security check failed, High or Critical vulnerability found';
						console.error(errorMsg);
						throw new Error(errorMsg);
					} else if (line?.includes('moderate') || line?.includes('low') || line?.includes('info')) {
						console.warn('Security check passed, but Info, Low or Moderate vulnerability found');
						shouldThrow = false;
					}
				}
			}

			if (shouldThrow)
				throw new Error(`Error occurred: \n${stderr}`);
		}
	};

	exec('npm audit', callback);
}

runAudit();
