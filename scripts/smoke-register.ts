import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { AuthService } from '../src/modules/auth/auth.service';

async function main() {
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['error', 'warn', 'log'],
  });

  try {
    const authService = app.get(AuthService);

    const suffix = Date.now();
    const dto = {
      email: `smoke_${suffix}@example.com`,
      password: '123456',
      username: `smoke_${suffix}`,
      phone: `139${String(suffix).slice(-8)}`,
    };

    const user = await authService.create(dto as any);
    console.log('register ok:', user);
  } finally {
    await app.close();
  }
}

main().catch((err) => {
  console.error('smoke-register failed:', err);
  process.exitCode = 1;
});
