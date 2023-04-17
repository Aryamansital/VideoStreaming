import express from 'express';
import fs from 'fs';
import path from 'path';

import {extractRangeFromHeader} from './extract-range-from-header.js';
import {VIDEO_CHUNK_BYTE_SIZE} from './constants.js';

const app = express();
const port = process.env.PORT || 3030;

// FIXME Do not hardcode video source.
var videoPath ;

var vid1 = document.getElementById("vid1");
var vid2 = document.getElementById("vid2");
var vid3 = document.getElementById("vid3");

vid1.onclick = function(){
    videoPath = path.join(path.resolve(), 'videos', 'KOHAKU.mp4');
    console.log("vid 1");
}

vid2.onclick = function(){
    videoPath = path.join(path.resolve(), 'videos', 'vid2.mp4');
    console.log("vid 2")
}

vid3.onclick = function(){
    videoPath = path.join(path.resolve(), 'videos', 'KOHAKU.mp4');
    console.log("vid 3")
}

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


