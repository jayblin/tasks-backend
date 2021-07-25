"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MongoDB = void 0;
var mongodb_1 = require("mongodb");
var MongoDB = /** @class */ (function () {
    function MongoDB() {
        /**
         * @todo: в env
         */
        this._port = '27017';
        this._host = 'mongodb://localhost';
        this._client = null;
    }
    MongoDB.prototype.Client = function () {
        if (!this._client) {
            this._client = new mongodb_1.MongoClient(this._host + ":" + this._port, {
                useNewUrlParser: true,
                useUnifiedTopology: true,
            });
        }
        return this._client;
    };
    return MongoDB;
}());
exports.MongoDB = MongoDB;
var inst = new MongoDB();
exports.default = inst;
