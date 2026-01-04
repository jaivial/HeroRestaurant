import { afterAll, beforeAll } from 'vitest';
import fs from 'fs';
import path from 'path';

const envTestPath = path.resolve(__dirname, '../../.env.test');
if (fs.existsSync(envTestPath)) {
  const envContent = fs.readFileSync(envTestPath, 'utf-8');
  envContent.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const [key, ...valueParts] = trimmed.split('=');
      const value = valueParts.join('=');
      if (key && value) {
        process.env[key] = value;
      }
    }
  });
}

BigInt.prototype.toJSON = function () {
  return this.toString();
};

beforeAll(async () => {
  console.log('Test suite starting with test database:', process.env.DB_NAME);
});

afterAll(async () => {
  console.log('Test suite completed');
});
