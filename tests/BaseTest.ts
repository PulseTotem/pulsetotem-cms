/**
 * @author Christian Brel <christian@pulsetotem.fr, ch.brel@gmail.com>
 */

/// <reference path="../scripts/core/Logger.ts" />
/// <reference path="../scripts/core/LoggerLevel.ts" />

declare var require : any;
declare var describe : any;
declare var beforeEach : any;
declare var it : any;

var assert : any = require("assert");
var sinon : any = require("sinon");
var nock : any = require("nock");

var moment : any = require('moment');
var uuid : any = require('node-uuid');

var db : any = require('../database/models/index.js');

Logger.setLevel(LoggerLevel.Debug);

