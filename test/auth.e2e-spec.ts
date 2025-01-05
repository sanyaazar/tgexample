import { INestApplication, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import * as cookieParser from 'cookie-parser';
import { AppModule } from 'src/app.module';
import { AuthService } from 'src/auth';
import { Hasher } from 'src/auth/hasher';
import { AuthRepository } from 'src/database';
import { SessionRepository } from 'src/database/session.repository';
import { EmailService } from 'src/email/email.service';
import { EmailValidationBodyDTO } from 'src/types';
import * as request from 'supertest';

describe('AuthController (register)', () => {
  let app: INestApplication;
  let server: any;
  let authRepository: AuthRepository;
  let sessionRepository: SessionRepository;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    authRepository = moduleFixture.get<AuthRepository>(AuthRepository);
    sessionRepository = moduleFixture.get<SessionRepository>(SessionRepository);
    // Validation Pipes
    app.useGlobalPipes(new ValidationPipe());
    // cookie-parser
    const configService = app.get(ConfigService);
    app.use(cookieParser(configService.get<string>('COOKIE_SECRET')));
    await app.init();
    server = app.getHttpServer();
  });

  it('/auth/register(full data)', async () => {
    const { body } = await request(server)
      .post('/auth/register')
      .send({
        login: 'adminVasya',
        password: 'vasyaWhite123',
        email: 'vkmorozov@gmail.com',
        tel: '+79991234319',
        dateOfBirth: '2003-01-01',
        displayName: 'admin Vasya',
      })
      .expect(201);
    expect(body).toEqual({ userID: expect.any(Number) });

    deleteAllUserInfo(body.userID);
  });

  it('/auth/register(without login)', async () => {
    const result = await request(server).post('/auth/register').send({
      password: 'vasyaWhite123',
      email: 'vkmorozov@gmail.com',
      tel: '+79991234319',
      dateOfBirth: '2003-01-01',
      displayName: 'admin Vasya',
    });

    expect(result.status).toBe(400);
    expect(result.body).toEqual({
      message: [
        'login must contain only letters and numbers',
        'login must be longer than or equal to 2 characters',
      ],
      error: 'Bad Request',
      statusCode: 400,
    });
  });

  it('/auth/register(without password)', async () => {
    const result = await request(server).post('/auth/register').send({
      login: 'adminVasya',
      email: 'vkmorozov@gmail.com',
      tel: '+79991234319',
      dateOfBirth: '2003-01-01',
      displayName: 'admin Vasya',
    });

    expect(result.status).toBe(400);
    expect(result.body).toEqual({
      message: ['password is not strong enough'],
      error: 'Bad Request',
      statusCode: 400,
    });
  });

  it('/auth/register(without phone number)', async () => {
    const result = await request(server).post('/auth/register').send({
      login: 'adminVasya',
      password: 'vasyaWhite123',
      email: 'vkmorozov@gmail.com',
      dateOfBirth: '2003-01-01',
      displayName: 'admin Vasya',
    });

    expect(result.status).toBe(400);
    expect(result.body).toEqual({
      message: ['tel must be a valid phone number'],
      error: 'Bad Request',
      statusCode: 400,
    });
  });

  it('/auth/register(without email)', async () => {
    const result = await request(server).post('/auth/register').send({
      login: 'adminVasya',
      password: 'vasyaWhite123',
      tel: '+79991234319',
      dateOfBirth: '2003-01-01',
      displayName: 'admin Vasya',
    });

    expect(result.status).toBe(400);
    expect(result.body).toEqual({
      message: ['email must be an email'],
      error: 'Bad Request',
      statusCode: 400,
    });
  });

  it('/auth/register(user with this login already exist)', async () => {
    const firstUser = await request(server).post('/auth/register').send({
      login: 'adminVasya',
      password: 'vasyaWhite123',
      email: 'vkmorozov@gmail.com',
      tel: '+79991234319',
      dateOfBirth: '2003-01-01',
      displayName: 'admin Vasya',
    });

    expect(firstUser.status).toBe(201);
    expect(firstUser.body).toEqual({ userID: expect.any(Number) });

    const result = await request(server).post('/auth/register').send({
      login: 'adminVasya',
      password: 'vasyaWhite123',
      email: 'vkmorozov1@gmail.com',
      tel: '+79991234310',
      dateOfBirth: '2003-01-01',
      displayName: 'admin Vasya',
    });

    expect(result.status).toBe(409);

    deleteAllUserInfo(firstUser.body.userID);
  });

  it('/auth/register(user with this phone already exist)', async () => {
    const firstUser = await request(server).post('/auth/register').send({
      login: 'adminVasya',
      password: 'vasyaWhite123',
      email: 'vkmorozov@gmail.com',
      tel: '+79991234319',
      dateOfBirth: '2003-01-01',
      displayName: 'admin Vasya',
    });

    expect(firstUser.status).toBe(201);
    expect(firstUser.body).toEqual({ userID: expect.any(Number) });

    const result = await request(server).post('/auth/register').send({
      login: 'adminVasya1',
      password: 'vasyaWhite123',
      email: 'vkmorozov1@gmail.com',
      tel: '+79991234319',
      dateOfBirth: '2003-01-01',
      displayName: 'admin Vasya',
    });

    expect(result.status).toBe(409);

    deleteAllUserInfo(firstUser.body.userID);
  });

  it('/auth/register(user with this email already exist)', async () => {
    const firstUser = await request(server).post('/auth/register').send({
      login: 'adminVasya',
      password: 'vasyaWhite123',
      email: 'vkmorozov@gmail.com',
      tel: '+79991234319',
      dateOfBirth: '2003-01-01',
      displayName: 'admin Vasya',
    });

    expect(firstUser.status).toBe(201);
    expect(firstUser.body).toEqual({ userID: expect.any(Number) });

    const result = await request(server).post('/auth/register').send({
      login: 'adminVasya1',
      password: 'vasyaWhite123',
      email: 'vkmorozov@gmail.com',
      tel: '+79991234310',
      dateOfBirth: '2003-01-01',
      displayName: 'admin Vasya',
    });

    expect(result.status).toBe(409);

    deleteAllUserInfo(firstUser.body.userID);
  });

  it('/auth/register(invalid phone)', async () => {
    const firstUser = await request(server).post('/auth/register').send({
      login: 'adminVasya',
      password: 'vasyaWhite123',
      email: 'vkmorozov@gmail.com',
      tel: '+79991234311239',
      dateOfBirth: '2003-01-01',
      displayName: 'admin Vasya',
    });

    expect(firstUser.status).toBe(400);
    expect(firstUser.body).toEqual({
      message: ['tel must be a valid phone number'],
      error: 'Bad Request',
      statusCode: 400,
    });
  });

  it('/auth/register(invalid email)', async () => {
    const firstUser = await request(server).post('/auth/register').send({
      login: 'adminVasya',
      password: 'vasyaWhite123',
      email: 'vkmorozov@.com',
      tel: '+79991234567',
      dateOfBirth: '2003-01-01',
      displayName: 'admin Vasya',
    });

    expect(firstUser.status).toBe(400);
    expect(firstUser.body).toEqual({
      message: ['email must be an email'],
      error: 'Bad Request',
      statusCode: 400,
    });
  });

  it('/auth/register(weak password)', async () => {
    const firstUser = await request(server).post('/auth/register').send({
      login: 'adminVasya',
      password: 'vasyawhite123',
      email: 'vkmorozov@gmail.com',
      tel: '+79991234567',
      dateOfBirth: '2003-01-01',
      displayName: 'admin Vasya',
    });

    expect(firstUser.status).toBe(400);
    expect(firstUser.body).toEqual({
      message: ['password is not strong enough'],
      error: 'Bad Request',
      statusCode: 400,
    });
  });

  afterEach(async () => {
    await app.close();
  });

  async function deleteAllUserInfo(userID: number): Promise<void> {
    await sessionRepository.deleteAllUserSessions(userID);
    await authRepository.deleteUser(userID);
  }
});

