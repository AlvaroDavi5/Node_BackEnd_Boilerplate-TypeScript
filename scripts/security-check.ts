import { exec } from 'child_process';
import type { ExecException } from 'child_process';


interface AuditMetadata {
	vulnerabilities?: {
		critical: number;
		high: number;
		moderate: number;
		low: number;
		info: number;
		total: number;
	};
}

interface AuditResult {
	metadata?: AuditMetadata;
}

exec('npm audit --json', (error: ExecException | null, stdout: string, stderr: string) => {
	if (error && !stdout) {
		console.error('Error running npm audit:', stderr);
		process.exit(1);
	}

	let auditResult: AuditResult;
	try {
		auditResult = JSON.parse(stdout);
	} catch (parseError) {
		console.error('Failed to parse npm audit output:', (parseError as Error).message);
		process.exit(1);
	}

	const vulnerabilities = auditResult.metadata?.vulnerabilities;

	if (!vulnerabilities) {
		console.info('No vulnerabilities found.');
		process.exit(0);
	}

	const {
		critical = 0,
		high = 0,
		moderate = 0,
		low = 0,
		info = 0,
		total = 0
	} = vulnerabilities;

	console.log('Vulnerability summary:');
	console.log(`Critical: ${critical}`);
	console.log(`High:     ${high}`);
	console.log(`Moderate: ${moderate}`);
	console.log(`Low:      ${low}`);
	console.log(`Info:     ${info}`);
	console.log(`Total:    ${total}`);

	if (critical > 0 || high > 0) {
		console.error('Critical or High vulnerabilities found!');
		process.exit(1);
	}

	if (total > 10) {
		console.warn('More than 10 total vulnerabilities detected!');
		process.exit(1);
	}

	if (moderate > 0 || low > 0) {
		console.warn('Moderate or Low vulnerabilities found!');
		process.exit(0);
	}

	console.info('No vulnerabilities found.');
	process.exit(0);
});
