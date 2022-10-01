const crypto = require("../../services/encryptPass")


test("hashing test", () => {
	expect(crypto.hashValue("senha")).toBe("b7e94be513e96e8c45cd23d162275e5a12ebde9100a425c4ebcdd7fa4dcd897c")
})
