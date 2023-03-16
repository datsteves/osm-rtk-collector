import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import fs from 'fs/promises';
import { getPoint, currentPos } from './lib/gps';
import { createPoint, getAllPoints, getSinglePoint } from './lib/db';

const app = express();

const port = 3001;

app.use(
  bodyParser.json({
    limit: '100mb',
  })
);
app.use(
  bodyParser.json({
    type: 'text/plain',
    limit: '100mb',
  })
);
app.use(cors());

function createGuid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    var r = (Math.random() * 16) | 0,
      v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

async function saveImage(str: string) {
  const id = createGuid();
  const basePath = `${__dirname}/../images`;
  try {
    await fs.mkdir(basePath, { recursive: true });
  } catch (e) {
    // ignore
  }
  const path = `${basePath}/${new Date().getTime()}-${id}.jpg`;

  await fs.writeFile(path, Buffer.from(str, 'base64'));
  return path;
}

app.listen(port, async () => {
  console.log(`Example app listening on port ${port}`);
});

app.post('/point', async (req, res) => {
  console.debug(req.body);
  const pos = await getPoint();
  if (!pos) {
    return res.status(500).send('No position');
  }
  let imagePath = '';
  if (req.body.base64Image) {
    imagePath = await saveImage(req.body.base64Image);
  }
  const point = await createPoint({
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
    // vdop: pos.vdop,
    // pdop: pos.pdop,
  });
  res.contentType('json').send(JSON.stringify(point.toJSON()));
});

app.get('/points', async (req, res) => {
  const points = await getAllPoints();
  res.contentType('json').send(
    JSON.stringify({
      points: points.map((point: any) => point.toJSON()),
      currentPos,
    })
  );
});

app.get('/points/:id', async (req, res) => {
  const point = await getSinglePoint(parseInt(req.params.id, 10));
  if (!point) {
    return res.status(404).send('Not found');
  }
  res.contentType('json').send(JSON.stringify(point.toJSON()));
});
app.get('/points/:id/image', async (req, res) => {
  const point = await getSinglePoint(parseInt(req.params.id, 10));
  // @ts-expect-error imagePath is not defined
  if (!point || !point.imagePath) {
    return res.status(404).send('Not found');
  }
  // @ts-expect-error imagePath is not defined
  const loadImage = await fs.readFile(point.imagePath);
  res.contentType('image/jpeg').send(loadImage);
});

function getGPX(p: any[]) {
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
  const points = await getAllPoints();
  const gpx = getGPX(JSON.parse(JSON.stringify(points)));
  res.contentType('application/gpx+xml').send(gpx);
});
