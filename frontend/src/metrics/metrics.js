import prom from 'promjs';

const registry = prom();

window.addEventListener('load', () => setTimeout(() => {
    const page_load_time = registry.create(
        'histogram',
        'page_load_time',
        'Page load timing',
        [0, 1000, 2000]
    );

    const {loadEventEnd, navigationStart} = performance.timing;
    page_load_time.observe(loadEventEnd - navigationStart);

    const page_render_time = registry.create(
        'histogram',
        'page_render_time',
        'Page render timing',
        [0, 1000, 2000]
    );

    const {domComplete, domLoading} = performance.timing;
    page_render_time.observe(domComplete - domLoading);

    fetch('/api/metrics/', {method: 'POST', body: registry.metrics()});
}, 0));

window.registry = registry;