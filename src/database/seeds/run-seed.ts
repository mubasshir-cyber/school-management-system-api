import { NestFactory } from '@nestjs/core';
import { AppModule } from '../../app.module';
import { SeedService } from '../../modules/seed/seed.service';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const seedService = app.get(SeedService);

  try {
    await seedService.seedAll();
    console.log('🎉 Seeding successfully executed!');
  } catch (error) {
    console.error('❌ Seeding failed:', error);
  } finally {
    await app.close();
  }
}

bootstrap();
