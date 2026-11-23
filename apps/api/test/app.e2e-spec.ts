import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { DataSource } from 'typeorm';
import { AppModule } from '../src/app.module';
import { configureApp } from '../src/main';

/**
 * End-to-end: real Nest app + real PostgreSQL (DATABASE_URL must point to a TEST database —
 * every table is wiped before the run).
 * Walks the main business flow: client sends a brief -> manager accepts -> project moves on the board.
 */
describe('BriefBoard API (e2e)', () => {
  let app: INestApplication;
  let token: string;
  let briefId: string;
  let projectId: string;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = configureApp(moduleRef.createNestApplication());
    await app.init();
    await app.get(DataSource).query('TRUNCATE projects, briefs, users RESTART IDENTITY CASCADE');
  });

  afterAll(async () => app.close());

  const http = () => request(app.getHttpServer());

  it('GET /health', () => http().get('/health').expect(200, { status: 'ok' }));

  it('registers a manager and returns a JWT', async () => {
    const res = await http()
      .post('/auth/register')
      .send({ email: 'Manager@Studio.kz', name: 'Manager', password: 'password123' })
      .expect(201);
    expect(res.body.accessToken).toEqual(expect.any(String));
    expect(res.body.user).toMatchObject({ email: 'manager@studio.kz', role: 'MEMBER' });
    expect(res.body.user.passwordHash).toBeUndefined();
    token = res.body.accessToken;
  });

  it('rejects a duplicate email with 409', () =>
    http().post('/auth/register').send({ email: 'manager@studio.kz', name: 'Another', password: 'password123' }).expect(409));

  it('rejects a wrong password with 401', () =>
    http().post('/auth/login').send({ email: 'manager@studio.kz', password: 'nope-nope' }).expect(401));

  it('accepts a public brief without login', async () => {
    const res = await http()
      .post('/briefs')
      .send({
        clientName: 'Dana',
        company: 'Qazaq Coffee',
        email: 'dana@qc.kz',
        services: ['BRANDING', 'WEB'],
        description: 'Need a logo, identity and a landing page for a coffee chain.',
      })
      .expect(201);
    expect(res.body.status).toBe('NEW');
    briefId = res.body.id;
  });

  it('validates the brief body (400 on bad enum and extra fields)', () =>
    http()
      .post('/briefs')
      .send({ clientName: 'D', email: 'not-an-email', services: ['TIKTOK'], description: 'short', hacked: true })
      .expect(400));

  it('protects the inbox: 401 without a token', () => http().get('/briefs').expect(401));

  it('accepting a brief creates a project in STRATEGY', async () => {
    const res = await http().patch(`/briefs/${briefId}/accept`).set('Authorization', `Bearer ${token}`).expect(200);
    expect(res.body).toMatchObject({ stage: 'STRATEGY', clientName: 'Dana', briefId });
    projectId = res.body.id;
  });

  it('cannot accept the same brief twice (409)', () =>
    http().patch(`/briefs/${briefId}/accept`).set('Authorization', `Bearer ${token}`).expect(409));

  it('moves the project one column forward', async () => {
    const res = await http()
      .patch(`/projects/${projectId}/stage`)
      .set('Authorization', `Bearer ${token}`)
      .send({ stage: 'DESIGN' })
      .expect(200);
    expect(res.body.stage).toBe('DESIGN');
  });

  it('refuses to skip columns (400)', () =>
    http()
      .patch(`/projects/${projectId}/stage`)
      .set('Authorization', `Bearer ${token}`)
      .send({ stage: 'DELIVERED' })
      .expect(400));

  it('stats count projects by stage', async () => {
    const res = await http().get('/projects/stats').set('Authorization', `Bearer ${token}`).expect(200);
    expect(res.body.byStage.DESIGN).toBe(1);
    expect(res.body.total).toBe(1);
    expect(res.body.newBriefs).toBe(0);
  });

  it('only admins can delete (403 for a member)', () =>
    http().delete(`/projects/${projectId}`).set('Authorization', `Bearer ${token}`).expect(403));
});
