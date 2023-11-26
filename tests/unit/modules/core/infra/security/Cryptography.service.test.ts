import CryptographyService from '../../../../../../src/modules/core/infra/security/Cryptography.service';


describe('Modules :: Core :: Infra :: Security :: CryptographyService', () => {
	const cryptographyService = new CryptographyService();

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

			expect(token.length).toBe(105);
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

		test('Should decrypt', () => {
			dec = cryptographyService.symmetricAESDecrypt(encrypted, 'base64', key1, iv, 'utf8');
			decrypted = dec.decrypted as string;

			expect(dec.iv).toBe('2a19dd220ef09ff472b59447');
			expect(decrypted).toBe(plainText);
		});

		test('Should not decrypt', () => {
			dec = cryptographyService.symmetricAESDecrypt(encrypted, 'base64', key2, iv, 'utf8');
			decrypted = dec.decrypted as string;

			expect(dec.iv).toBe('2a19dd220ef09ff472b59447');
			expect(decrypted).not.toBe(plainText);
		});
	});

	describe('# Asymmetric Cryptography', () => {
		const plainText = 'Hello world!';
		const rsaKeyPair = cryptographyService.generateRSAKeyPair(1024);

		test('Should encrypt with public key and decrypt with private key', () => {
			const pubEncrypted = cryptographyService.asymmetricRSAEncrypt(plainText, 'utf8', 'public', rsaKeyPair.publicKey, 'base64') as string;
			const pubDecrypted = cryptographyService.asymmetricRSADecrypt(pubEncrypted, 'base64', 'public', rsaKeyPair.publicKey, 'utf8') as string;
			const privDecrypted = cryptographyService.asymmetricRSADecrypt(pubEncrypted, 'base64', 'private', rsaKeyPair.privateKey, 'utf8') as string;

			expect(pubEncrypted.length).toBe(172);
			expect(pubDecrypted).toBeNull();
			expect(privDecrypted).toBe(plainText);
		});

		test('Should encrypt with private key and decrypt with public key', () => {
			const privEncrypted = cryptographyService.asymmetricRSAEncrypt(plainText, 'utf8', 'private', rsaKeyPair.privateKey, 'base64') as string;
			const pubDecrypted = cryptographyService.asymmetricRSADecrypt(privEncrypted, 'base64', 'public', rsaKeyPair.publicKey, 'utf8') as string;
			const privDecrypted = cryptographyService.asymmetricRSADecrypt(privEncrypted, 'base64', 'private', rsaKeyPair.privateKey, 'utf8') as string;

			expect(privEncrypted.length).toBe(172);
			expect(pubDecrypted).toBe(plainText);
			expect(privDecrypted).toBeNull();
		});
	});
});
