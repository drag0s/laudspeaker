import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { urlencoded } from 'body-parser';
import { readFileSync } from 'fs';

async function bootstrap() {
  const httpsOptions = {
    key:
      parseInt(process.env.PORT) == 443
        ? readFileSync(
            '/etc/letsencrypt/live/api.laudspeaker.com/privkey.pem',
            'utf8'
          )
        : null,
    cert:
      parseInt(process.env.PORT) == 443
        ? readFileSync(
            '/etc/letsencrypt/live/api.laudspeaker.com/fullchain.pem',
            'utf8'
          )
        : null,
  };
  const app: NestExpressApplication = await NestFactory.create(AppModule, {
    rawBody: true,
    httpsOptions: parseInt(process.env.PORT) == 443 ? httpsOptions : undefined,
  });
  const port: number = parseInt(process.env.PORT);

  const rawBodyBuffer = (req, res, buf, encoding) => {
    if (buf && buf.length) {
      req.rawBody = buf.toString(encoding || 'utf8');
    }
  };
  app.use(urlencoded({ verify: rawBodyBuffer, extended: true }));

  app.set('trust proxy', 1);
  app.enableCors();
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.useLogger(app.get(WINSTON_MODULE_NEST_PROVIDER));

  await app.listen(port, () => {
    console.log('[WEB]', `http://localhost:${port}`);
  });
}

bootstrap();
