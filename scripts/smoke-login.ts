import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { AuthService } from '../src/modules/auth/auth.service';

async function main() {
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: false,
  });

  try {
    const auth = app.get(AuthService);
    const suffix = Date.now();
    const email = `login_${suffix}@example.com`;
    const phone = `139${String(suffix).slice(-8)}`;
    const password = '123456';

    await auth.create({
      email,
      username: `login_${suffix}`,
      phone,
      password,
    } as any);

    const byEmail = await auth.login({ account: email, password } as any);
    const byPhone = await auth.login({ account: phone, password } as any);

    console.log('login by email ok:', Boolean(byEmail.token));
    console.log('login by phone ok:', Boolean(byPhone.token));
  } finally {
    await app.close();
  }
}

main().catch((err) => {
  console.error('smoke-login failed:', err);
  process.exitCode = 1;
});
