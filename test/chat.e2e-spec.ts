import { INestApplication, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import * as cookieParser from 'cookie-parser';
import { AppModule } from 'src/app.module';
import { AuthService } from 'src/auth';
import { Hasher } from 'src/auth/hasher';
import { AuthRepository, ChatRepository } from 'src/database';
import { SessionRepository } from 'src/database/session.repository';
import { EmailService } from 'src/email/email.service';
import * as request from 'supertest';

describe('ChatController (register)', () => {
  let app: INestApplication;
  let server: any;
  let authRepository: AuthRepository;
  let authService: AuthService;
  let sessionRepository: SessionRepository;
  let emailService: EmailService;
  let testUsers: any;
  let hasher: Hasher;
  let chatRepository: ChatRepository;

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
    chatRepository = moduleFixture.get<ChatRepository>(ChatRepository);

    // Validation Pipes
    app.useGlobalPipes(new ValidationPipe());
    // cookie-parser
    const configService = app.get(ConfigService);
    app.use(cookieParser(configService.get<string>('COOKIE_SECRET')));
    await app.init();
    server = app.getHttpServer();
  });

  beforeEach(async () => {
    testUsers = await createTestUsers();
    jest.clearAllMocks();
  });

  afterEach(async () => {
    await deleteAllUserInfo(testUsers);
  });

  afterAll(async () => {
    await app.close();
  });

  it('Create chat (1 person)', async () => {
    const adminUser = testUsers[0];
    const user1 = testUsers[1];
    const user2 = testUsers[2];

    const tokens = await loginUsers(testUsers);

    const createdChatResult = await request(server)
      .post('/chat/create')
      .send({
        userLogins: [],
      })
      .set('Authorization', `Bearer ${tokens[0]}`);

    expect(createdChatResult.status).toBe(201);
    expect(createdChatResult.body).toBe({ userID: expect.any(Number) });

    deleteChat(createdChatResult.body.chatID);
    await deleteAllUserInfo(testUsers);
  });

  async function createTestUsers() {
    const sasha = await request(server).post('/auth/register').send({
      login: 'adminSasha',
      password: 'oA1209Asa',
      email: 'sasha@gmail.com',
      tel: '+79991234310',
      dateOfBirth: '2003-01-01',
      displayName: 'admin Sasha',
    });
    const vasya = await request(server).post('/auth/register').send({
      login: 'adminVasya',
      password: 'vasyaWhite123',
      email: 'vasya@gmail.com',
      tel: '+79991234319',
      dateOfBirth: '2003-05-06',
      displayName: 'admin Vasya',
    });
    const artem = await request(server).post('/auth/register').send({
      login: 'adminArtem',
      password: 'plaYers735',
      email: 'artem@gmail.com',
      tel: '+79991234318',
      dateOfBirth: '2003-05-02',
      displayName: 'admin Artem',
    });
    return [
      {
        login: 'adminArtem',
        password: 'plaYers735',
        email: 'artem@gmail.com',
        tel: '+79991234318',
        dateOfBirth: '2003-05-02',
        displayName: 'admin Artem',
        userID: artem.body.userID,
      },
      {
        login: 'adminVasya',
        password: 'vasyaWhite123',
        email: 'vasya@gmail.com',
        tel: '+79991234319',
        dateOfBirth: '2003-05-06',
        displayName: 'admin Vasya',
        userID: vasya.body.userID,
      },
      {
        login: 'adminSasha',
        password: 'oA1209Asa',
        email: 'sasha@gmail.com',
        tel: '+79991234310',
        dateOfBirth: '2003-01-01',
        displayName: 'admin Sasha',
        userID: sasha.body.userID,
      },
    ];
  }

  async function loginUsers(users: any): Promise<string[]> {
    const result: string[] = [];
    for (const user of users) {
      const loginResult = await request(server)
        .post('/auth/login/local')
        .send({
          login: user.login,
          password: user.password,
        })
        .set('User-Agent', 'PostmanRuntime/7.40.0');
      result.push(loginResult.body.access_token);
    }
    return result;
  }

  async function deleteAllUserInfo(users: any): Promise<void> {
    for (const user of users) {
      await sessionRepository.deleteAllUserSessions(user.userID);
      await authRepository.deleteUser(user.userID);
    }
  }

  async function deleteChat(chatID: number): Promise<void> {
    await chatRepository.deleteChat(chatID);
  }
});
