const express = require('express');
const client = require('prom-client');

const app = express();
const port = process.env.PORT || 3000;
const baseUrl = process.env.BASE_URL || '/api';

const register = new client.Registry();
client.collectDefaultMetrics({ register });

const requestCounter = new client.Counter({
  name: 'http_requests_total',
  help: 'Total de requisições HTTP recebidas',
  labelNames: ['method', 'route', 'status']
});
const httpRequestDuration = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duração das requisições HTTP',
  labelNames: ['method', 'route', 'status'],
  buckets: [0.05, 0.1, 0.3, 0.5, 1, 2]
});

register.registerMetric(requestCounter);
register.registerMetric(httpRequestDuration);

app.use(express.json());

app.use((req, res, next) => {
  const end = httpRequestDuration.startTimer();
  res.on('finish', () => {
    requestCounter.inc({ method: req.method, route: req.path, status: res.statusCode });
    end({ method: req.method, route: req.path, status: res.statusCode });
  });
  next();
});

app.get(`${baseUrl}/articles`, (req, res) => {
  res.json({
    articles: [
      {
        slug: 'infra-demo',
        title: 'Infra Demo',
        description: 'Uma API simples para demonstrar Docker, Kubernetes e observabilidade.',
        body: 'Conteúdo da aplicação de exemplo.',
        tagList: ['devops', 'infra', 'nodejs'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ]
  });
});

app.get('/healthz', (req, res) => res.send('ok'));
app.get('/readyz', (req, res) => res.send('ready'));

app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});

app.use((req, res) => res.status(404).json({ error: 'not_found' }));

if (require.main === module) {
  app.listen(port, () => {
    console.log(`App rodando na porta ${port}, BASE_URL=${baseUrl}`);
  });
}

module.exports = app;
