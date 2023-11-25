import { Injectable } from '@nestjs/common';
import crypto from 'crypto';
import { genSaltSync } from 'bcrypt';
import { sign, decode, JwtPayload } from 'jsonwebtoken';
import { v4 as uuidV4 } from 'uuid';


type hashAlgorithmType = 'md5' | 'sha256' | 'sha512'

@Injectable()
export default class CryptographyService {
	private readonly IV: string;

	constructor() {
		this.IV = Buffer.alloc(16, 0, 'utf8').toString();
	}

	public changeBufferEncoding(data: string, encoding: BufferEncoding, decoding: BufferEncoding): string {
		return Buffer.from(data, encoding).toString(decoding);
	}

	public encodeJwt(payload: any, inputEncoding: BufferEncoding, expiration = '7d'): string {
		return sign(payload,
			null,
			{
				algorithm: 'none',
				encoding: inputEncoding,
				expiresIn: expiration,
			}
		);
	}

	public decodeJwt(token: string): JwtPayload | string | null {
		return decode(token);
	}

	public generateUuid(): string | null {
		try {
			return uuidV4();
		} catch (error) {
			return null;
		}
	}

	public generateSalt(rounds = 10, minor: 'a' | 'b' = 'b'): string | null {
		try {
			return genSaltSync(rounds, minor);
		} catch (error) {
			return null;
		}
	}

	public generateRSAKeyPair(keySize: 1024 | 2048): crypto.KeyPairSyncResult<string, string> {
		return crypto.generateKeyPairSync('rsa', {
			modulusLength: keySize,
			publicKeyEncoding: {
				type: 'spki',
				format: 'pem',
			},
			privateKeyEncoding: {
				type: 'pkcs8',
				format: 'pem',
			},
		});
	}

	public generateDSAKeyPair(keySize: 1024 | 2048): crypto.KeyPairSyncResult<string, string> {
		const { publicKey, privateKey } = crypto.generateKeyPairSync('dsa' as any, {
			modulusLength: keySize,
			namedCurve: 'secp256k1',
		});

		return {
			publicKey: publicKey.export({ type: 'spki', format: 'pem', }).toString(),
			privateKey: privateKey.export({ type: 'pkcs8', format: 'pem', }).toString(),
		};
	}

	public hashing(data: string, inputEncoding: BufferEncoding, algorithm: hashAlgorithmType, outputFormat: crypto.BinaryToTextEncoding): string | null {
		try {
			const hash = crypto.createHash(algorithm);
			return hash.update(data, inputEncoding).digest(outputFormat);
		} catch (error) {
			return null;
		}
	}

	public contentDSASign(data: string, inputEncoding: BufferEncoding, privateKeyContent: string, algorithm: hashAlgorithmType, outputFormat: crypto.BinaryToTextEncoding): string | null {
		try {
			const sign = crypto.createSign(algorithm);
			sign.update(data, inputEncoding);
			return sign.sign(privateKeyContent, outputFormat);
		} catch (error) {
			return null;
		}
	}

	public symmetricAESEncrypt(data: string, inputEncoding: BufferEncoding, keyContent: string, outputEncoding: BufferEncoding): string | null {
		try {
			const cipher = crypto.createCipheriv('aes-256-cbc', keyContent.substring(0, 32), this.IV.substring(0, 16));
			const hexEncripted = cipher.update(data, inputEncoding, 'hex') + cipher.final('hex');
			return Buffer.from(hexEncripted, 'hex').toString(outputEncoding);
		} catch (error) {
			return null;
		}
	}

	public symmetricAESDecrypt(data: string, inputEncoding: BufferEncoding, keyContent: string, outputEncoding: BufferEncoding): string | null {
		try {
			const decipher = crypto.createDecipheriv('aes-256-cbc', keyContent.substring(0, 32), this.IV.substring(0, 16));
			const hexEncripted = decipher.update(data, inputEncoding, 'hex') + decipher.final('hex');
			return Buffer.from(hexEncripted, 'hex').toString(outputEncoding);
		} catch (error) {
			return null;
		}
	}

	public asymmetricRSAEncrypt(data: string, inputEncoding: BufferEncoding, keyType: 'public' | 'private', keyContent: string, outputEncoding: BufferEncoding): string | null {
		try {
			const dataBuffer = Buffer.from(data, inputEncoding);
			const key: crypto.RsaPrivateKey | crypto.RsaPublicKey = {
				key: keyContent,
				padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
				oaepHash: 'sha256',
			};
			const encryptedBuffer = (keyType === 'private') ? crypto.privateEncrypt(key, dataBuffer) : crypto.publicEncrypt(key, dataBuffer);

			return encryptedBuffer.toString(outputEncoding);
		} catch (error) {
			return null;
		}
	}

	public asymmetricRSADecrypt(data: string, inputEncoding: BufferEncoding, keyType: 'public' | 'private', keyContent: string, outputEncoding: BufferEncoding): string | null {
		try {
			const dataBuffer = Buffer.from(data, inputEncoding);
			const key: crypto.RsaPrivateKey | crypto.RsaPublicKey = {
				key: keyContent,
				padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
				oaepHash: 'sha256',
			};
			const decryptedBuffer = (keyType === 'private') ? crypto.privateDecrypt(key, dataBuffer) : crypto.publicDecrypt(key, dataBuffer);

			return decryptedBuffer.toString(outputEncoding);
		} catch (error) {
			return null;
		}
	}
}
