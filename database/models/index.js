/**
 * @author Christian Brel <christian@pulsetotem.fr, ch.brel@gmail.com>
 *
 * Based on file available here : https://github.com/sequelize/express-example
 */

'use strict';

var fs        = require('fs');
var path      = require('path');
var moment = require('moment');
var Sequelize = require('sequelize');
var basename  = path.basename(module.filename);
var env       = process.env.NODE_ENV || 'development';
var config    = require('../config/config.json')[env];

var associations = require('../associations/dbAssociations.js');

// Begin : Patch for Sequelize and their use of momentJS.
Sequelize.DATE.prototype.$applyTimezone = function (date, options) {
  var momentDate = null;

  if(date == "now()") {
    momentDate = moment();
  } else {
    momentDate = moment(new Date(date));
  }

  if (options.timezone) {
    if (moment.tz.zone(options.timezone)) {
      momentDate = momentDate.tz(options.timezone);
    } else {
      momentDate = momentDate.utcOffset(options.timezone);
    }
  }

  return momentDate;
};
// End : Patch for Sequelize and their use of momentJS.


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
  var options = {omitNull: true, logging: false};
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

associations.hasMany.forEach(function(hMAss) {
  var modelA = db[hMAss[0]];
  var modelB = db[hMAss[1]];

  if(typeof(hMAss[2]) != "undefined") {
    modelA.hasMany(modelB, hMAss[2]);
  } else {
    modelA.hasMany(modelB);
  }
});

associations.belongsTo.forEach(function(bTAss) {
  var modelA = db[bTAss[0]];
  var modelB = db[bTAss[1]];

  if(typeof(bTAss[2]) != "undefined") {
    modelA.belongsTo(modelB, bTAss[2]);
  } else {
    modelA.belongsTo(modelB);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;