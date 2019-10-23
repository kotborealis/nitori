import urljoin from 'url-join';

export const API_URL = urljoin(process.env.PUBLIC_PATH, `/nitori_api`);