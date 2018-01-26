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
        const fakeOpts = { 'star': 'file', 'constelation': 'y', 'strategy': 'y'}
        const starMap = new StarMap(fakeMap);

        starMap.parsex(fileName, fakeOpts);
        expect(starMap._pipe).toHaveProperty('0', {
            file: fileName,
            prop: fakeOpts.star,
            track: fakeOpts.constelation,
            parse: fakeOpts.strategy,
            wait: [],
        });
    });

    it('should add a StarMap parsex correctly', () => {
        const fakeOpts = { 'prop': 'file', 'track': 'y', 'parse': 'y'}

        starMap.add(fileName, fakeOpts);
        expect(starMap._pipe).toHaveProperty('0', Object.assign({
            file: fileName,
            wait: []
        }, fakeOpts));
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