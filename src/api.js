import urlBuilder from './urlBuilder';
import cache from './cache';
import request from 'request-promise'

const queryApi = cache(async (url) => {
    const data = await request(url, {
        headers: {
            'Content-type': 'application/json',
            'trakt-api-key': '2a3022a90d1e592cabe6590cb30c0cc53003ac35de76dd740365e717a134968b',
            'trakt-api-version': 2
        }
    });
    return JSON.parse(data);
});

const get = async (options) => {
    const url = urlBuilder(options);
    const data = await queryApi(url);
    return data;
};


export { get };
