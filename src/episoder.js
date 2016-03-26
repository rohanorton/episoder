import filenameParser from './filenameParser';
import template from './template';
import * as api from './api';
import {defaults} from 'lodash';

const episoder = async (filename, options) => {
    const parsed = filenameParser(filename, options);
    const data = await api.get(parsed);
    const showInfo = defaults(data, parsed);
    const newname = template(showInfo);
    return newname;
}

export default episoder;
