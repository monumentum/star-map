const Promise = require('bluebird');
const { basename } = require('path');
const { merge, set } = require('lodash');

const { readdirAsync, lstatAsync } = Promise.promisifyAll(require('fs'));

const mapItemToProp = (file, prop, parser) => {
    const mappedItem = {};
    const item = require(file);
    set(mappedItem, prop, parser ? parser(item) : item);
    return mappedItem;
}

const mapDirToProp = (file, prop, parser) =>
    readdirAsync(file).map(subitem => {
        const subprop = `${prop}.${basename(subitem, '.js')}`;
        return parsex(`${file}/${subitem}`, subprop, parser);
    }, { concurrency: 20 }).reduce((a,c) => merge(a,c));

const parsex = (file, prop, parser) =>
    lstatAsync(file)
        .then(item => {
            if (item.isFile()) {
                return mapItemToProp(file, prop, parser);
            }

            return mapDirToProp(file, prop, parser);
        });

const actionParser = ({ file, prop, parser }) =>
    parsex(file, prop, parser);

module.exports = actionParser;