import { kebabCase } from 'lodash';

const host = 'https://api-v2launch.trakt.tv'

function urlBuilder({ show, season, episode }) {
    show = kebabCase(show);
    return `${host}/shows/${show}/seasons/${season}/episodes/${episode}`;
}

export default urlBuilder;
