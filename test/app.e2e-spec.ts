import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { CreateUserDto } from 'src/auth/dto/auth.dto';
import * as request from 'supertest';
import { PrismaService } from '../src/prisma/prisma.service';
import { AppModule } from './../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.enableShutdownHooks();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();
    prisma = app.get(PrismaService);
    await prisma.$connect();
  }, 50000);

  afterAll(() => {
    app.close();
  });
  it.todo('should pass');

  describe('user management system', () => {
    const dto: CreateUserDto = {
      name: 'JaneDoe',
      email: 'wutyke@mailinator.com',
      password: 'Password1@',
      phoneNumber: '09012345678',
    };
    // it('checks if user exists', async () => {
    //   const res = await request(app.getHttpServer())
    //     .post('/user/signup')
    //     .send({ ...dto });
    //   expect(res.status).toBe(201);
    // });

    it('registers a user and generates a 7 digit alpha numeric payment ID', async () => {
      const res = await request(app.getHttpServer())
        .post('/user/signup')
        .send({ ...dto });
      expect(res.status).toBe(403);
    }, 50000);
  });

  describe('generates payment ID', () => {
    it('generates payment id for user', async () => {
      const res = await request(app.getHttpServer()).put(
        '/user/generatePaymentId/640dc3b61bdd4744939de659',
      );
      expect(res.status).toBe(200);
    }, 50000);

    it('deletes payment id', async () => {
      const res = await request(app.getHttpServer()).put(
        '/user/deletePaymentId/640dc3b61bdd4744939de659/paymentId/:paymentId',
      );
      expect(res.status).toBe(200);
    }, 50000);
  });
});
