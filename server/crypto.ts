import { SignJWT, jwtVerify, generateKeyPair, importPKCS8, importSPKI } from 'jose';
import { nanoid } from 'nanoid';

export interface KeyPair {
  publicKey: string;
  secretKey: string;
}

export async function generateEd25519KeyPair(): Promise<KeyPair> {
  const { publicKey, privateKey } = await generateKeyPair('EdDSA', {
    crv: 'Ed25519',
    extractable: true
  });
  
  const publicKeyPEM = await exportPublicKey(publicKey);
  const secretKeyPEM = await exportPrivateKey(privateKey);
  
  return {
    publicKey: publicKeyPEM,
    secretKey: secretKeyPEM
  };
}

async function exportPublicKey(key: CryptoKey): Promise<string> {
  const exported = await crypto.subtle.exportKey('spki', key);
  const exportedAsString = String.fromCharCode(...new Uint8Array(exported));
  const exportedAsBase64 = btoa(exportedAsString);
  return `-----BEGIN PUBLIC KEY-----\n${exportedAsBase64.match(/.{1,64}/g)?.join('\n')}\n-----END PUBLIC KEY-----`;
}

async function exportPrivateKey(key: CryptoKey): Promise<string> {
  const exported = await crypto.subtle.exportKey('pkcs8', key);
  const exportedAsString = String.fromCharCode(...new Uint8Array(exported));
  const exportedAsBase64 = btoa(exportedAsString);
  return `-----BEGIN PRIVATE KEY-----\n${exportedAsBase64.match(/.{1,64}/g)?.join('\n')}\n-----END PRIVATE KEY-----`;
}

export interface VerifyTokenPayload {
  challengeId: string;
  siteKey: string;
  score: number;
  verified: boolean;
  exp: number;
  iat: number;
  jti: string;
}

export async function generateSecureVerifyToken(
  challengeId: string,
  siteKey: string,
  score: number,
  secretKeyPEM: string
): Promise<string> {
  const privateKey = await importPKCS8(secretKeyPEM, 'EdDSA');
  
  const token = await new SignJWT({
    challengeId,
    siteKey,
    score,
    verified: true,
  })
    .setProtectedHeader({ alg: 'EdDSA' })
    .setIssuedAt()
    .setExpirationTime('2m')
    .setJti(nanoid())
    .sign(privateKey);
  
  return token;
}

export async function verifySecureToken(
  token: string,
  publicKeyPEM: string
): Promise<VerifyTokenPayload | null> {
  try {
    const publicKey = await importSPKI(publicKeyPEM, 'EdDSA');
    
    const { payload } = await jwtVerify(token, publicKey, {
      algorithms: ['EdDSA'],
    });
    
    return payload as unknown as VerifyTokenPayload;
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
}

export function generateSiteKey(): string {
  return `sk_${nanoid(32)}`;
}

export function generateDemoKeys(): { siteKey: string; secretKey: string; publicKey: string } {
  return {
    siteKey: 'demo_site_key',
    secretKey: 'demo_secret_key_placeholder',
    publicKey: 'demo_public_key_placeholder'
  };
}
