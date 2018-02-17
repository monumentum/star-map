const Promise = require('bluebird');
const { basename, join } = require('path');
const { merge, set, get, cloneDeep, last } = require('lodash');

const { readdirAsync, lstatAsync } = Promise.promisifyAll(require('fs'));

const validRegExp = (base, regex) => base.match(new RegExp(regex));
const wrap = val => val;

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

const mapDirToProp = (file, prop, parser, opts, config) =>
    readdirAsync(file).map(subitem => {
        const subprop = `${prop}.${basename(subitem, '.js')}`;
        return parsex(join(file, subitem), subprop, parser, opts, config);
    }, { concurrency: 20 }).reduce((a,c) => merge(a,c));


const parsex = (file, prop, parser, opts, config) => {
    const clonedConfig = cloneDeep(config);

    if (typeof file === 'string' && !file.match(process.cwd())) {
        file = join(process.cwd(), file);
    }

    return lstatAsync(file)
        .then(item => {
            if (!item.isFile()) {
                return mapDirToProp(file, prop, parser, opts, clonedConfig);
            }

            if (opts.skip && validRegExp(file, opts.skip)
                || opts.only && !validRegExp(file, opts.only)) {
                return {}
            };

            const propItem = basename(file, '.js');
            if (opts.only && propItem === last(prop.split('.'))) {
                prop = prop.replace('.' + propItem, '');
            }

            return mapItemToProp(file, prop, parser, clonedConfig);
        }).catch(err => {
            if (opts.onFalsy && !file) {
                file = opts.onFalsy;
                parser = wrap;
            }

            return mapItemToProp(file, prop, parser, clonedConfig)
        }).then(merge.bind(null, clonedConfig));
}

const actionParser = ({ file, prop, parser, opts = {} }, config) =>
    parsex(
        normalizeEntry(file, config),
        normalizeEntry(prop, config),
        normalizeEntry(parser, config),
        {
            skip: normalizeEntry(opts.skip, config),
            only: normalizeEntry(opts.only, config),
            onFalsy: normalizeEntry(opts.onFalsy, config),
        },
        config
    );

module.exports = actionParser;