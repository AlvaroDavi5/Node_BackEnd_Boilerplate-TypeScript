import { SHA256, AES } from 'crypto-js'
import jwt from 'jsonwebtoken'
import staticDotenv from "../config/constants/staticDotenv"


function hashValue(value) {

	const hashCode = SHA256(value)
	const hash = hashCode.toString()

	return hash
}

function encryptPass(pass_phrase) {

	const cypher = AES.encrypt(`${pass_phrase}`, staticDotenv.secure.secret_key)
	AES.decrypt(cypher, staticDotenv.secure.secret_key)
	const encriptedPass = cypher.toString()

	return encriptedPass
}

function decryptPass(cypher) {

	const decypher = AES.decrypt(cypher, staticDotenv.secure.secret_key)
	const decryptedPass = decypher.toString()

	return decryptedPass
}

function generateToken(user_id, user_email) {
	const token = jwt.sign(
		{
			user_id: user_id,
			user_email: user_email
		},
		staticDotenv.secure.secret_key,
		{
			expiresIn: '3h'
		}
	)

	return token
}

function decodeToken(token) {
	const decoded = jwt.decode(token, staticDotenv.secure.secret_key)

	try {
		const verified = jwt.verify(token, staticDotenv.secure.secret_key)
		if (verified) {
			return {
				message: "Token verified successfully!",
				decoded: decoded
			}
		}
		else {
			return {
				message: "Token not verified!",
				decoded: decoded
			}
		}
	}
	catch (error) {
		return {
			message: error.message,
			decoded: null
		}
	}
}


export { hashValue, encryptPass, decryptPass, generateToken, decodeToken }
