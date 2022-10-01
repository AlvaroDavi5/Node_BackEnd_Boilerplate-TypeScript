import fs from 'fs'


function readJSONFile(filePath: string): Promise<any[]> {

	return new Promise((resolve, reject) => {
		fs.readFile(filePath, (err, data) => {
			if(err) {
				reject(err)
			}
			else {
				resolve(JSON.parse(data.toString()))
			}
		})
	})
}

export async function getAllBrazilStates(): Promise<any[]> {

	try {
		let query = await fetch("https://servicodados.ibge.gov.br/api/v1/localidades/estados")
		const data = await query?.json()

		return data
	}
	catch(error: unknown) {
		return readJSONFile("./src/template/BrazilStates.json")
	}
}

export async function getBrazilState(uf: string): Promise<any> {

	try {
		let query = await fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${uf}`)
		const data = await query?.json()

		return data
	}
	catch(error: unknown) {
		return {
			data: null,
			error: error
		}
	}
}
