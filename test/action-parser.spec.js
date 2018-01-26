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
        const parser = func => func(prop);

        return actionParser({ file, prop, track: true, parser}).then(config => {
            expect(config).toEqual({ [prop]: originalFunc(prop) });
        });
    });

    it('should parsex correclty total dir', () => {
        const file = `${__dirname}/__mocks__/`;
        const prop = 'test';

        return actionParser({ file, prop }).then(config => {
            expect(config).toEqual({
                [prop]: {
                    foo: { bar: originalBar },
                    file: originalFunc
                }
            });
        });
    });
});