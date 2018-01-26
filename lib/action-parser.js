const Promise = require('bluebird');
const { basename } = require('path');
const { merge, set } = require('lodash');

const { readdirAsync, lstatAsync } = Promise.promisifyAll(require('fs'));

const mapItemToProp = (file, prop, parser, config) => {
    const mappedItem = {};
    const item = require(file);
    set(mappedItem, prop, parser ? parser(item, config) : item);
    return mappedItem;
}

const mapDirToProp = (file, prop, parser, config) =>
    readdirAsync(file).map(subitem => {
        const subprop = `${prop}.${basename(subitem, '.js')}`;
        return parsex(`${file}/${subitem}`, subprop, parser, config);
    }, { concurrency: 20 }).reduce((a,c) => merge(a,c));

const parsex = (file, prop, parser, config) =>
    lstatAsync(file)
        .then(item => {
            if (item.isFile()) {
                return mapItemToProp(file, prop, parser, config);
            }

            return mapDirToProp(file, prop, parser, config);
        });

const actionParser = ({ file, prop, parser }, config) =>
    parsex(file, prop, parser, config);

module.exports = actionParser;