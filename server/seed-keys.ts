import { db } from './db';
import { siteKeys } from '@shared/schema';
import { generateEd25519KeyPair } from './crypto';
import { eq } from 'drizzle-orm';

async function seedKeys() {
  console.log('Generating Ed25519 key pair for demo site...');
  
  const { publicKey, secretKey } = await generateEd25519KeyPair();
  
  console.log('Public Key:', publicKey);
  console.log('Secret Key:', secretKey.substring(0, 50) + '...');
  
  const existing = await db
    .select()
    .from(siteKeys)
    .where(eq(siteKeys.key, 'demo_site_key'));
  
  if (existing.length > 0) {
    console.log('Updating existing demo site key...');
    await db
      .update(siteKeys)
      .set({
        secretKey,
        publicKey,
      })
      .where(eq(siteKeys.key, 'demo_site_key'));
    console.log('Demo site key updated successfully!');
  } else {
    console.log('Creating new demo site key...');
    await db
      .insert(siteKeys)
      .values({
        key: 'demo_site_key',
        secretKey,
        publicKey,
        name: 'Demo Site',
        domain: 'localhost',
        active: true,
      });
    console.log('Demo site key created successfully!');
  }
  
  process.exit(0);
}

seedKeys().catch(console.error);
