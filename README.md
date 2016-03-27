Episoder
========

A node.js commandline utility for renaming the files of downloaded TV shows.

Parses filenames of video files for relevent information and queries the
[Trakt](https://trakt.tv) API to find episode title to construct the new filename
and renames.

Installation
------------

You're going to need node.js for this. If you don't have that, Google how to
install that on your operating system and come back when you're done.

```sh
$ npm install --global episoder
```

This may need to be run as `sudo`.

Usage
-----

```sh
$ episoder community-s01e04.mp4
```

Will rename the file to `Community - S01E04 - Social Psychology.mp4`

It tries to be clever and only rename video files.

Currently it will move files from inside a directory to where you have run the
command.

Show/Episode/Season flags
-------------------------

There are useful `--show`, `--episode`, and `--season` flags, which can be
useful if there is not enough information in the filename to work out what it
is:

```sh
$ episoder --show "Parks and Recreation" --season 1 --episode 4  untitled.mp4
```

Will rename to `Parks and Recreation - S01E04 - Boys Club.avi`.

Other Flags
-----------

There are a few other features that might be useful.

```sh
$ episoder --help
Options:
  --show, -S          Provide show name                                 [string]
  --season, -s        Provide season number                             [number]
  --episode, -e       Provide episode number                            [number]
  --colour            Colour logging                   [boolean] [default: true]
  --verbose, -v       Verbose logging                                  [boolean]
  --quiet             Only log errors                                  [boolean]
  --silent            No logging                                       [boolean]
  --force, -f         Overwrite existing files                         [boolean]
  --recursive, -r     Name files in directory recursively              [boolean]
  --interactive, -i   Prompt for file change                           [boolean]
  --backup            Create backup of file                            [boolean]
  --error-on-missing  Fail if any source file missing                  [boolean]
  --version, -V       Show version number                              [boolean]
  --help, -h          Show help                                        [boolean]

```
