import { getAllBrazilStates } from "../../services/apiRequester"


// testing async function
test("fetching IBGE API", () => {
	return getAllBrazilStates().then((data) => {
		expect(data[2]?.sigla).toBe('AM')
	})
})
