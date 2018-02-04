jest.mock('../lib/action-parser');

const StarMap = require('../lib/starmap');
const actionParser = require.requireMock('../lib/action-parser');

const { sortBy, compact } = require('lodash');

describe('Star Map', () => {
    let starMap;
    const fileName = 'test';
    const fakeMap = { file: {}, folder: {} };
    const opts = { skip: undefined, only: undefined }
    const specificWait = 'foo';
    const generalWait = 'bar';
    const fakeStar = { prop: 'file', parser: 'y' }
    const fakeStarTwo = { prop: 'folder', parser: 'y', wait: [specificWait] }
    const fakeStarAlias = { 'star': 'file', 'strategy': 'y'}

    const fakeMultiOpts = {
        'wait': [generalWait],
        'multi': [
            fakeStar, fakeStarTwo
        ]
    }

    beforeEach(() => {
        starMap = new StarMap(fakeMap);
    });

    it('should back a chain from add/parsex', () => {
        let holder;

        [ fakeStarAlias, fakeStar, fakeMultiOpts ].forEach(opts => {
            holder = starMap.parsex(fileName, opts);
            expect(holder.parsex).toBeDefined();
            expect(holder.add).toBeDefined();
        });
    });

    it('should add a StarMap parsex correctly with alias', () => {
        const fakeOpts = { 'star': 'file', 'strategy': 'y'}

        starMap.parsex(fileName, fakeOpts);
        expect(starMap._pipe).toHaveProperty('0', {
            file: fileName,
            prop: fakeOpts.star,
            parser: fakeOpts.strategy,
            wait: [],
            opts
        });
    });

    it('should add a StarMap constelation correctly', () => {
        const specificWait = 'foo';
        const generalWait = 'bar';
        const fakeStar = { star: 'file', strategy: 'y' }
        const fakeStarTwo = { star: 'folder', strategy: 'y', wait: [specificWait] }

        const fakeOpts = {
            'wait': [generalWait],
            'constelation': [
                fakeStar, fakeStarTwo
            ]
        }

        starMap.parsex(fileName, fakeOpts);
        expect(starMap._pipe).toHaveProperty('0', {
            file: fileName,
            prop: fakeStar.star,
            parser: fakeStar.strategy,
            wait: [ generalWait ],
            opts,
        });

        expect(starMap._pipe).toHaveProperty('1', {
            file: fileName,
            prop: fakeStarTwo.star,
            parser: fakeStarTwo.strategy,
            wait: [ specificWait, generalWait ],
            opts,
        });
    });

    it('should add a StarMap parsex correctly', () => {
        const fakeOpts = { 'prop': 'file', 'parser': 'y'}

        starMap.add(fileName, fakeOpts);
        expect(starMap._pipe).toHaveProperty('0', Object.assign({
            file: fileName,
            wait: [],
            opts
        }, fakeOpts));
    });

    it('should run method exec correctly', () => {
        const fakeResponse = 'FAKE';
        const callback = 'callback';

        starMap.exec(callback);

        expect(starMap._pipe[0]).toHaveProperty('prop');
        expect(starMap._pipe[0]).toHaveProperty('wait', []);
        expect(starMap._pipe[0]).toHaveProperty('fn', callback);
    });

    it('should add a StarMap multi correctly wout alias', () => {
        starMap.add(fileName, fakeMultiOpts);
        expect(starMap._pipe).toHaveProperty('0', {
            file: fileName,
            prop: fakeStar.prop,
            parser: fakeStar.parser,
            wait: [ generalWait ],
            opts
        });

        expect(starMap._pipe).toHaveProperty('1', {
            file: fileName,
            prop: fakeStarTwo.prop,
            parser: fakeStarTwo.parser,
            wait: [ specificWait, generalWait ],
            opts
        });
    });

    it('should throw and error if miss prop or star', () => {
        const toThrowParsex = () => starMap.parsex(fileName, {});
        const toThrowAdd = () => starMap.add(fileName, {});

        expect(toThrowParsex).toThrow();
        expect(toThrowAdd).toThrow();
    });

    it('should throw and error if miss file name', () => {
        const wrongOpts = { 'prop': 'x', 'track': 'y', 'parse': 'y' };
        const toThrowParsex = () => starMap.parsex(fileName, wrongOpts);

        expect(toThrowParsex).toThrow();
    });

    it('should throw and error if miss file name', () => {
        const toThrowParsex = () => starMap.parsex();
        const toThrowAdd = () => starMap.add();

        expect(toThrowParsex).toThrow();
        expect(toThrowAdd).toThrow();
    });

    it('should throw and error if file name isnt string', () => {
        const toThrowParsex = () => starMap.parsex(1);
        const toThrowAdd = () => starMap.add({});

        expect(toThrowParsex).toThrow();
        expect(toThrowAdd).toThrow();
    });

    it('should exec build method correctly', () => {
        const mutateSpy = jest.fn();
        const fakeConfig = 'FakeHey';
        const fakePipe = [{
            prop: 'foo',
            wait: []
        }, {
            prop: 'zoo',
            wait: []
        }, {
            prop: 'too',
            wait: []
        }, {
            prop: 'bar',
            wait: [ 'foo' ]
        },{
            prop: 'JDJI213',
            wait: [],
            fn: mutateSpy
        },{
            prop: 'oo',
            wait: [ 'zoo', 'too' ]
        }, {
            prop: 'fuu',
            wait: [ 'foo' ]
        }, {
            prop: 'foobar',
            wait: [ 'bar' ]
        }, {
            prop: 'truzar',
            wait: [ 'zoo', 'bar' ]
        }];


        mutateSpy.mockReturnValue(Promise.resolve());
        actionParser.mockReturnValue(Promise.resolve(fakeConfig));
        starMap._pipe = fakePipe;

        return starMap.build().then(config => {
            expect(mutateSpy).toHaveBeenCalledTimes(1)
            expect(actionParser).toHaveBeenCalledTimes(fakePipe.length - 1);
        });
    });
});