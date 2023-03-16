"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const cors_1 = __importDefault(require("cors"));
const promises_1 = __importDefault(require("fs/promises"));
const gps_1 = require("./lib/gps");
const db_1 = require("./lib/db");
const app = (0, express_1.default)();
const port = 3001;
app.use(body_parser_1.default.json({
    limit: '100mb',
}));
app.use(body_parser_1.default.json({
    type: 'text/plain',
    limit: '100mb',
}));
app.use((0, cors_1.default)());
function createGuid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = (Math.random() * 16) | 0, v = c === 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
    });
}
async function saveImage(str) {
    const id = createGuid();
    const basePath = `${__dirname}/../images`;
    try {
        await promises_1.default.mkdir(basePath, { recursive: true });
    }
    catch (e) {
    }
    const path = `${basePath}/${new Date().getTime()}-${id}.jpg`;
    await promises_1.default.writeFile(path, Buffer.from(str, 'base64'));
    return path;
}
app.listen(port, async () => {
    console.log(`Example app listening on port ${port}`);
});
app.post('/point', async (req, res) => {
    console.debug(req.body);
    const pos = await (0, gps_1.getPoint)();
    if (!pos) {
        return res.status(500).send('No position');
    }
    let imagePath = '';
    if (req.body.base64Image) {
        imagePath = await saveImage(req.body.base64Image);
    }
    const point = await (0, db_1.createPoint)({
        alt: pos.alt,
        lat: pos.lat,
        lng: pos.lng,
        time: pos.time,
        category: req.body.category,
        type: req.body.type,
        name: req.body.name,
        note: req.body.note,
        imagePath,
        fix: pos.fix,
        hdop: pos.hdop,
    });
    res.contentType('json').send(JSON.stringify(point.toJSON()));
});
app.get('/points', async (req, res) => {
    const points = await (0, db_1.getAllPoints)();
    res.contentType('json').send(JSON.stringify({
        points: points.map((point) => point.toJSON()),
        currentPos: gps_1.currentPos,
    }));
});
app.get('/points/:id', async (req, res) => {
    const point = await (0, db_1.getSinglePoint)(parseInt(req.params.id, 10));
    if (!point) {
        return res.status(404).send('Not found');
    }
    res.contentType('json').send(JSON.stringify(point.toJSON()));
});
app.get('/points/:id/image', async (req, res) => {
    const point = await (0, db_1.getSinglePoint)(parseInt(req.params.id, 10));
    if (!point || !point.imagePath) {
        return res.status(404).send('Not found');
    }
    const loadImage = await promises_1.default.readFile(point.imagePath);
    res.contentType('image/jpeg').send(loadImage);
});
function getGPX(p) {
    const points = p.map(elem => {
        const { alt, lat, lng, time, imagePath, name, ...rest } = elem;
        const props = [];
        Object.keys(rest).forEach(key => {
            props.push(`<custom-${key}>${rest[key]}</custom-${key}>`);
        });
        props.push(`<ele>${elem.alt}</ele>`);
        props.push(`<time>${new Date(elem.time).toISOString()}</time>`);
        props.push(`<name>${elem.name}</name>`);
        props.push(`<desc>${elem.note}</desc>`);
        props.push(`<fix>${elem.fix}</fix>`);
        props.push(`<hdop>${elem.hdop}</hdop>`);
        return `<wpt lat="${elem.lat}" lon="${elem.lng}">${props.join('\n')}</wpt>`;
    });
    const template = `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1">
	<name>Example gpx</name>
	${points.join('\n')}
</gpx>
  `;
    return template;
}
app.get('/gpx', async (req, res) => {
    const points = await (0, db_1.getAllPoints)();
    const gpx = getGPX(JSON.parse(JSON.stringify(points)));
    res.contentType('application/gpx+xml').send(gpx);
});
//# sourceMappingURL=server.js.map