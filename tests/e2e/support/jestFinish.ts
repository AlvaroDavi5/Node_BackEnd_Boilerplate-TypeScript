export default async () => {
	await new Promise((resolve) => setTimeout(() => resolve(process.exit(0)), 500));
};
