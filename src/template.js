import { padStart } from 'lodash';
import sanitize from 'sanitize-filename'

const padNum = (n, size = 2) => padStart(n, size, '0');

const applyTemplate = ({ show, season, episode, title, extension }) => {
    return sanitize(`${show} - S${padNum(season)}E${padNum(episode)} - ${title}${extension}`);
}

export default applyTemplate;
