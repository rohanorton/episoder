assert = require('assert')
urlBuilder = require('../src/urlBuilder.js').default

describe 'urlBuilder', ->

    it 'constructs a url string from show options', ->
        actual = urlBuilder({ show: 'Parks and Recreation', season: 1, episode: 4 })
        expected = 'https://api-v2launch.trakt.tv/shows/parks-and-recreation/seasons/1/episodes/4'
        assert.equal(actual, expected)
