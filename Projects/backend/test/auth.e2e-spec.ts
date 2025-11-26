import request from 'supertest';

const base = 'http://localhost:3000';

describe('Auth (e2e)', () => {
  const email = `test+${Date.now()}@example.com`;
  const password = 'testpassword';

  it('register -> login flow', async () => {
    // register
    const r = await request(base)
      .post('/auth/register')
      .send({ email, password, name: 'Test User' })
      .set('Accept', 'application/json');
    expect(r.status).toBe(201);
    expect(r.body).toHaveProperty('id');

    // login
    const l = await request(base)
      .post('/auth/login')
      .send({ email, password })
      .set('Accept', 'application/json');
    expect(l.status).toBe(201);
    expect(l.body).toHaveProperty('access_token');
  });
});
