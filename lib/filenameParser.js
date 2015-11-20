import path from 'path';
import _ from 'lodash';
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
            return _.pick(match, [ 'show', 'episode', 'season' ]);
        }
    }
}

let stripHangingChars = (str) =>
    _.trim(str, ['-', '.', ' ']);

let formatTitle = (title) =>
    titleCase(stripHangingChars(title))

let parseFilename = (filename, options = {}) => {
    const extension = path.extname(filename).toLowerCase();
    const parsed = parseString(filename, options);
    let { show, season, episode } = _.defaults(options, parsed);

    if (_.any([ show, season, episode ], _.isUndefined)) {
        throw new Error('Unable to parse filename: ' + filename);
    }

    show = formatTitle(show);
    episode = Number(episode);
    season = Number(season);

    return {
        filename,
        extension,
        show,
        episode,
        season
    };
};

export default parseFilename;