describe('AuthController (login)', () => {
  let app: INestApplication;
  let server: any;
  let authRepository: AuthRepository;
  let sessionRepository: SessionRepository;
  let testUser: any;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    authRepository = moduleFixture.get<AuthRepository>(AuthRepository);
    sessionRepository = moduleFixture.get<SessionRepository>(SessionRepository);

    // Validation Pipes
    app.useGlobalPipes(new ValidationPipe());
    // cookie-parser
    const configService = app.get(ConfigService);
    app.use(cookieParser(configService.get<string>('COOKIE_SECRET')));
    await app.init();
    server = app.getHttpServer();
    testUser = await createTestUser();
  });

  afterAll(async () => {
    await deleteAllUserInfo(testUser.userID);
    await app.close();
  });

  beforeEach(async () => {
    jest.restoreAllMocks(); // Сбрасываем все шпионы перед каждым тестом
  });

  it('/auth/login/local (correct data)', async () => {
    const spy = jest.spyOn(sessionRepository, 'createNewSession'); // Создание шпиона для метода someMethod

    const result = await request(server)
      .post('/auth/login/local')
      .send({
        login: testUser.login,
        password: testUser.password,
      })
      .set('User-Agent', 'PostmanRuntime/7.40.0');

    expect(spy).toHaveBeenCalledTimes(1);
    expect(result.status).toBe(200);
    expect(result.get('Set-Cookie')).toBeDefined();
    expect(result.body.access_token).toBeDefined();
  });

  it('/auth/login/local (invalid login)', async () => {
    const spy = jest.spyOn(sessionRepository, 'createNewSession'); // Создание шпиона для метода someMethod

    const result = await request(server)
      .post('/auth/login/local')
      .send({
        login: testUser.badLogin,
        password: testUser.password,
      })
      .set('User-Agent', 'PostmanRuntime/7.40.0');

    expect(spy).toHaveBeenCalledTimes(0);
    expect(result.status).toBe(401);
  });

  it('/auth/login/local (invalid password)', async () => {
    const spy = jest.spyOn(sessionRepository, 'createNewSession'); // Создание шпиона для метода someMethod

    const result = await request(server)
      .post('/auth/login/local')
      .send({
        login: testUser.login,
        password: testUser.badPassword,
      })
      .set('User-Agent', 'PostmanRuntime/7.40.0');

    expect(spy).toHaveBeenCalledTimes(0);
    expect(result.status).toBe(401);
  });

  it('/auth/login/local (invalid login and password)', async () => {
    const spy = jest.spyOn(sessionRepository, 'createNewSession'); // Создание шпиона для метода someMethod

    const result = await request(server)
      .post('/auth/login/local')
      .send({
        login: testUser.badLogin,
        password: testUser.badPassword,
      })
      .set('User-Agent', 'PostmanRuntime/7.40.0');

    expect(spy).toHaveBeenCalledTimes(0);
    expect(result.status).toBe(401);
  });

  it('/auth/login/local (no password)', async () => {
    const spy = jest.spyOn(sessionRepository, 'createNewSession'); // Создание шпиона для метода someMethod

    const result = await request(server)
      .post('/auth/login/local')
      .send({
        login: testUser.login,
      })
      .set('User-Agent', 'PostmanRuntime/7.40.0');

    expect(spy).toHaveBeenCalledTimes(0);
    expect(result.status).toBe(400);
  });

  it('/auth/login/local (no login)', async () => {
    const spy = jest.spyOn(sessionRepository, 'createNewSession'); // Создание шпиона для метода someMethod

    const result = await request(server)
      .post('/auth/login/local')
      .send({
        password: testUser.password,
      })
      .set('User-Agent', 'PostmanRuntime/7.40.0');

    expect(spy).toHaveBeenCalledTimes(0);
    expect(result.status).toBe(400);
  });

  async function createTestUser() {
    const result = await request(server).post('/auth/register').send({
      login: 'adminVasya',
      password: 'vasyaWhite123',
      email: 'vkmorozov@gmail.com',
      tel: '+79991234319',
      dateOfBirth: '2003-01-01',
      displayName: 'admin Vasya',
    });
    return {
      login: 'adminVasya',
      password: 'vasyaWhite123',
      badLogin: 'adminVasyaa',
      badPassword: 'vasyaWhite12321',
      userID: result.body.userID,
    };
  }

  async function deleteAllUserInfo(userID: number): Promise<void> {
    await sessionRepository.deleteAllUserSessions(userID);
    await authRepository.deleteUser(userID);
  }
});

