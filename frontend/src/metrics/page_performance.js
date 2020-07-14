import {METRICS_PREFIX as REGISTRY_PREFIX, metricsPush, metricsRegistry as registry} from './metrics';

window.addEventListener('load', () => setTimeout(() => {
    const page_load_time = registry.create(
        'histogram',
        REGISTRY_PREFIX + 'page_load_time',
        'Page load timing',
        [0, 1000, 2000]
    );

    const {loadEventEnd, navigationStart} = performance.timing;
    page_load_time.observe(loadEventEnd - navigationStart);

    const page_render_time = registry.create(
        'histogram',
        REGISTRY_PREFIX + 'page_render_time',
        'Page render timing',
        [0, 1000, 2000]
    );

    const {domComplete, domLoading} = performance.timing;
    page_render_time.observe(domComplete - domLoading);

    metricsPush();
}, 0));