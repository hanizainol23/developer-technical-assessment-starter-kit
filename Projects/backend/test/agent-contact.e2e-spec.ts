import request from 'supertest';

const base = 'http://localhost:3000';

describe('Agent Contact (e2e)', () => {
  const email = `agent+${Date.now()}@example.com`;
  const password = 'agentpass';

  let token: string;

  beforeAll(async () => {
    // register and login to get token
    await request(base)
      .post('/auth/register')
      .send({ email, password, name: 'Agent User' })
      .set('Accept', 'application/json');

    const l = await request(base)
      .post('/auth/login')
      .send({ email, password })
      .set('Accept', 'application/json');
    token = l.body.access_token;
  });

  it('POST /agent-contact should accept authenticated requests', async () => {
    const res = await request(base)
      .post('/agent-contact')
      .set('Authorization', `Bearer ${token}`)
      .send({ property_id: 1, message: 'Please contact me' })
      .set('Accept', 'application/json');
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('ok', true);
    expect(res.body).toHaveProperty('id');
  });
});
