import path from 'path';
import { _, partial, flow, each, map, pick, trim, defaults, toNumber, isNil, isNaN, isEqual } from 'lodash';
import XRegExp from 'xregexp';
import titleCase from 'to-title-case';

const regexes = [

    // XRegExp provides named groups in regex...
    // (?<name>pattern)

    // matches:
    //   Community S01E04.mp4
    //   Community s01e04.mp4
    //   Community 1x04.mp4
    //   Community 1-04.mp4
    '(?<show> .* )\\D(?<season> \\d{1,2} )[ex\\-](?<episode> \\d{1,2} )',

    // matches:
    //   Community Season 1 Episode 4.mp4
    '(?<show> .* )Season.*?(?<season> \\d{1,2} ).*Episode\\D*?(?<episode> \\d{1,2} )',

    // matches:
    //   Community 104.mp4
    '(?<show> .* )\\D(?<season> \\d )(?<episode> \\d\\d )\\D',

    // matches:
    //   Community 04.mp4
    '(?<show> .* )\\D(?<episode> \\d+ )\\D',

    // matches:
    //   04.mp4
    '(?<episode> \\d+ )\\D'

];

let parseString = (filename) => {
    for (const regex of regexes) {
        const re = XRegExp(regex, 'ix');
        const match = XRegExp.exec(filename, re);
        if (match) {
            return pick(match, [ 'show', 'episode', 'season' ]);
        }
    }
}

let stripHangingChars =
    partial(trim, _, ['-', '.', ' ', '_', '~']);

let formatTitle =
    flow(stripHangingChars, titleCase);

let isEmptyString =
    partial(isEqual, '');

let validateResult = (props) =>
    // each returns the argument it was passed
    each(props, (val, key) => {
        const { filename } = props;
        if (isNaN(val) || isNil(val) || isEmptyString(val)) {
            throw new Error(`Unable to parse filename: ${filename}. Could not find ${key}.`);
        }
    });

let parseFilename = (filename, options = {}) => {
    const extension = path.extname(filename).toLowerCase();
    const basename = path.basename(filename);
    const parsed = parseString(basename, options);
    let { show, season, episode } = defaults(options, parsed);

    show = formatTitle(show);
    [ episode, season ] = map([ episode, season ], toNumber);

    return validateResult({
        filename,
        extension,
        show,
        episode,
        season
    });
};

export default parseFilename;
