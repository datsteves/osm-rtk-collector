"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSinglePoint = exports.getAllPoints = exports.createPoint = void 0;
const sequelize_1 = require("sequelize");
const sequelize = new sequelize_1.Sequelize({
    dialect: 'sqlite',
    storage: './database.sqlite',
});
const GPS_Points = sequelize.define('GPS_Points', {
    createdAt: sequelize_1.DataTypes.DATE,
    lat: sequelize_1.DataTypes.FLOAT,
    lng: sequelize_1.DataTypes.FLOAT,
    alt: sequelize_1.DataTypes.FLOAT,
    hdop: sequelize_1.DataTypes.FLOAT,
    vdop: sequelize_1.DataTypes.FLOAT,
    pdop: sequelize_1.DataTypes.FLOAT,
    fix: sequelize_1.DataTypes.STRING,
    imagePath: sequelize_1.DataTypes.STRING,
    category: sequelize_1.DataTypes.STRING,
    type: sequelize_1.DataTypes.STRING,
    name: sequelize_1.DataTypes.STRING,
    note: sequelize_1.DataTypes.STRING,
    time: sequelize_1.DataTypes.INTEGER,
});
const GPS_Ways = sequelize.define('GPS_Ways', {
    createdAt: sequelize_1.DataTypes.DATE,
    points: sequelize_1.DataTypes.ARRAY(sequelize_1.DataTypes.UUID),
    category: sequelize_1.DataTypes.STRING,
    type: sequelize_1.DataTypes.STRING,
    name: sequelize_1.DataTypes.STRING,
    note: sequelize_1.DataTypes.STRING,
});
async function init() {
    await GPS_Points.sync();
    await GPS_Ways.sync();
}
const finishedInit = init();
async function createPoint(point) {
    await finishedInit;
    return GPS_Points.create({
        ...point,
        createdAt: new Date(),
    });
}
exports.createPoint = createPoint;
async function getAllPoints() {
    await finishedInit;
    return GPS_Points.findAll();
}
exports.getAllPoints = getAllPoints;
async function getSinglePoint(id) {
    await finishedInit;
    return GPS_Points.findByPk(id);
}
exports.getSinglePoint = getSinglePoint;
//# sourceMappingURL=db.js.map