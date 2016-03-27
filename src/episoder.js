import filenameParser from './filenameParser';
import template from './template';
import * as api from './api';
import isCorrectFiletype from './isCorrectFiletype';
import {defaults} from 'lodash';
import {logger} from 'batch-file-renamer';

const episoder = async (filename, options) => {
    if (!isCorrectFiletype(filename)) {
        logger.log(`Ignoring '${filename}'`)
        return null;
    }
    let newname = null;
    try {
        const parsed = filenameParser(filename, options);
        const data = await api.get(parsed);
        const showInfo = defaults(data, parsed);
        newname = template(showInfo);
    } catch (err) {
        logger.error(err.message);
    }
    return newname;
}

export default episoder;
