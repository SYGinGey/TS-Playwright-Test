import fs from 'node:fs';

export default function globalSetup(): void {
  fs.rmSync('allure-results', { recursive: true, force: true });
}
