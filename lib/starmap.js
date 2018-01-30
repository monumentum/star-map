const Promise = require('bluebird');
const actionParser = require('./action-parser');
const Graph = require('tarjan-graph');

const { has, chain, find, get } = require('lodash');

const setupSCC = (scc, pipe) =>
    chain(scc)
        .orderBy('0.successors.length')
        .map('0')
        .map(vertex => find(pipe, p => get(p, 'prop') === vertex.name))
        .value();

class StarMap {
    constructor(map) {
        this._map = map;
        this._pipe = [];
        this.parsex = this.add.bind(this);
        this.bigbang = this.build.bind(this);
    }

    add(fileName, opts = {}) {
        const prop = opts.star || opts.prop;
        const multi = opts.constelation || opts.multi;

        if (!fileName || typeof fileName !== 'string') {
            throw new Error('You should send a string (file|folder) as first argument');
        }

        if (!prop && !multi) {
            throw new Error('Missing <star||prop> param in <add|parsex> method')
        }

        if (!has(this._map, prop) && !multi) {
            throw new Error('Property that you are trying to set wasn`t declared during StarMap initialization');
        }

        if (multi) {
            multi.forEach(m => {
                m.wait = m.wait || [];
                m.wait = m.wait.concat(opts.wait);
                this.add(fileName, m);
            });
        } else {
            this._pipe.push({
                file: fileName,
                prop: prop,
                parser: opts.strategy || opts.parser,
                wait: opts.wait || []
            });
        }

        return this;
    }

    buildChainOfDeep() {
        const graph = new Graph();

        this._pipe.forEach(pipe => {
            if (!pipe.wait.length) return;
            graph.add(pipe.prop, pipe.wait);
        });

        return setupSCC(graph.getStronglyConnectedComponents(), this._pipe);
    }

    callRecursivePipe(index, config) {
        if (this._pipe.length === index) {
            return config;
        }

        return actionParser(this._pipe[0], config).then(config => {
            return this.callRecursivePipe(index + 1, config);
        });
    }

    build() {
        const chain = this.buildChainOfDeep();
        return this.callRecursivePipe(0);
    }
}

module.exports = StarMap;