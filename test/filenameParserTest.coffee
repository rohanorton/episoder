assert = require('assert')
filenameParser = require('../src/filenameParser').default

describe 'filenameParser', ->

    it "returns object with show in title case", ->
        actual = filenameParser("parks and recreation S01E04.mp4").show
        expected = "Parks and Recreation"
        assert.equal(actual, expected)

    it "parses S##E## form", ->
        filename = "Community S01E04.mp4"
        actual = filenameParser(filename)
        expected = { season: 1, episode: 4, show: 'Community', extension: '.mp4', filename: filename }
        assert.deepEqual(actual, expected)

    it "parses s##e## form", ->
        filename = "community s01e04.mp4"
        actual = filenameParser(filename)
        expected = { season: 1, episode: 4, show: 'Community', extension: '.mp4', filename: filename }
        assert.deepEqual(actual, expected)

    it "parses #x## form", ->
        filename = "community 1x04.mp4"
        actual = filenameParser(filename)
        expected = { season: 1, episode: 4, show: 'Community', extension: '.mp4', filename: filename }
        assert.deepEqual(actual, expected)

    it "parses #-## form", ->
        filename = "community 1-04.mp4"
        actual = filenameParser(filename)
        expected = { season: 1, episode: 4, show: 'Community', extension: '.mp4', filename: filename }
        assert.deepEqual(actual, expected)

    it "parses 'Season # Episode ##' form", ->
        filename = "Community Season 1 Episode 14.mp4"
        actual = filenameParser(filename)
        expected = { season: 1, episode: 14, show: 'Community', extension: '.mp4', filename: filename }
        assert.deepEqual(actual, expected)

    it "parses ### form", ->
        filename = "Community 104.mp4"
        actual = filenameParser(filename)
        expected = { season: 1, episode: 4, show: 'Community', extension: '.mp4', filename: filename }
        assert.deepEqual(actual, expected)

    it "allows 0 for episode", ->
        filename = "community s01e00.mp4"
        actual = filenameParser(filename)
        expected = { season: 1, episode: 0, show: 'Community', extension: '.mp4', filename: filename }
        assert.deepEqual(actual, expected)

    it "allows 0 for season", ->
        filename = "community s00e04.mp4"
        actual = filenameParser(filename)
        expected = { season: 0, episode: 4, show: 'Community', extension: '.mp4', filename: filename }
        assert.deepEqual(actual, expected)

    it "parses filename seperated by dots", ->
        filename = "Parks.And.Recreation.S01E04.mp4"
        actual = filenameParser(filename)
        expected = { season: 1, episode: 4, show: 'Parks and Recreation', extension: '.mp4', filename: filename }
        assert.deepEqual(actual, expected)

    it "parses filename with numbers in the showname", ->
        filename = "30 Rock S01E04.mp4"
        actual = filenameParser(filename)
        expected = { season: 1, episode: 4, show: '30 Rock', extension: '.mp4', filename: filename }
        assert.deepEqual(actual, expected)

    it "parses filename with trailing info", ->
        filename = "Parks and Recreation S01E04.720p.HDTV.X264-DIMENSION.mp4"
        actual = filenameParser(filename)
        expected = { season: 1, episode: 4, show: 'Parks and Recreation', extension: '.mp4', filename: filename }
        assert.deepEqual(actual, expected)

    it "parses filename with trailing spaces after showname", ->
        filename = "Parks and Recreation   S01E04.mp4"
        actual = filenameParser(filename)
        expected = { season: 1, episode: 4, show: 'Parks and Recreation', extension: '.mp4', filename: filename }
        assert.deepEqual(actual, expected)

    it "parses filename with trailing tildas after showname", ->
        filename = "Parks and Recreation~~~S01E04.mp4"
        actual = filenameParser(filename)
        expected = { season: 1, episode: 4, show: 'Parks and Recreation', extension: '.mp4', filename: filename }
        assert.deepEqual(actual, expected)

    it "parses filename with trailing underscores after showname", ->
        filename = "Parks and Recreation___S01E04.mp4"
        actual = filenameParser(filename)
        expected = { season: 1, episode: 4, show: 'Parks and Recreation', extension: '.mp4', filename: filename }
        assert.deepEqual(actual, expected)

    it "parses filename with trailing hyphens after showname", ->
        filename = "Parks and Recreation---S01E04.mp4"
        actual = filenameParser(filename)
        expected = { season: 1, episode: 4, show: 'Parks and Recreation', extension: '.mp4', filename: filename }
        assert.deepEqual(actual, expected)

    it "parses filename with trailing dots after showname", ->
        filename = "Parks and Recreation... S01E04.mp4"
        actual = filenameParser(filename)
        expected = { season: 1, episode: 4, show: 'Parks and Recreation', extension: '.mp4', filename: filename }
        assert.deepEqual(actual, expected)

    it "parses filename with mix of trailing characters after showname", ->
        filename = "Parks and Recreation-~._ S01E04.mp4"
        actual = filenameParser(filename)
        expected = { season: 1, episode: 4, show: 'Parks and Recreation', extension: '.mp4', filename: filename }
        assert.deepEqual(actual, expected)

    it "parses filename containing no season when season number in options", ->
        filename = "Parks and Recreation 04.mp4"
        options = { season: 1 }
        actual = filenameParser(filename, options)
        expected = { season: 1, episode: 4, show: 'Parks and Recreation', extension: '.mp4', filename: filename }
        assert.deepEqual(actual, expected)

    it "parses filename containing no season or show when season number and show in options", ->
        filename = "04.mp4"
        options = { show: "Parks and Recreation", season: 1 }
        actual = filenameParser(filename, options)
        expected = { season: 1, episode: 4, show: 'Parks and Recreation', extension: '.mp4', filename: filename }
        assert.deepEqual(actual, expected)

    it "provide defaults in options", ->
        filename = "Community S03E10.mp4"
        options = { show: "Parks and Recreation", episode: 4, season: 1 }
        actual = filenameParser(filename, options)
        expected = { season: 1, episode: 4, show: 'Parks and Recreation', extension: '.mp4', filename: filename }
        assert.deepEqual(actual, expected)

    it "throws error if parsing fails", ->
        filename = "this-is-a-really-useless-file-dontcha-think"
        fn = -> filenameParser(filename)
        assert.throws(fn, /Unable to parse file/)

    it "throws error if show is empty string", ->
        filename = "s01e03.mp4"
        fn = -> filenameParser(filename)
        assert.throws(fn, /Unable to parse file/)
