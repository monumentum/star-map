const Promise = require('bluebird');
const actionParser = require('./action-parser');

const { has } = require('lodash');

class StarMap {
    constructor(map) {
        this._map = map;
        this._pipe = [];
        this.parsex = this.add.bind(this);
        this.bigbang = this.build.bind(this);
    }

    add(fileName, opts = { track: true }) {
        const prop = opts.star || opts.prop;

        if (!fileName || typeof fileName !== 'string') {
            throw new Error('You should send a string (file|folder) as first argument');
        }

        if (!prop) {
            throw new Error('Missing <star||prop> param in <add|parsex> method')
        }

        if (!has(this._map, prop)) {
            throw new Error('Property that you are trying to set wasn`t declared during StarMap initialization');
        }

        this._pipe.push({
            file: fileName,
            prop: prop,
            track: opts.constelation || opts.track,
            parse: opts.strategy || opts.parse,
        });

        return this;
    }

    build() {
        return Promise.each(this._pipe, actionParser);
    }
}

module.exports = StarMap;