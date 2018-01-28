jest.mock('../lib/action-parser');

const StarMap = require('../lib/starmap');
const actionParser = require.requireMock('../lib/action-parser');

describe('Star Map', () => {
    let starMap;
    const fileName = 'test';
    const fakeMap = { file: {}, folder: {} };

    beforeEach(() => {
        starMap = new StarMap(fakeMap);
    });

    it('should add a StarMap parsex correctly with alias', () => {
        const fakeOpts = { 'star': 'file', 'strategy': 'y'}

        starMap.parsex(fileName, fakeOpts);
        expect(starMap._pipe).toHaveProperty('0', {
            file: fileName,
            prop: fakeOpts.star,
            parse: fakeOpts.strategy,
            wait: [],
        });
    });

    it('should add a StarMap constelation correctly', () => {
        const specificWait = 'foo';
        const generalWait = 'bar';
        const fakeStarOne = { star: 'file', strategy: 'y' }
        const fakeStarTwo = { star: 'folder', strategy: 'y', wait: [specificWait] }

        const fakeOpts = {
            'wait': [generalWait],
            'constelation': [
                fakeStarOne, fakeStarTwo
            ]
        }

        starMap.parsex(fileName, fakeOpts);
        expect(starMap._pipe).toHaveProperty('0', {
            file: fileName,
            prop: fakeStarOne.star,
            parse: fakeStarOne.strategy,
            wait: [ generalWait ],
        });

        expect(starMap._pipe).toHaveProperty('1', {
            file: fileName,
            prop: fakeStarTwo.star,
            parse: fakeStarTwo.strategy,
            wait: [ specificWait, generalWait ],
        });
    });

    it('should add a StarMap parsex correctly', () => {
        const fakeOpts = { 'prop': 'file', 'parse': 'y'}

        starMap.add(fileName, fakeOpts);
        expect(starMap._pipe).toHaveProperty('0', Object.assign({
            file: fileName,
            wait: []
        }, fakeOpts));
    });

    it('should add a StarMap multi correctly wout alias', () => {
        const specificWait = 'foo';
        const generalWait = 'bar';
        const fakeStarOne = { prop: 'file', parse: 'y' }
        const fakeStarTwo = { prop: 'folder', parse: 'y', wait: [specificWait] }

        const fakeOpts = {
            'wait': [generalWait],
            'multi': [
                fakeStarOne, fakeStarTwo
            ]
        }

        starMap.add(fileName, fakeOpts);
        expect(starMap._pipe).toHaveProperty('0', {
            file: fileName,
            prop: fakeStarOne.prop,
            parse: fakeStarOne.parse,
            wait: [ generalWait ],
        });

        expect(starMap._pipe).toHaveProperty('1', {
            file: fileName,
            prop: fakeStarTwo.prop,
            parse: fakeStarTwo.parse,
            wait: [ specificWait, generalWait ],
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
        }, , {
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

        actionParser.mockReturnValue(Promise.resolve('hey'));
        starMap._pipe = fakePipe;

        return starMap.build().then(config => {
            expect(actionParser).toHaveBeenCalledTimes(fakePipe.length);
        });
    });
});