const Promise = require('bluebird');
const actionParser = require('../lib/action-parser');
const fs = require.requireMock('fs');

const originalFunc = require('./__mocks__/file.js');
const originalBar = require('./__mocks__/foo/bar.js');

const { clone, last } = require('lodash');

const BASE_CONFIG = {
    error: null,
    data: {},
};

describe('Action Parser', () => {
    const mockWith = kind => function () {
        const cb = last(arguments);
        const value = response[kind];
        cb(value.error, value.data);
    }

    const createResponse = () => ({
        lstat: clone(BASE_CONFIG),
        readdir: clone(BASE_CONFIG),
        readFile: clone(BASE_CONFIG),
    });

    let response = createResponse();

    beforeEach(() => {
        fs.lstat.mockImplementation(mockWith('lstat'));
        fs.readdir.mockImplementation(mockWith('readdir'));
        fs.readFile.mockImplementation(mockWith('readFile'));
    });

    afterEach(() => {
        jest.clearAllMocks();
        response = createResponse();
    });

    it('should parsex correctly only an item', () => {
        const file = `${__dirname}/__mocks__/file.js`;
        const prop = 'test';
        const parser = path => require(path)(prop);

        return actionParser({ file, prop, parser}).then(config => {
            expect(config).toEqual({ [prop]: originalFunc(prop) });
        });
    });

    it('should parsex correctly only an item', () => {
        const file = `${__dirname}/__mocks__/file.js`;
        const prop = 'test';

        return actionParser({ file, prop }).then(config => {
            expect(config).toEqual({ [prop]: file });
        });
    });

    it('should parsex correctly only configured item', () => {
        const file = `${__dirname}/__mocks__/file.js`;
        const prop = 'test';
        const fakeConfig = { test: 1 };
        const parser = (path, config) => require(path)(prop) + config.test;

        return actionParser({ file, prop, parser }, fakeConfig).then(config => {
            expect(config).toEqual({ [prop]: originalFunc(prop) + fakeConfig.test });
        });
    });

    it('should parsex correclty total dir', () => {
        const file = `${__dirname}/__mocks__/`;
        const prop = 'test';

        return actionParser({ file, prop, parser: require }).then(config => {
            expect(config).toEqual({
                [prop]: {
                    foo: { bar: originalBar },
                    file: originalFunc
                }
            });
        });
    });

    it('should parsex correclty total dir with skip', () => {
        const file = `${__dirname}/__mocks__/`;
        const prop = 'test';

        return actionParser({ file, prop, skip: 'file.js', parser: require }).then(config => {
            expect(config).toEqual({
                [prop]: {
                    foo: { bar: originalBar },
                }
            });
        });
    });

    it('should parsex correclty with > alias', () => {
        const file = `${__dirname}/__mocks__/`;
        const prop = 'test';
        const skip = 'foo'
        const fakeConfig = {
            file, prop, skip
        };

        return actionParser({ file: '> file', prop: '>prop', skip: '>  skip', parser: require }, fakeConfig).then(config => {
            expect(config).toEqual({
                [prop]: {
                    file: originalFunc
                }
            });
        });
    });

    it('should parsex correclty with > alias that isn`t a file', () => {
        const file = [ 1, 2 ];
        const prop = 'test';
        const parser = items => items.map(n => n + 1);

        return actionParser({ file, prop, parser }).then(config => {
            expect(config).toEqual({
                [prop]: [ 2, 3 ]
            });
        });
    });
});