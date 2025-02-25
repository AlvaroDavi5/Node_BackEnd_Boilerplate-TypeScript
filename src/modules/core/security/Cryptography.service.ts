import crypto from 'crypto';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { genSaltSync } from 'bcrypt';
import { sign, verify, JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';
import { v4 as uuidV4 } from 'uuid';
import { ConfigsInterface } from '@core/configs/envs.config';
import { jwtExpirationType, jwtEncode, jwtDecode } from '@shared/internal/types/jwtParamsTypes';


type hashAlgorithmType = 'md5' | 'sha256' | 'sha512'

@Injectable()
export default class CryptographyService {
	private readonly secret: string;

	constructor(
		private readonly configService: ConfigService,
	) {
		const { secretKey } = this.configService.get<ConfigsInterface['security']>('security')!;
		this.secret = secretKey;
	}

	public changeBufferEncoding(data: string, encoding: BufferEncoding, decoding: BufferEncoding): string {
		return Buffer.from(data, encoding).toString(decoding);
	}

	public compareBuffer(b1: Buffer, b2: Buffer): boolean {
		return crypto.timingSafeEqual(b1, b2);
	}

	public encodeJwt<PT extends object = object>(payload: jwtEncode<PT>, inputEncoding: BufferEncoding, expiration?: jwtExpirationType): string {
		return sign(payload, this.secret, {
			algorithm: 'HS256',
			encoding: inputEncoding,
			expiresIn: expiration ?? '1d',
		});
	}

	public decodeJwt<CT extends object = object>(token: string): {
		content: jwtDecode<CT> | null,
		invalidSignature: boolean, expired: boolean,
	} {
		try {
			const decoded = verify(token, this.secret, {
				algorithms: ['HS256'],
				ignoreExpiration: false,
			});

			return {
				content: decoded as jwtDecode<CT>,
				invalidSignature: false,
				expired: false,
			};
		} catch (error) {
			const content = null;
			let expired = false;
			let invalidSignature = false;

			if (error instanceof TokenExpiredError)
				expired = true;
			if (!expired && error instanceof JsonWebTokenError) {
				invalidSignature = error.message === 'invalid signature';
				expired = error.message === 'jwt expired';
			}

			return {
				content,
				invalidSignature,
				expired,
			};
		}
	}

	public generateUuid(): string {
		return uuidV4();
	}

	public generateSalt(rounds = 10, minor: 'a' | 'b' = 'b'): string {
		return genSaltSync(rounds, minor);
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
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
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

	public contentDSASign(
		data: string, inputEncoding: BufferEncoding,
		privateKeyContent: string, algorithm: hashAlgorithmType,
		outputFormat: crypto.BinaryToTextEncoding): string | null {
		try {
			const dsaSign = crypto.createSign(algorithm);
			dsaSign.update(data, inputEncoding);
			return dsaSign.sign(privateKeyContent, outputFormat);
		} catch (error) {
			return null;
		}
	}

	public symmetricAESEncrypt(
		data: string, inputEncoding: BufferEncoding, keyContent: string,
		outputEncoding: BufferEncoding, iv?: string): { encrypted: string | null, iv: string } {
		const IV = iv ?? crypto.randomBytes(12).toString('hex');

		try {
			const cipher = crypto.createCipheriv('aes-256-gcm', Buffer.from(keyContent, 'hex'), Buffer.from(IV, 'hex'));
			const hexEncrypted = cipher.update(data, inputEncoding, 'hex') + cipher.final('hex');
			const encrypted = Buffer.from(hexEncrypted, 'hex').toString(outputEncoding);

			return { encrypted, iv: IV };
		} catch (error) {
			return { encrypted: null, iv: IV };
		}
	}

	public symmetricAESDecrypt(
		data: string, inputEncoding: BufferEncoding,
		keyContent: string, iv: string,
		outputEncoding: BufferEncoding): { decrypted: string | null, iv: string } {
		try {
			const decipher = crypto.createCipheriv('aes-256-gcm', Buffer.from(keyContent, 'hex'), Buffer.from(iv, 'hex'));
			const hexDecrypted = decipher.update(data, inputEncoding, 'hex') + decipher.final('hex');
			const decrypted = Buffer.from(hexDecrypted, 'hex').toString(outputEncoding);

			return { decrypted, iv };
		} catch (error) {
			return { decrypted: null, iv };
		}
	}

	public asymmetricRSAEncrypt(
		data: string, inputEncoding: BufferEncoding,
		keyType: 'public' | 'private', keyContent: string,
		outputEncoding: BufferEncoding): string | null {
		try {
			const dataBuffer = Buffer.from(data, inputEncoding);
			const key: crypto.RsaPrivateKey | crypto.RsaPublicKey = {
				key: keyContent,
				padding: (keyType === 'private') ? crypto.constants.RSA_PKCS1_PADDING : crypto.constants.RSA_PKCS1_OAEP_PADDING,
			};
			const encryptedBuffer = (keyType === 'private') ? crypto.privateEncrypt(key, dataBuffer) : crypto.publicEncrypt(key, dataBuffer);

			return encryptedBuffer.toString(outputEncoding);
		} catch (error) {
			return null;
		}
	}

	public asymmetricRSADecrypt(
		data: string, inputEncoding: BufferEncoding,
		keyType: 'public' | 'private', keyContent: string,
		outputEncoding: BufferEncoding): string | null {
		try {
			const dataBuffer = Buffer.from(data, inputEncoding);
			const key: crypto.RsaPrivateKey | crypto.RsaPublicKey = {
				key: keyContent,
				padding: (keyType === 'private') ? crypto.constants.RSA_PKCS1_OAEP_PADDING : crypto.constants.RSA_PKCS1_PADDING,
			};
			const decryptedBuffer = (keyType === 'private') ? crypto.privateDecrypt(key, dataBuffer) : crypto.publicDecrypt(key, dataBuffer);

			return decryptedBuffer.toString(outputEncoding);
		} catch (error) {
			return null;
		}
	}
}
