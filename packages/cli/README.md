ensemble-cli
=================

Ensemble CLI for managing apps


[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/ensemble-cli.svg)](https://npmjs.org/package/ensemble-cli)
[![Downloads/week](https://img.shields.io/npm/dw/ensemble-cli.svg)](https://npmjs.org/package/ensemble-cli)


<!-- toc -->
* [Usage](#usage)
* [Commands](#commands)
<!-- tocstop -->
# Usage
<!-- usage -->
```sh-session
$ npm install -g @ensembleui/cli
$ ensemble COMMAND
running command...
$ ensemble (--version)
@ensembleui/cli/0.0.4 darwin-arm64 node-v18.18.2
$ ensemble --help [COMMAND]
USAGE
  $ ensemble COMMAND
...
```
<!-- usagestop -->
# Commands
<!-- commands -->
* [`ensemble help [COMMAND]`](#ensemble-help-command)
* [`ensemble plugins`](#ensemble-plugins)
* [`ensemble plugins add PLUGIN`](#ensemble-plugins-add-plugin)
* [`ensemble plugins:inspect PLUGIN...`](#ensemble-pluginsinspect-plugin)
* [`ensemble plugins install PLUGIN`](#ensemble-plugins-install-plugin)
* [`ensemble plugins link PATH`](#ensemble-plugins-link-path)
* [`ensemble plugins remove [PLUGIN]`](#ensemble-plugins-remove-plugin)
* [`ensemble plugins reset`](#ensemble-plugins-reset)
* [`ensemble plugins uninstall [PLUGIN]`](#ensemble-plugins-uninstall-plugin)
* [`ensemble plugins unlink [PLUGIN]`](#ensemble-plugins-unlink-plugin)
* [`ensemble plugins update`](#ensemble-plugins-update)

## `ensemble help [COMMAND]`

Display help for ensemble.

```
USAGE
  $ ensemble help [COMMAND...] [-n]

ARGUMENTS
  COMMAND...  Command to show help for.

FLAGS
  -n, --nested-commands  Include all nested commands in the output.

DESCRIPTION
  Display help for ensemble.
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v6.2.16/src/commands/help.ts)_

## `ensemble plugins`

List installed plugins.

```
USAGE
  $ ensemble plugins [--json] [--core]

FLAGS
  --core  Show core plugins.

GLOBAL FLAGS
  --json  Format output as json.

DESCRIPTION
  List installed plugins.

EXAMPLES
  $ ensemble plugins
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v5.4.15/src/commands/plugins/index.ts)_

## `ensemble plugins add PLUGIN`

Installs a plugin into ensemble.

```
USAGE
  $ ensemble plugins add PLUGIN... [--json] [-f] [-h] [-s | -v]

ARGUMENTS
  PLUGIN...  Plugin to install.

FLAGS
  -f, --force    Force npm to fetch remote resources even if a local copy exists on disk.
  -h, --help     Show CLI help.
  -s, --silent   Silences npm output.
  -v, --verbose  Show verbose npm output.

GLOBAL FLAGS
  --json  Format output as json.

DESCRIPTION
  Installs a plugin into ensemble.

  Uses npm to install plugins.

  Installation of a user-installed plugin will override a core plugin.

  Use the ENSEMBLE_NPM_LOG_LEVEL environment variable to set the npm loglevel.
  Use the ENSEMBLE_NPM_REGISTRY environment variable to set the npm registry.

ALIASES
  $ ensemble plugins add

EXAMPLES
  Install a plugin from npm registry.

    $ ensemble plugins add myplugin

  Install a plugin from a github url.

    $ ensemble plugins add https://github.com/someuser/someplugin

  Install a plugin from a github slug.

    $ ensemble plugins add someuser/someplugin
```

## `ensemble plugins:inspect PLUGIN...`

Displays installation properties of a plugin.

```
USAGE
  $ ensemble plugins inspect PLUGIN...

ARGUMENTS
  PLUGIN...  [default: .] Plugin to inspect.

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

GLOBAL FLAGS
  --json  Format output as json.

DESCRIPTION
  Displays installation properties of a plugin.

EXAMPLES
  $ ensemble plugins inspect myplugin
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v5.4.15/src/commands/plugins/inspect.ts)_

## `ensemble plugins install PLUGIN`

Installs a plugin into ensemble.

```
USAGE
  $ ensemble plugins install PLUGIN... [--json] [-f] [-h] [-s | -v]

ARGUMENTS
  PLUGIN...  Plugin to install.

FLAGS
  -f, --force    Force npm to fetch remote resources even if a local copy exists on disk.
  -h, --help     Show CLI help.
  -s, --silent   Silences npm output.
  -v, --verbose  Show verbose npm output.

GLOBAL FLAGS
  --json  Format output as json.

DESCRIPTION
  Installs a plugin into ensemble.

  Uses npm to install plugins.

  Installation of a user-installed plugin will override a core plugin.

  Use the ENSEMBLE_NPM_LOG_LEVEL environment variable to set the npm loglevel.
  Use the ENSEMBLE_NPM_REGISTRY environment variable to set the npm registry.

ALIASES
  $ ensemble plugins add

EXAMPLES
  Install a plugin from npm registry.

    $ ensemble plugins install myplugin

  Install a plugin from a github url.

    $ ensemble plugins install https://github.com/someuser/someplugin

  Install a plugin from a github slug.

    $ ensemble plugins install someuser/someplugin
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v5.4.15/src/commands/plugins/install.ts)_

## `ensemble plugins link PATH`

Links a plugin into the CLI for development.

```
USAGE
  $ ensemble plugins link PATH [-h] [--install] [-v]

ARGUMENTS
  PATH  [default: .] path to plugin

FLAGS
  -h, --help          Show CLI help.
  -v, --verbose
      --[no-]install  Install dependencies after linking the plugin.

DESCRIPTION
  Links a plugin into the CLI for development.

  Installation of a linked plugin will override a user-installed or core plugin.

  e.g. If you have a user-installed or core plugin that has a 'hello' command, installing a linked plugin with a 'hello'
  command will override the user-installed or core plugin implementation. This is useful for development work.


EXAMPLES
  $ ensemble plugins link myplugin
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v5.4.15/src/commands/plugins/link.ts)_

## `ensemble plugins remove [PLUGIN]`

Removes a plugin from the CLI.

```
USAGE
  $ ensemble plugins remove [PLUGIN...] [-h] [-v]

ARGUMENTS
  PLUGIN...  plugin to uninstall

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Removes a plugin from the CLI.

ALIASES
  $ ensemble plugins unlink
  $ ensemble plugins remove

EXAMPLES
  $ ensemble plugins remove myplugin
```

## `ensemble plugins reset`

Remove all user-installed and linked plugins.

```
USAGE
  $ ensemble plugins reset [--hard] [--reinstall]

FLAGS
  --hard       Delete node_modules and package manager related files in addition to uninstalling plugins.
  --reinstall  Reinstall all plugins after uninstalling.
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v5.4.15/src/commands/plugins/reset.ts)_

## `ensemble plugins uninstall [PLUGIN]`

Removes a plugin from the CLI.

```
USAGE
  $ ensemble plugins uninstall [PLUGIN...] [-h] [-v]

ARGUMENTS
  PLUGIN...  plugin to uninstall

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Removes a plugin from the CLI.

ALIASES
  $ ensemble plugins unlink
  $ ensemble plugins remove

EXAMPLES
  $ ensemble plugins uninstall myplugin
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v5.4.15/src/commands/plugins/uninstall.ts)_

## `ensemble plugins unlink [PLUGIN]`

Removes a plugin from the CLI.

```
USAGE
  $ ensemble plugins unlink [PLUGIN...] [-h] [-v]

ARGUMENTS
  PLUGIN...  plugin to uninstall

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Removes a plugin from the CLI.

ALIASES
  $ ensemble plugins unlink
  $ ensemble plugins remove

EXAMPLES
  $ ensemble plugins unlink myplugin
```

## `ensemble plugins update`

Update installed plugins.

```
USAGE
  $ ensemble plugins update [-h] [-v]

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Update installed plugins.
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v5.4.15/src/commands/plugins/update.ts)_
<!-- commandsstop -->
