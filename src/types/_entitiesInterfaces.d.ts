
export interface UserPreferenceInterface {
	id: number,
	userId: number,
	imagePath: string,
	defaultTheme: number,
	createdAt: Date,
	updatedAt: Date,
}

export interface UserInterface {
	id: number,
	fullName: string,
	email: string,
	password: string,
	phone: string,
	docType: string,
	document: string,
	uf: string,
	preference: UserPreferenceInterface,
	createdAt: Date,
	updatedAt: Date,
}
