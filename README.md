Episoder
========

A program for renaming the files of downloaded tv shows.

It doesn't do anything yet, but eventually...

- It should extract episode information from the filename
- If not enough information in filenames it should request user input
- It should use the trakt.tv api to get episode titles.
- Finally it should rename the original file with the information.
- It should also be possible to provide args to set global variables such as
show name and season.
- It should be able to get episode infomation for filenames in the following
forms:
  - Community S01E04.mp4
  - Community 1x04.mp4
  - Community 104.mp4
  - Community Season 1 Episode 4.mp4
- And rename them to:
  - Community - S01E04 - Social Psychology.mp4


You will need to get your own Trakt API key from their website. And create a
traktApiKey.js file in the config folder containing the following:

`module.exports = "your-trakt-api-key-goes-here";`

