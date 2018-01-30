const Promise = require('bluebird');
const { basename } = require('path');
const { merge, set, get } = require('lodash');

const { readdirAsync, lstatAsync } = Promise.promisifyAll(require('fs'));

const normalizeEntry = (entry, config) => {
    if (typeof entry === 'string' && entry[0] === '>') {
        return get(config, entry.replace('>', '').trim());
    };

    return entry;
}
const mapItemToProp = (item, prop, parser, config) => {
    const mappedItem = {};
    set(mappedItem, prop, parser ? parser(item, config) : item);
    return mappedItem;
}

const mapDirToProp = (file, prop, parser, skip, config) => {
    let reader = readdirAsync(file);

    if (skip) {
        reader = readdirAsync(file).filter(subitem => !subitem.match(new RegExp(skip)));
    };

    return reader.map(subitem => {
        const subprop = `${prop}.${basename(subitem, '.js')}`;
        return parsex(`${file}/${subitem}`, subprop, parser, skip, config);
    }, { concurrency: 20 }).reduce((a,c) => merge(a,c));
}

const parsex = (file, prop, parser, skip, config) => {
    if (typeof file === 'string' && !file.match(process.cwd())) {
        file = process.cwd() + file;
    }

    return lstatAsync(file)
        .then(item => {
            if (item.isFile()) {
                return mapItemToProp(file, prop, parser, config);
            }

            return mapDirToProp(file, prop, parser, skip, config);
        }).catch(err => {
            return mapItemToProp(file, prop, parser, config)
        });
}

const actionParser = ({ file, prop, parser, skip }, config) =>
    parsex(
        normalizeEntry(file, config),
        normalizeEntry(prop, config),
        normalizeEntry(parser, config),
        normalizeEntry(skip, config),
        config
    );

module.exports = actionParser;