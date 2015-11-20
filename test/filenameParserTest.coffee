assert = require('assert')
parseFilename = require('../lib/filenameParser').default

describe 'parseFilename', ->

    it "returns object with show in title case", ->
        actual = parseFilename("parks and recreation S01E04.mp4").show
        expected = "Parks and Recreation"
        assert.equal(actual, expected)

    it "returns object with show, season and episode numbers from filename in S##E## form", ->
        filename = "Community S01E04.mp4"
        actual = parseFilename(filename)
        expected = { season: 1, episode: 4, show: 'Community', extension: '.mp4', filename: filename }
        assert.deepEqual(actual, expected)

    it "returns object with show, season and episode numbers from filename in s##e## form", ->
        filename = "community s01e04.mp4"
        actual = parseFilename(filename)
        expected = { season: 1, episode: 4, show: 'Community', extension: '.mp4', filename: filename }
        assert.deepEqual(actual, expected)

    it "returns object with show, season and episode numbers from filename in #x## form", ->
        filename = "community 1x04.mp4"
        actual = parseFilename(filename)
        expected = { season: 1, episode: 4, show: 'Community', extension: '.mp4', filename: filename }
        assert.deepEqual(actual, expected)

    it "returns object with show, season and episode numbers from filename in #-## form", ->
        filename = "community 1-04.mp4"
        actual = parseFilename(filename)
        expected = { season: 1, episode: 4, show: 'Community', extension: '.mp4', filename: filename }
        assert.deepEqual(actual, expected)

    it "returns object with show, season and episode numbers from filename in 'Season # Episode ##' form", ->
        filename = "Community Season 1 Episode 14.mp4"
        actual = parseFilename(filename)
        expected = { season: 1, episode: 14, show: 'Community', extension: '.mp4', filename: filename }
        assert.deepEqual(actual, expected)

    it "returns object with show, season and episode numbers from filename in ### form", ->
        filename = "Community 104.mp4"
        actual = parseFilename(filename)
        expected = { season: 1, episode: 4, show: 'Community', extension: '.mp4', filename: filename }
        assert.deepEqual(actual, expected)

    it "returns object with show, season and episode numbers from filename seperated by dots", ->
        filename = "Parks.And.Recreation.S01E04.mp4"
        actual = parseFilename(filename)
        expected = { season: 1, episode: 4, show: 'Parks and Recreation', extension: '.mp4', filename: filename }
        assert.deepEqual(actual, expected)

    it "returns object with show, season and episode numbers even if there are numbers in the showname", ->
        filename = "30 Rock S01E04.mp4"
        actual = parseFilename(filename)
        expected = { season: 1, episode: 4, show: '30 Rock', extension: '.mp4', filename: filename }
        assert.deepEqual(actual, expected)

    it "returns object with show, season and episode numbers from filename with lots of trailing info", ->
        filename = "Parks and Recreation S01E04.720p.HDTV.X264-DIMENSION.mp4"
        actual = parseFilename(filename)
        expected = { season: 1, episode: 4, show: 'Parks and Recreation', extension: '.mp4', filename: filename }
        assert.deepEqual(actual, expected)

    it "returns object with show, season and episode numbers from filename with trailing characters after showname", ->
        filename = "Parks and Recreation - S01E04.mp4"
        actual = parseFilename(filename)
        expected = { season: 1, episode: 4, show: 'Parks and Recreation', extension: '.mp4', filename: filename }
        assert.deepEqual(actual, expected)

    it "returns object with show, season and episode numbers from filename containing no season, if passed a season number in options", ->
        filename = "Parks and Recreation 04.mp4"
        options = { season: 1 }
        actual = parseFilename(filename, options)
        expected = { season: 1, episode: 4, show: 'Parks and Recreation', extension: '.mp4', filename: filename }
        assert.deepEqual(actual, expected)

    it "returns object with show, season and episode numbers from filename containing no season or show, if passed a season number and show in options", ->
        filename = "04.mp4"
        options = { show: "Parks and Recreation", season: 1 }
        actual = parseFilename(filename, options)
        expected = { season: 1, episode: 4, show: 'Parks and Recreation', extension: '.mp4', filename: filename }
        assert.deepEqual(actual, expected)

    it "overrides filename parsing if provided with details", ->
        filename = "Community S03E10.mp4"
        options = { show: "Parks and Recreation", episode: 4, season: 1 }
        actual = parseFilename(filename, options)
        expected = { season: 1, episode: 4, show: 'Parks and Recreation', extension: '.mp4', filename: filename }
        assert.deepEqual(actual, expected)

    it "throws error when filename doesn't match any patterns", ->
        filename = "this-is-a-really-useless-file-dontcha-think"
        fn = -> parseFilename(filename)
        assert.throws(fn, 'Unable to parse file')
