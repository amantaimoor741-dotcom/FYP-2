import { Router } from 'express';
import { randomBytes, scryptSync, timingSafeEqual, createPublicKey } from 'crypto';
import { prisma } from '../services/db/client.ts';

const router = Router();

function hashPassword(password: string): string {
  const salt = randomBytes(16).toString('hex');
  const hash = scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(':');
  const derived = scryptSync(password, salt, 64);
  const expected = Buffer.from(hash, 'hex');
  return derived.length === expected.length && timingSafeEqual(derived, expected);
}

function makeToken(userId: string): string {
  const ts = Date.now().toString(36);
  const rand = randomBytes(8).toString('hex');
  return `demo_token_${userId}_${ts}_${rand}`;
}

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ error: 'Email and password required' });
      return;
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.password) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    if (!verifyPassword(password, user.password)) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    const token = makeToken(user.id);
    res.json({ token, userId: user.id, email: user.email, name: user.name });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/signup', async (req, res) => {
  try {
    const { email, password, name } = req.body;
    if (!email || !password) {
      res.status(400).json({ error: 'Email and password required' });
      return;
    }
    if (password.length < 6 || password.length > 16) {
      res.status(400).json({ error: 'Password must be 6-16 characters' });
      return;
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      res.status(409).json({ error: 'Email already registered' });
      return;
    }

    const user = await prisma.user.create({
      data: {
        email,
        name: name || email.split('@')[0],
        password: hashPassword(password),
        plan: 'free',
        quota: 3,
      },
    });

    const token = makeToken(user.id);
    res.json({ token, userId: user.id, email: user.email, name: user.name });
  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// --- Google OAuth ---

const GOOGLE_CERTS_URL = 'https://www.googleapis.com/oauth2/v3/certs';

let cachedKeys: { keys: any[]; fetchedAt: number } | null = null;

async function getGooglePublicKeys(): Promise<any[]> {
  if (cachedKeys && Date.now() - cachedKeys.fetchedAt < 3600000) {
    return cachedKeys.keys;
  }
  const res = await fetch(GOOGLE_CERTS_URL);
  const data = await res.json() as any;
  cachedKeys = { keys: data.keys, fetchedAt: Date.now() };
  return data.keys;
}

router.post('/google', async (req, res) => {
  try {
    const { credential } = req.body;
    if (!credential) {
      res.status(400).json({ error: 'Credential required' });
      return;
    }

    const keys = await getGooglePublicKeys();
    const header = JSON.parse(Buffer.from(credential.split('.')[0], 'base64url').toString());
    const jwk = keys.find((k: any) => k.kid === header.kid);
    if (!jwk) {
      res.status(401).json({ error: 'Invalid token key' });
      return;
    }

    const publicKey = createPublicKey({ format: 'jwk', key: { kty: 'RSA', n: jwk.n, e: jwk.e } });
    const jwtMod = await import('jsonwebtoken');
    const verify = jwtMod.default?.verify || jwtMod.verify;
    const payload = verify(credential, publicKey, {
      algorithms: ['RS256'],
      issuer: ['accounts.google.com', 'https://accounts.google.com'],
    }) as any;

    const { sub, email, name, email_verified } = payload;
    if (!email || !email_verified) {
      res.status(401).json({ error: 'Email not verified' });
      return;
    }

    let user = await prisma.user.findFirst({ where: { OR: [{ clerkId: sub }, { email }] } });
    if (!user) {
      user = await prisma.user.create({
        data: { clerkId: sub, email, name: name || email.split('@')[0], plan: 'free', quota: 3 },
      });
    } else if (!user.clerkId) {
      await prisma.user.update({ where: { id: user.id }, data: { clerkId: sub } });
    }

    const token = makeToken(user.id);
    res.json({ token, userId: user.id, email: user.email, name: user.name });
  } catch (err: any) {
    console.error('Google auth error:', err);
    res.status(500).json({ error: 'Google auth failed', detail: err?.message || String(err) });
  }
});

export default router;
