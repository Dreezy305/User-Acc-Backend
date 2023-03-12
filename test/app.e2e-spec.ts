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
    it('checks if user exists', async () => {
      const res = await request(app.getHttpServer())
        .post('/user/signup')
        .send({ ...dto });
      expect(res.status).toBe(201);
    });

    it('registers a user and generates a 7 digit alpha numeric payment ID', async () => {
      const res = await request(app.getHttpServer())
        .post('/user/signup')
        .send({ ...dto });
      expect(res.status).toBe(201);
    });
  });

  describe('generates payment ID', () => {
    it('find user first to check if user exist', async () => {
      // const id = new prisma.user.;
      const res = await request(app.getHttpServer()).get('/posts/');
      expect(res.status).toBe(404);
    });
  });
});
