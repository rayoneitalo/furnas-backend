import { ValidationPipe } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import { ExpressAdapter } from '@nestjs/platform-express'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import express from 'express'
import type { Request, Response } from 'express'

import { AppModule } from '../src/app.module'

const expressApp = express()
let ready = false

async function bootstrap() {
  if (ready) return

  const app = await NestFactory.create(AppModule, new ExpressAdapter(expressApp), {
    logger: ['error', 'warn'],
  })

  const frontendUrl = process.env.FRONTEND_URL
  app.enableCors({
    origin: frontendUrl ? [frontendUrl, 'http://localhost:3000'] : true,
    credentials: true,
  })

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  )

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Furnas API')
    .setDescription('API para gerenciamento da lista de jogadores. Faça login em **POST /auth/login** e o token será aplicado automaticamente.')
    .setVersion('1.0.0')
    .addBearerAuth()
    .build()

  const document = SwaggerModule.createDocument(app, swaggerConfig)
  SwaggerModule.setup('docs', app, document, {
    swaggerOptions: { persistAuthorization: true },
    customJsStr: `
      window.addEventListener('load', function () {
        var check = setInterval(function () {
          if (!window.ui) return;
          clearInterval(check);
          window.ui.updateConfigs({
            responseInterceptor: function (response) {
              if (response.url && response.url.includes('/auth/login') && response.status === 201) {
                try {
                  var body = typeof response.body === 'string' ? JSON.parse(response.body) : response.body;
                  if (body && body.access_token) {
                    window.ui.authActions.authorize({
                      bearer: {
                        name: 'bearer',
                        schema: { type: 'http', in: 'header', scheme: 'bearer', bearerFormat: 'JWT' },
                        value: body.access_token,
                      },
                    });
                  }
                } catch (e) {}
              }
              return response;
            },
          });
        }, 200);
      });
    `,
  })

  await app.init()
  ready = true
}

export default async function handler(req: Request, res: Response) {
  await bootstrap()
  expressApp(req, res)
}
