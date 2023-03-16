import { Sequelize, Model, DataTypes } from 'sequelize';

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './database.sqlite',
});

const GPS_Points = sequelize.define('GPS_Points', {
  createdAt: DataTypes.DATE,
  lat: DataTypes.FLOAT,
  lng: DataTypes.FLOAT,
  alt: DataTypes.FLOAT,
  hdop: DataTypes.FLOAT,
  vdop: DataTypes.FLOAT,
  pdop: DataTypes.FLOAT,
  fix: DataTypes.STRING,
  imagePath: DataTypes.STRING,
  category: DataTypes.STRING,
  type: DataTypes.STRING,
  name: DataTypes.STRING,
  note: DataTypes.STRING,
  time: DataTypes.INTEGER,
});

const GPS_Ways = sequelize.define('GPS_Ways', {
  createdAt: DataTypes.DATE,
  points: DataTypes.ARRAY(DataTypes.UUID),
  category: DataTypes.STRING,
  type: DataTypes.STRING,
  name: DataTypes.STRING,
  note: DataTypes.STRING,
});

async function init() {
  await GPS_Points.sync();
  await GPS_Ways.sync();
}

const finishedInit = init();

interface Point {
  lat: number;
  lng: number;
  alt: number;
  fix?: string;
  imagePath?: string;
  category?: string;
  type?: string;
  name?: string;
  note?: string;
  time: number;
  hdop?: number;
  vdop?: number;
  pdop?: number;
}
export async function createPoint(point: Point) {
  await finishedInit;
  return GPS_Points.create({
    ...point,
    createdAt: new Date(),
  });
}

export async function getAllPoints() {
  await finishedInit;
  return GPS_Points.findAll();
}

export async function getSinglePoint(id: number) {
  await finishedInit;
  return GPS_Points.findByPk(id);
}
