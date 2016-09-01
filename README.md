# No Title Bar

[![apm package][apm-ver-link]][releases]
[![][dl-badge]][apm-pkg-link]
[![][mit-badge]][mit]

Hides the Atom title bar on systems that support it. Make sure to enable **Use Custom Title Bar** in your **Core** Atom settings (`core.useCustomTitleBar: true` in your `config.cson`). This setting was first available in Atom Beta version 1.11.0.

![screenshot](https://cloud.githubusercontent.com/assets/1903876/18184202/8f52cd40-705d-11e6-95b0-1766fc741a16.png)

## Limitations

- Limited to systems that support custom title bar, such as Mac OS for example.
- Interferes with the ability to drag tabs.

## References

- [Hide title bar on OS X `#10208`](https://github.com/atom/atom/pull/10208)
- [drag & drop `#3009`](https://github.com/electron/electron/issues/3009)
- [replace OSX window title bar with custom title-bar `#11790`](https://github.com/atom/atom/pull/11790)

---

[MIT][mit] © [lexicalunit][author] et [al][contributors]

[mit]:              http://opensource.org/licenses/MIT
[author]:           http://github.com/lexicalunit
[contributors]:     https://github.com/lexicalunit/no-title-bar/graphs/contributors
[releases]:         https://github.com/lexicalunit/no-title-bar/releases
[mit-badge]:        https://img.shields.io/apm/l/no-title-bar.svg
[apm-pkg-link]:     https://atom.io/packages/no-title-bar
[apm-ver-link]:     https://img.shields.io/apm/v/no-title-bar.svg
[dl-badge]:         http://img.shields.io/apm/dm/no-title-bar.svg
