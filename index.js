import express from 'express';
import fs from 'fs';
import path from 'path';

import {extractRangeFromHeader} from './extract-range-from-header.js';
import {VIDEO_CHUNK_BYTE_SIZE} from './constants.js';

const app = express();
const port = process.env.PORT || 3030;

// FIXME Do not hardcode video source.
const videoPath = path.join(path.resolve(), 'videos', 'KOHAKU.mp4');
const videoSize = fs.statSync(videoPath).size;

app.use(express.static('./'));

app.get('/video', (req, res) => {
    const rangeHeader = req.headers.range;

    if (!rangeHeader) {
        res.status(400).send('Requires Range header');
    }

    const range = extractRangeFromHeader(rangeHeader, VIDEO_CHUNK_BYTE_SIZE, videoSize);

    res.writeHead(206, {
        'Content-Range': `bytes ${range.start}-${range.end}/${videoSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': range.end - range.start + 1,
        'Content-Type': 'video/mp4'
    });

    fs.createReadStream(videoPath, range).pipe(res);
});

app.listen(port, () => {
    console.log('Server started on port: ' + port);
});
