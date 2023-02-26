import { exec, ExecException } from 'child_process';


function runAudit() {
	const callback = (error: ExecException | null, stdout: string, stderr: string) => {
		console.log(stdout);
		if (error) {
			const lines = stdout.split('\n');
			for (let i = 0; i < lines.length; i++) {
				if (
					lines[i].startsWith('Severity: ') &&
					(lines[i].includes('High') || lines[i].includes('Critical'))
				) {
					throw new Error(
						'Security check failed, High or Critical vulnerability found'
					);
				} else if (
					lines[i].startsWith('Severity: ') &&
					!lines[i].includes('High') &&
					!lines[i].includes('Critical')
				) {
					return;
				}
			}
			throw new Error(`Error occurred:\n${stderr}`);
		}
	};

	exec('yarn audit', callback);
}

runAudit();
