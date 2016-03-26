import path from 'path';

const videoFormats = [
    'mkv', 'avi', 'mp4', 'wmv', 'mov',
    'mpg', 'mpeg', 'm4v'
];

const isCorrectFiletype = (filename) => {
    const extension = path.extname(filename).toLowerCase().replace('.', '');
    return videoFormats.includes(extension);
};

export default isCorrectFiletype;