describe('AuthController (recovery by email)', () => {
  let app: INestApplication;
  let server: any;
  let authRepository: AuthRepository;
  let authService: AuthService;
  let sessionRepository: SessionRepository;
  let emailService: EmailService;
  let testUser: any;
  let hasher: Hasher;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    authRepository = moduleFixture.get<AuthRepository>(AuthRepository);
    sessionRepository = moduleFixture.get<SessionRepository>(SessionRepository);
    emailService = moduleFixture.get<EmailService>(EmailService);
    authService = moduleFixture.get<AuthService>(AuthService);
    hasher = moduleFixture.get<Hasher>(Hasher);

    // Validation Pipes
    app.useGlobalPipes(new ValidationPipe());
    // cookie-parser
    const configService = app.get(ConfigService);
    app.use(cookieParser(configService.get<string>('COOKIE_SECRET')));
    await app.init();
    server = app.getHttpServer();
  });

  beforeEach(async () => {
    testUser = await createTestUser();
    jest.clearAllMocks();
  });

  afterEach(async () => {
    await deleteAllUserInfo(testUser.userID);
  });

  afterAll(async () => {
    await app.close();
  });

  it('recovery user (correct variant)', async () => {
    const testCode = 'as213d';

    const originalRecoveryByEmail = authService.recoveryByEmail;
    const mockRecoveryByEmail = jest.fn();
    mockRecoveryByEmail.mockImplementation(
      async (input: EmailValidationBodyDTO): Promise<void> => {
        await authRepository.deleteRecoveryCodeByUserID(testUser.userID);
        await authRepository.createRecoveryCodeRow({
          userID: testUser.userID,
          code: await hasher.hash(testCode),
          expiresAt: new Date(Date.now() + 15000),
        });
      },
    );
    authService.recoveryByEmail = mockRecoveryByEmail;

    const sentResult = await request(server).post('/auth/recovery/email').send({
      email: 'vkmorozov@gmail.com',
    });

    authService.recoveryByEmail = originalRecoveryByEmail;

    expect(sentResult.status).toBe(200);

    const newPassword = 'StronGPassword111';
    const confirmationResult = await request(server)
      .post('/auth/recovery/email/confirmation')
      .send({
        password: newPassword,
        email: 'vkmorozov@gmail.com',
        code: testCode,
      });

    expect(confirmationResult.status).toBe(200);

    const loginResult = await request(server)
      .post('/auth/login/local')
      .send({
        login: testUser.login,
        password: newPassword,
      })
      .set('User-Agent', 'PostmanRuntime/7.40.0');

    expect(loginResult.status).toBe(200);
    expect(loginResult.get('Set-Cookie')).toBeDefined();
    expect(loginResult.body.access_token).toBeDefined();
  });

  it('recovery email (wrong email)', async () => {
    const sentResult = await request(server).post('/auth/recovery/email').send({
      email: 'vkmorozovvv@gmail.com',
    });

    expect(sentResult.status).toBe(404);
  });

  it('recovery user (correct email, bad code)', async () => {
    const testCode = 'as213d';
    const badCode = 'assdasd';

    const originalRecoveryByEmail = authService.recoveryByEmail;
    const mockRecoveryByEmail = jest.fn();
    mockRecoveryByEmail.mockImplementation(
      async (input: EmailValidationBodyDTO): Promise<void> => {
        await authRepository.deleteRecoveryCodeByUserID(testUser.userID);
        await authRepository.createRecoveryCodeRow({
          userID: testUser.userID,
          code: await hasher.hash(testCode),
          expiresAt: new Date(Date.now() + 15000),
        });
      },
    );
    authService.recoveryByEmail = mockRecoveryByEmail;

    const sentResult = await request(server).post('/auth/recovery/email').send({
      email: 'vkmorozov@gmail.com',
    });

    authService.recoveryByEmail = originalRecoveryByEmail;

    expect(sentResult.status).toBe(200);

    const newPassword = 'StronGPassword111';
    const confirmationResult = await request(server)
      .post('/auth/recovery/email/confirmation')
      .send({
        password: newPassword,
        email: 'vkmorozov@gmail.com',
        code: badCode,
      });

    expect(confirmationResult.status).toBe(400);
  });

  it('recovery user (correct email, right code, bad password)', async () => {
    const testCode = 'as213d';

    const originalRecoveryByEmail = authService.recoveryByEmail;
    const mockRecoveryByEmail = jest.fn();
    mockRecoveryByEmail.mockImplementation(
      async (input: EmailValidationBodyDTO): Promise<void> => {
        await authRepository.deleteRecoveryCodeByUserID(testUser.userID);
        await authRepository.createRecoveryCodeRow({
          userID: testUser.userID,
          code: await hasher.hash(testCode),
          expiresAt: new Date(Date.now() + 15000),
        });
      },
    );
    authService.recoveryByEmail = mockRecoveryByEmail;

    const sentResult = await request(server).post('/auth/recovery/email').send({
      email: 'vkmorozov@gmail.com',
    });

    authService.recoveryByEmail = originalRecoveryByEmail;

    expect(sentResult.status).toBe(200);

    const newPassword = 'strongpassword111';
    const confirmationResult = await request(server)
      .post('/auth/recovery/email/confirmation')
      .send({
        password: newPassword,
        email: 'vkmorozov@gmail.com',
        code: testCode,
      });

    expect(confirmationResult.status).toBe(400);
  });

  it('recovery user (bad confirmation email)', async () => {
    const testCode = 'as213d';

    const originalRecoveryByEmail = authService.recoveryByEmail;
    const mockRecoveryByEmail = jest.fn();
    mockRecoveryByEmail.mockImplementation(
      async (input: EmailValidationBodyDTO): Promise<void> => {
        await authRepository.deleteRecoveryCodeByUserID(testUser.userID);
        await authRepository.createRecoveryCodeRow({
          userID: testUser.userID,
          code: await hasher.hash(testCode),
          expiresAt: new Date(Date.now() + 15000),
        });
      },
    );
    authService.recoveryByEmail = mockRecoveryByEmail;

    const sentResult = await request(server).post('/auth/recovery/email').send({
      email: 'vkmorozov@gmail.com',
    });

    authService.recoveryByEmail = originalRecoveryByEmail;

    expect(sentResult.status).toBe(200);

    const newPassword = 'StronGPassword111';
    const confirmationResult = await request(server)
      .post('/auth/recovery/email/confirmation')
      .send({
        password: newPassword,
        email: 'vkmorozovvv@gmail.com',
        code: testCode,
      });

    expect(confirmationResult.status).toBe(404);
  });

  async function createTestUser() {
    const result = await request(server).post('/auth/register').send({
      login: 'adminVasya',
      password: 'vasyaWhite123',
      email: 'vkmorozov@gmail.com',
      tel: '+79991234319',
      dateOfBirth: '2003-01-01',
      displayName: 'admin Vasya',
    });
    return {
      login: 'adminVasya',
      password: 'vasyaWhite123',
      badLogin: 'adminVasyaa',
      badPassword: 'vasyaWhite12321',
      email: 'vkmorozov@gmail.com',
      userID: result.body.userID,
    };
  }

  async function deleteAllUserInfo(userID: number): Promise<void> {
    await authRepository.deleteRecoveryCodeByUserID(userID);
    await sessionRepository.deleteAllUserSessions(userID);
    await authRepository.deleteUser(userID);
  }
});

