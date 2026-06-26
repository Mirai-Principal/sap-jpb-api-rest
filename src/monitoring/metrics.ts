const client = require('prom-client');

const register = new client.Registry();

client.collectDefaultMetrics({
    register
});

const httpRequests = new client.Counter({
    name: 'http_requests_total',
    help: 'Total de requests',
    labelNames: ['method', 'route', 'status']
});

const httpDuration = new client.Histogram({
    name: 'http_request_duration_seconds',
    help: 'Duración de requests',
    labelNames: ['method', 'route'],
    buckets: [0.1, 0.3, 0.5, 1, 2, 5]
});

register.registerMetric(httpRequests);
register.registerMetric(httpDuration);

module.exports = {
    register,
    httpRequests,
    httpDuration
};