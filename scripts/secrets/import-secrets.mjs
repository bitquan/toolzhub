#!/usr/bin/env node
// Import an encrypted secrets bundle and restore files
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const cwd = process.cwd();

function parseArgs() {
  const args = process.argv.slice(2);
  const fileIdx = args.indexOf('--file');
  const passIdx = args.indexOf('--pass');
  const destIdx = args.indexOf('--dest');
  return {
    file:
      fileIdx !== -1 && args[fileIdx + 1]
        ? path.resolve(cwd, args[fileIdx + 1])
        : null,
    pass: passIdx !== -1 ? args[passIdx + 1] : process.env.SECRETS_PASSPHRASE,
    dest:
      destIdx !== -1 && args[destIdx + 1]
        ? path.resolve(cwd, args[destIdx + 1])
        : cwd,
  };
}

function decrypt(passphrase, payload) {
  const salt = Buffer.from(payload.salt, 'hex');
  const iv = Buffer.from(payload.iv, 'hex');
  const tag = Buffer.from(payload.tag, 'hex');
  const key = crypto.scryptSync(passphrase, salt, 32);
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(tag);
  const ciphertext = Buffer.from(payload.ct, 'base64');
  const plaintext = Buffer.concat([
    decipher.update(ciphertext),
    decipher.final(),
  ]);
  return JSON.parse(plaintext.toString('utf8'));
}

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

async function main() {
  const { file, pass, dest } = parseArgs();
  if (!file) {
    console.error('Missing --file <bundle.enc.json>');
    process.exit(1);
  }
  if (!pass) {
    console.error(
      'Missing passphrase. Use --pass <pass> or env SECRETS_PASSPHRASE'
    );
    process.exit(1);
  }
  if (!fs.existsSync(file)) {
    console.error(`File not found: ${file}`);
    process.exit(1);
  }

  const payload = JSON.parse(fs.readFileSync(file, 'utf8'));
  const data = decrypt(pass, payload);
  if (!Array.isArray(data.files)) {
    console.error('Invalid bundle: files[] missing');
    process.exit(1);
  }

  for (const entry of data.files) {
    const outPath = path.resolve(dest, entry.path);
    ensureDir(path.dirname(outPath));
    fs.writeFileSync(outPath, entry.content, 'utf8');
    console.log('Restored:', entry.path);
  }

  console.log('Secrets imported successfully.');
}

main().catch((e) => {
  console.error('Import failed:', e?.message || e);
  process.exit(1);
});