describe('AuthController (logout)', () => {
  let app: INestApplication;
  let server: any;
  let authRepository: AuthRepository;
  let sessionRepository: SessionRepository;
  let testUser: any;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    authRepository = moduleFixture.get<AuthRepository>(AuthRepository);
    sessionRepository = moduleFixture.get<SessionRepository>(SessionRepository);

    // Validation Pipes
    app.useGlobalPipes(new ValidationPipe());
    // cookie-parser
    const configService = app.get(ConfigService);
    app.use(cookieParser(configService.get<string>('COOKIE_SECRET')));
    await app.init();
    server = app.getHttpServer();
    testUser = await createTestUser();
  });

  afterAll(async () => {
    await deleteAllUserInfo(testUser.userID);
    await app.close();
  });

  beforeEach(async () => {
    jest.restoreAllMocks(); // Сбрасываем все шпионы перед каждым тестом
  });

  it('/auth/logout (correct data)', async () => {
    const spy = jest.spyOn(sessionRepository, 'createNewSession'); // Создание шпиона для метода someMethod

    const loginResult = await request(server)
      .post('/auth/login/local')
      .send({
        login: testUser.login,
        password: testUser.password,
      })
      .set('User-Agent', 'PostmanRuntime/7.40.0');

    expect(spy).toHaveBeenCalledTimes(1);
    expect(loginResult.status).toBe(200);
    expect(loginResult.get('Set-Cookie')).toBeDefined();
    expect(loginResult.body.access_token).toBeDefined();
    const refresh_token = await getRefreshToken(loginResult);

    const logoutResult = await request(server)
      .delete('/auth/logout')
      .set('Authorization', `Bearer ${loginResult.body.access_token}`) // Устанавливаем заголовок Authorization
      .set('User-Agent', 'PostmanRuntime/7.40.0')
      .set('Cookie', `refresh_token=${refresh_token}`);

    expect(logoutResult.status).toBe(200);
  });

  it('/auth/logout (bad access_token)', async () => {
    const spy = jest.spyOn(sessionRepository, 'createNewSession'); // Создание шпиона для метода someMethod

    const loginResult = await request(server)
      .post('/auth/login/local')
      .send({
        login: testUser.login,
        password: testUser.password,
      })
      .set('User-Agent', 'PostmanRuntime/7.40.0');

    expect(spy).toHaveBeenCalledTimes(1);
    expect(loginResult.status).toBe(200);
    expect(loginResult.get('Set-Cookie')).toBeDefined();
    expect(loginResult.body.access_token).toBeDefined();
    const refresh_token = await getRefreshToken(loginResult);

    const logoutResult = await request(server)
      .delete('/auth/logout')
      .set('Authorization', `Bearer adaskmdkasmds`) // Устанавливаем заголовок Authorization
      .set('User-Agent', 'PostmanRuntime/7.40.0')
      .set('Cookie', `refresh_token=${refresh_token}`);

    expect(logoutResult.status).toBe(401);
  });

  it('/auth/logout (bad user agent)', async () => {
    const spy = jest.spyOn(sessionRepository, 'createNewSession'); // Создание шпиона для метода someMethod

    const loginResult = await request(server)
      .post('/auth/login/local')
      .send({
        login: testUser.login,
        password: testUser.password,
      })
      .set('User-Agent', 'PostmanRuntime/7.40.0');

    expect(spy).toHaveBeenCalledTimes(1);
    expect(loginResult.status).toBe(200);
    expect(loginResult.get('Set-Cookie')).toBeDefined();
    expect(loginResult.body.access_token).toBeDefined();
    const refresh_token = await getRefreshToken(loginResult);

    const logoutResult = await request(server)
      .delete('/auth/logout')
      .set('Authorization', `Bearer ${loginResult.body.access_token}`) // Устанавливаем заголовок Authorization
      .set('User-Agent', 'Google Chrome')
      .set('Cookie', `refresh_token=${refresh_token}`);

    expect(logoutResult.status).toBe(404);
  });

  it('/auth/logout (bad refresh token)', async () => {
    const spy = jest.spyOn(sessionRepository, 'createNewSession'); // Создание шпиона для метода someMethod

    const loginResult = await request(server)
      .post('/auth/login/local')
      .send({
        login: testUser.login,
        password: testUser.password,
      })
      .set('User-Agent', 'PostmanRuntime/7.40.0');

    expect(spy).toHaveBeenCalledTimes(1);
    expect(loginResult.status).toBe(200);
    expect(loginResult.get('Set-Cookie')).toBeDefined();
    expect(loginResult.body.access_token).toBeDefined();
    const refresh_token = await getRefreshToken(loginResult);

    const logoutResult = await request(server)
      .delete('/auth/logout')
      .set('Authorization', `Bearer ${loginResult.body.access_token}`) // Устанавливаем заголовок Authorization
      .set('User-Agent', 'PostmanRuntime/7.40.0')
      .set('Cookie', `refresh_token=sadjianui,.w;ad,lsamdkoasmd`);

    expect(logoutResult.status).toBe(404);
  });

  async function createTestUser() {
    const result = await request(server).post('/auth/register').send({
      login: 'adminVasya',
      password: 'vasyaWhite123',
      email: 'vkmorozov@gmail.com',
      tel: '+79991234319',
      dateOfBirth: '2003-01-01',
      displayName: 'admin Vasya',
    });
    return {
      login: 'adminVasya',
      password: 'vasyaWhite123',
      badLogin: 'adminVasyaa',
      badPassword: 'vasyaWhite12321',
      userID: result.body.userID,
    };
  }

  async function deleteAllUserInfo(userID: number): Promise<void> {
    await sessionRepository.deleteAllUserSessions(userID);
    await authRepository.deleteUser(userID);
  }

  async function getRefreshToken(res: any): Promise<string> {
    const cookies = res.get('Set-Cookie')!;
    const refresh_token = cookies[0].split(';')[0].split('=')[1];
    return refresh_token;
  }
});

