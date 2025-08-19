#!/usr/bin/env node
// Export sensitive config files into a single encrypted bundle
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const cwd = process.cwd();

const DEFAULT_TARGETS = [
  '.env',
  '.env.production',
  'functions/.runtimeconfig.json',
];

function parseArgs() {
  const args = process.argv.slice(2);
  const outIdx = args.indexOf('--out');
  const passIdx = args.indexOf('--pass');
  const includeIdx = args.indexOf('--include');
  return {
    out:
      outIdx !== -1 && args[outIdx + 1]
        ? path.resolve(cwd, args[outIdx + 1])
        : path.resolve(
            cwd,
            `secrets-${new Date().toISOString().replace(/[:.]/g, '-')}.enc.json`
          ),
    pass: passIdx !== -1 ? args[passIdx + 1] : process.env.SECRETS_PASSPHRASE,
    include:
      includeIdx !== -1 && args[includeIdx + 1]
        ? args[includeIdx + 1].split(',').map((p) => p.trim())
        : DEFAULT_TARGETS,
  };
}

function fileExists(p) {
  try {
    return fs.existsSync(p);
  } catch {
    return false;
  }
}

function collectFiles(list) {
  const entries = [];
  for (const rel of list) {
    const abs = path.resolve(cwd, rel);
    if (!fileExists(abs)) {
      continue;
    }
    const content = fs.readFileSync(abs, 'utf8');
    entries.push({ path: rel, content });
  }
  return entries;
}

function encrypt(passphrase, data) {
  const salt = crypto.randomBytes(16);
  const iv = crypto.randomBytes(12);
  const key = crypto.scryptSync(passphrase, salt, 32);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const plaintext = Buffer.from(JSON.stringify(data), 'utf8');
  const ciphertext = Buffer.concat([cipher.update(plaintext), cipher.final()]);
  const tag = cipher.getAuthTag();
  return {
    v: 1,
    kdf: 'scrypt',
    algo: 'aes-256-gcm',
    salt: salt.toString('hex'),
    iv: iv.toString('hex'),
    tag: tag.toString('hex'),
    ct: ciphertext.toString('base64'),
  };
}

async function main() {
  const { out, pass, include } = parseArgs();
  const passphrase = pass;
  if (!passphrase) {
    console.error(
      'Missing passphrase. Provide with --pass <pass> or env SECRETS_PASSPHRASE.'
    );
    process.exit(1);
  }

  const files = collectFiles(include);
  if (files.length === 0) {
    console.error('No target files found to export.');
    process.exit(1);
  }

  const payload = {
    createdAt: new Date().toISOString(),
    files,
  };
  const enc = encrypt(passphrase, payload);
  // Ensure output directory exists
  const outDir = path.dirname(out);
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(out, JSON.stringify(enc, null, 2) + '\n', 'utf8');
  console.log(`Encrypted secrets bundle written to: ${out}`);
  console.log('Note: Keep this file safe. Do not commit it.');
}

main().catch((e) => {
  console.error('Export failed:', e?.message || e);
  process.exit(1);
});
