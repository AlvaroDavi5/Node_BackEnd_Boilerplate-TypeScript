
export interface userPreferenceInterface {
	id: number,
	userId: number,
	imagePath: string,
	defaultTheme: number,
	createdAt: Date,
	updatedAt: Date,
}

export interface userInterface {
	id: number,
	fullName: string,
	email: string,
	password: string,
	phone: string,
	docType: string,
	document: string,
	uf: string,
	preference: userPreferenceInterface,
	createdAt: Date,
	updatedAt: Date,
}
