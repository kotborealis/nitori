import urljoin from 'url-join';
import React, {useState} from 'react';

export const API_URL = urljoin(process.env.PUBLIC_PATH, `/api/v1/`);

export const api = (url, options) => fetch(urljoin(API_URL, ...(Array.isArray(url) ? url : [url])), options);