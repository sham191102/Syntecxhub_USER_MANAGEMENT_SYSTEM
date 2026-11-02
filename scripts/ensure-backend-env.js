import { randomBytes } from 'node:crypto';
import { access, readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const examplePath = fileURLToPath(new URL('../backend/.env.example', import.meta.url));
const envPath = fileURLToPath(new URL('../backend/.env', import.meta.url));

try {
  await access(envPath);
  console.log('Using existing backend/.env');
} catch (error) {
  if (error.code !== 'ENOENT') throw error;

  const example = await readFile(examplePath, 'utf8');
  const placeholder = 'replace-this-with-a-long-random-secret';

  if (!example.includes(placeholder)) {
    throw new Error(`The required JWT secret placeholder is missing from ${examplePath}`);
  }

  const contents = example.replace(placeholder, randomBytes(48).toString('base64url'));

  try {
    await writeFile(envPath, contents, { flag: 'wx', mode: 0o600 });
    console.log('Created backend/.env with a private, randomly generated JWT secret.');
  } catch (writeError) {
    if (writeError.code !== 'EEXIST') throw writeError;
    console.log('Using existing backend/.env');
  }
}
