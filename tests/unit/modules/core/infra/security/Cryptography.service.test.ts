import CryptographyService from '../../../../../../src/modules/core/infra/security/Cryptography.service';
import configs from '../../../../../../src/modules/core/configs/configs.config';


describe('Modules :: Core :: Infra :: Security :: CryptographyService', () => {
	// // mocks
	const configServiceMock: any = {
		get: (propertyPath?: string) => {
			if (propertyPath)
				return configs()[propertyPath];
			else
				return configs();
		},
	};

	const cryptographyService = new CryptographyService(configServiceMock);

	describe('# Encoding and Hashing', () => {
		test('Should change encoding from UTF-8 to other encodings', () => {
			expect(cryptographyService.changeBufferEncoding('Álvaro', 'utf8', 'base64')).toBe('w4FsdmFybw==');
			expect(cryptographyService.changeBufferEncoding('Álvaro', 'utf8', 'base64url')).toBe('w4FsdmFybw');
			expect(cryptographyService.changeBufferEncoding('Álvaro', 'utf8', 'hex')).toBe('c3816c7661726f');
			expect(cryptographyService.changeBufferEncoding('w4FsdmFybw==', 'base64', 'utf8')).toBe('Álvaro');
		});

		test('Should generate JWT', () => {
			const data = { name: 'Alvaro' };
			const token = cryptographyService.encodeJwt(data, 'utf8');

			expect(token.length).toBe(149);
			expect(cryptographyService.decodeJwt(token)).toMatchObject(data);
		});

		test('Should generate UUID', () => {
			expect(cryptographyService.generateUuid()?.length).toBe(36);
		});

		test('Should generate salt', () => {
			expect(cryptographyService.generateSalt()).toContain('$2b$10$');
		});

		test('Should generate hash', () => {
			expect(cryptographyService.hashing('Alvaro', 'utf8', 'sha256', 'base64url')).toBe('oRh-giIS2wsPAP2hH6Okwy_c_1KBCPYFuRc2tI2ieuI');
		});

		test('Should not generate hash', () => {
			expect(cryptographyService.hashing('Alvaro', 'utf8', '123' as any, 'base64url')).toBeNull();
		});
	});

	describe('# Generate Keys', () => {
		test('Should generate RSA key pair', () => {
			const rsaKeyPair = cryptographyService.generateRSAKeyPair(1024);

			expect(rsaKeyPair.publicKey).toContain('-----BEGIN PUBLIC KEY-----');
			expect(rsaKeyPair.privateKey).toContain('-----BEGIN PRIVATE KEY-----');
		});

		test('Should generate DSA key pair', () => {
			const dsaKeyPair = cryptographyService.generateDSAKeyPair(2048);

			expect(dsaKeyPair.publicKey).toContain('-----BEGIN PUBLIC KEY-----');
			expect(dsaKeyPair.privateKey).toContain('-----BEGIN PRIVATE KEY-----');
		});

		test('Should sign content with DSA', () => {
			const dsaKeyPair = cryptographyService.generateDSAKeyPair(1024);

			const signedContent = cryptographyService.contentDSASign('Alvaro', 'utf8', dsaKeyPair.privateKey, 'sha512', 'hex');

			expect(signedContent?.length).not.toBeNull();
		});

		test('Should not sign content with DSA', () => {
			const signedContent = cryptographyService.contentDSASign('Alvaro', 'utf8', 'xxx', 'sha512', 'hex');

			expect(signedContent).toBeNull();
		});
	});

	describe('# Symmetric Cryptography', () => {
		const plainText = 'Hello world!';
		const key1 = cryptographyService.hashing('ValidKey', 'utf8', 'sha256', 'hex') as string;
		const key2 = cryptographyService.hashing('InvalidKey', 'utf8', 'sha256', 'hex') as string;
		const iv = '2a19dd220ef09ff472b59447';
		let encrypted = '';
		let decrypted = '';
		let enc: { encrypted: string | null, iv: string } | undefined = undefined;
		let dec: { decrypted: string | null, iv: string } | undefined = undefined;

		test('Should encrypt', () => {
			enc = cryptographyService.symmetricAESEncrypt(plainText, 'utf8', key1, 'base64', iv);
			encrypted = enc.encrypted as string;

			expect(enc.iv).toBe('2a19dd220ef09ff472b59447');
			expect(encrypted).toBe('Edx0dL1CDzUfWtOE');
		});

		test('Should not encrypt', () => {
			const encr = cryptographyService.symmetricAESEncrypt(plainText, 'utf8', 'xxx', 'base64');

			expect(encr.iv.length).toBe(24);
			expect(encr.encrypted).toBeNull();
		});

		test('Should decrypt', () => {
			dec = cryptographyService.symmetricAESDecrypt(encrypted, 'base64', key1, iv, 'utf8');
			decrypted = dec.decrypted as string;

			expect(dec.iv).toBe('2a19dd220ef09ff472b59447');
			expect(decrypted).toBe(plainText);
		});

		test('Should decrypt with wrong result', () => {
			dec = cryptographyService.symmetricAESDecrypt(encrypted, 'base64', key2, iv, 'utf8');
			decrypted = dec.decrypted as string;

			expect(dec.iv).toBe('2a19dd220ef09ff472b59447');
			expect(decrypted).not.toBe(plainText);
		});

		test('Should not decrypt', () => {
			const decr = cryptographyService.symmetricAESDecrypt(encrypted, 'base64', 'xxx', iv, 'utf8');

			expect(decr.iv.length).toBe(24);
			expect(decr.decrypted).toBeNull();
		});
	});

	describe('# Asymmetric Cryptography', () => {
		const plainText = 'Hello world!';
		const rsaKeyPair = cryptographyService.generateRSAKeyPair(1024);

		test('Should encrypt with public key and decrypt with private key', () => {
			const pubEncrypted = cryptographyService.asymmetricRSAEncrypt(plainText, 'utf8', 'public', rsaKeyPair.publicKey, 'base64') as string;
			const pubDecrypted = cryptographyService.asymmetricRSADecrypt(pubEncrypted, 'base64', 'public', rsaKeyPair.publicKey, 'utf8');
			const privDecrypted = cryptographyService.asymmetricRSADecrypt(pubEncrypted, 'base64', 'private', rsaKeyPair.privateKey, 'utf8');

			expect(pubEncrypted.length).toBe(172);
			expect(pubDecrypted).toBeNull();
			expect(privDecrypted).toBe(plainText);
		});

		test('Should encrypt with private key and decrypt with public key', () => {
			const privEncrypted = cryptographyService.asymmetricRSAEncrypt(plainText, 'utf8', 'private', rsaKeyPair.privateKey, 'base64') as string;
			const pubDecrypted = cryptographyService.asymmetricRSADecrypt(privEncrypted, 'base64', 'public', rsaKeyPair.publicKey, 'utf8');
			const privDecrypted = cryptographyService.asymmetricRSADecrypt(privEncrypted, 'base64', 'private', rsaKeyPair.privateKey, 'utf8');

			expect(privEncrypted.length).toBe(172);
			expect(pubDecrypted).toBe(plainText);
			expect(privDecrypted).toBeNull();
		});

		test('Should not encrypt and not decrypt due invalid keys', () => {
			const encrypted = cryptographyService.asymmetricRSAEncrypt(plainText, 'utf8', 'public', 'xxx', 'base64') as string;
			const decrypted = cryptographyService.asymmetricRSADecrypt(encrypted, 'base64', 'public', 'xxx', 'utf8');

			expect(encrypted).toBeNull();
			expect(decrypted).toBeNull();
		});
	});
});
