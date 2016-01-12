/**
 * @author Christian Brel <christian@pulsetotem.fr, ch.brel@gmail.com>
 *
 * Generated file with "sequelize-cli" and "sequelize-auto",
 * and then file updated to manage models relations.
 */

'use strict';

var fs        = require('fs');
var path      = require('path');
var Sequelize = require('sequelize');
var basename  = path.basename(module.filename);
var env       = process.env.NODE_ENV || 'development';
var config    = require('../config/config.json')[env];

var sequelize = null;
if(process.env.DATABASE_URL) {
  var match = process.env.DATABASE_URL.match(/postgres:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/);
  sequelize   = new Sequelize(match[5], match[1], match[2], {
    dialect:  'postgres',
    protocol: 'postgres',
    port:     match[4],
    host:     match[3],
    omitNull: true,
    logging: false
  });
} else {
  var options = {omitNull: true};
  for (var attrname in config) {
    if(attrname != "database" && attrname != "username" && attrname != "password") {
      options[attrname] = config[attrname];
    }
  }
  sequelize   = new Sequelize(config.database, config.username, config.password, options);
}

var db        = {};

fs
  .readdirSync(__dirname)
  .filter(function(file) {
    return (file.indexOf('.') !== 0) && (file !== basename);
  })
  .forEach(function(file) {
    if (file.slice(-3) !== '.js') return;
    var model = sequelize['import'](path.join(__dirname, file));
    db[model.name] = model;
  });

Object.keys(db).forEach(function(modelName) {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;