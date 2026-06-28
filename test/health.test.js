const request = require('supertest');
const app = require('../server');

request(app)
  .get('/healthz')
  .expect(200)
  .expect('ok')
  .end((err) => {
    if (err) {
      console.error(err);
      process.exit(1);
    }

    console.log('Health check passed');
    process.exit(0);
  });
