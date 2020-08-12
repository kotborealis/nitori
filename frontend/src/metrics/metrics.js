import prom from 'promjs';

const registry = prom();

const REGISTRY_PREFIX = 'frontend_app_';

const push = () => fetch('/api/metrics/', {method: 'POST', body: registry.metrics()})
    .then(() => 0) // Don't care
    .catch(console.error.bind(console));

export const metricsRegistry = registry;
export const metricsPush = push;
export const METRICS_PREFIX = REGISTRY_PREFIX;