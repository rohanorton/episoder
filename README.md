Episoder
========

A node.js commandline utility for renaming the files of downloaded TV shows.

This program extracts showname, season and episode infomation from a filename or
from user flags and queries the trakt.tv api to get episode title.

Currently only renames to the form `Community - S01E04 - Social Psychology.mp4`

It should work as a node.js module too, but I haven't really played with it
beyond writing tests.

For example, it is able to rename the following files (amongst others):

```
Community_S01E04.mp4
Community-1x04.mp4
Community.104.mp4
Community - Season 1 Episode 4.mp4
```
  
to:

```
Community - S01E04 - Social Psychology.mp4
```

Installation
------------

Requirements:
- trakt.tv api key (available at http://trakt.tv/api-docs/authentication)
- node.js
- npm (usually installed with node.js)

```bash
git clone https://github.com/rohanorton/episoder.git
cd episoder/
npm install
echo 'module.exports = "your-trakt-api-key-goes-here";' >> config/traktApiKey.js
sudo npm link
```

Eventually I'll get round to registering it as an npm module so that you can
simply install it through that, but until then this method of installation will
have to suffice

Usage
-----

Basic usage:

```bash
episoder community-S01E04-ExampleBlagh.mp4
```

will rename the file `Community - S01E04 - Social Psychology.mp4`.

In true unix fashion it accepts globbed filenames:

```bash
episoder *
```

### Show flag
The `--show` or `-S` flag will set a user defined show. If multiple words,
please use quotation as per the example

Set custom showname:

```bash
episoder --show "parks and recreation" s01e04.avi
```

renames to `Parks and Recreation - S01E04 - Boys Club.avi`

### Season flag
The `--season` or `-s` flag will set a user defined season. 

```bash
episoder --season 1 archer_2009-04.avi
```

renames to `Archer 2009 - S01E04 - Killing Utne`

It will also take words:

```bash
episoder --season specials archer_2009-04.avi
```

renames to `Archer 2009 - Specials E04 - Heart of Archness: Part I.avi`

It will also take words:

```bash
episoder --season specials archer_2009-04.avi
```

renames to `Archer 2009 - Specials E04 - Heart of Archness: Part I.avi`

### Episode flag
The `--episode` or `-e` flag will set a user defined episode. 

```bash
episoder --episode 4 bobs_burgers_s01e99.mp4
```

renames to `Bobs Burgers - S01E04 - Sexy Dance Fighting`

### Offset flag

Sometimes the episode info from a filename doesn't quite match up with what's in
the trakt.tv database. For example, sometimes pilot episodes are referred to as
episode 0 (like in the example) but trakt starts the numbering from 1. If this
is the case we can pass an offset value to correct the output.

Set episode offset:

```bash
episoder --offset=1 twin_peaks-1x00-pilot.mkv
```

Renames to `Twin Peaks - S01E01 - Pilot.mkv`.

Note that although it works for positive numbers without the equality symbol, it
won't work for negative numbers, so it is advised to always use `--offset=`
syntax to prevent weirdness.

### Force flag

The default behaviour of episoder is to avoid overwriting files. If you really
want to overwrite your files, use the `--force` or `-f` flag:

```bash
episoder --force community-s01e04.mp4
```

