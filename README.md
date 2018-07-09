# adr README

This is a small extension for adding new ADR entry to the ADR list in the current workspace.

TODO: what is ADR?

## Features

This extension has one command:

**"adr: Create new entry"**. It asks for the title of the new ADR entry, and generates a new Markdown file with the proposed ADR filename (NNNN-{entry-name-in-lowercase}.md), and giving it a proper index.

The file has a basic Markdown template, the one that was proposed by Michael Nygard (translated to german). The template is fileld with the given entry title, and the current date.

TODO: add animation

## Extension Settings

TODO: extend this with settings?
- folder were the adrs are stored? (default: /doc/adr)
- filename template?
- markdown file content template?

## Known Issues

TODO: Wasn't tested yet without a workspace.

TODO: code is ugly, because I'm not experienced in Typescript, nor in vscode extension programming :)

## Release Notes

### 0.0.1

Initial release