describe('AuthController (refresh)', () => {
  let app: INestApplication;
  let server: any;
  let authRepository: AuthRepository;
  let sessionRepository: SessionRepository;
  let testUser: any;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    authRepository = moduleFixture.get<AuthRepository>(AuthRepository);
    sessionRepository = moduleFixture.get<SessionRepository>(SessionRepository);

    // Validation Pipes
    app.useGlobalPipes(new ValidationPipe());
    // cookie-parser
    const configService = app.get(ConfigService);
    app.use(cookieParser(configService.get<string>('COOKIE_SECRET')));
    await app.init();
    server = app.getHttpServer();
    testUser = await createTestUser();
  });

  afterAll(async () => {
    await deleteAllUserInfo(testUser.userID);
    await app.close();
  });

  beforeEach(async () => {
    jest.restoreAllMocks(); // Сбрасываем все шпионы перед каждым тестом
  });

  it('/auth/refresh (correct data)', async () => {
    const spy = jest.spyOn(sessionRepository, 'createNewSession'); // Создание шпиона для метода someMethod

    const loginResult = await request(server)
      .post('/auth/login/local')
      .send({
        login: testUser.login,
        password: testUser.password,
      })
      .set('User-Agent', 'PostmanRuntime/7.40.0');

    expect(spy).toHaveBeenCalledTimes(1);
    expect(loginResult.status).toBe(200);
    expect(loginResult.get('Set-Cookie')).toBeDefined();
    expect(loginResult.body.access_token).toBeDefined();
    const refresh_token = await getRefreshToken(loginResult);

    const refreshResult = await request(server)
      .post('/auth/refresh')
      .set('User-Agent', 'PostmanRuntime/7.40.0')
      .set('Cookie', `refresh_token=${refresh_token}`);

    expect(refreshResult.status).toBe(200);
    expect(spy).toHaveBeenCalledTimes(2);
    expect(refreshResult.get('Set-Cookie')).toBeDefined();
    expect(refreshResult.body.access_token).toBeDefined();
  });

  it('/auth/refresh (bad refresh token)', async () => {
    const spy = jest.spyOn(sessionRepository, 'createNewSession'); // Создание шпиона для метода someMethod

    const loginResult = await request(server)
      .post('/auth/login/local')
      .send({
        login: testUser.login,
        password: testUser.password,
      })
      .set('User-Agent', 'PostmanRuntime/7.40.0');

    expect(spy).toHaveBeenCalledTimes(1);
    expect(loginResult.status).toBe(200);
    expect(loginResult.get('Set-Cookie')).toBeDefined();
    expect(loginResult.body.access_token).toBeDefined();
    const refresh_token = await getRefreshToken(loginResult);

    const refreshResult = await request(server)
      .post('/auth/refresh')
      .set('User-Agent', 'PostmanRuntime/7.40.0')
      .set('Cookie', `refresh_token=badtoken`);

    expect(refreshResult.status).toBe(400);
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('/auth/refresh (bad user-agent)', async () => {
    const spy = jest.spyOn(sessionRepository, 'createNewSession'); // Создание шпиона для метода someMethod

    const loginResult = await request(server)
      .post('/auth/login/local')
      .send({
        login: testUser.login,
        password: testUser.password,
      })
      .set('User-Agent', 'PostmanRuntime/7.40.0');

    expect(spy).toHaveBeenCalledTimes(1);
    expect(loginResult.status).toBe(200);
    expect(loginResult.get('Set-Cookie')).toBeDefined();
    expect(loginResult.body.access_token).toBeDefined();
    const refresh_token = await getRefreshToken(loginResult);

    const refreshResult = await request(server)
      .post('/auth/refresh')
      .set('User-Agent', 'PostmanRuntime/7.41.0')
      .set('Cookie', `refresh_token=${refresh_token}`);

    expect(refreshResult.status).toBe(404);
    expect(spy).toHaveBeenCalledTimes(1);
  });

  async function createTestUser() {
    const result = await request(server).post('/auth/register').send({
      login: 'adminVasya',
      password: 'vasyaWhite123',
      email: 'vkmorozov@gmail.com',
      tel: '+79991234319',
      dateOfBirth: '2003-01-01',
      displayName: 'admin Vasya',
    });
    return {
      login: 'adminVasya',
      password: 'vasyaWhite123',
      badLogin: 'adminVasyaa',
      badPassword: 'vasyaWhite12321',
      userID: result.body.userID,
    };
  }

  async function deleteAllUserInfo(userID: number): Promise<void> {
    await sessionRepository.deleteAllUserSessions(userID);
    await authRepository.deleteUser(userID);
  }

  async function getRefreshToken(res: any): Promise<string> {
    const cookies = res.get('Set-Cookie')!;
    const refresh_token = cookies[0].split(';')[0].split('=')[1];
    return refresh_token;
  }
});
