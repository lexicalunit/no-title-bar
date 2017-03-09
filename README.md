# No Title Bar

[![apm package][apm-ver-link]][releases]
[![][dl-badge]][apm-pkg-link]
[![][mit-badge]][mit]

> **NOTE:** Limited to systems that support Custom Title Bar, meaning MacOS.

Hides the Atom title bar on systems that support it. Make sure to enable the **Custom Title Bar**
in your **Core** Atom settings. See below for details.

![screenshot][main-screenshot]

## How do I drag the window now?

You can move the window by grabbing and dragging "empty" space.

![screenshot][empty-screenshot]

Rearranging tabs or items in `tree-view` by drag-and-drop should work as normal. Selecting text
anywhere within the editor should also work as normal. If not, please [open an issue][issues]!

> **NOTE:** The beta version 1.16.0 of Atom introduced the _Hidden Title Bar_ option.
>           This package supports this mode by adding draggability to empty spaces.
>           Enabling the Hidden Title Bar option hides the MacOS system window buttons;
>           for that reason I personally prefer the Custom Title Bar over the Hidden Title Bar.

## Enabling a Custom Title Bar

The Custom Title Bar setting was first made available in the Atom beta for version 1.11.0.
The feature was then expanded in the Atom beta for version 1.16.0. Depending on your version of
Atom, there are slightly different ways to enable a Custom Title Bar.

If you are using **Atom 1.16.0 or newer**, set `core.titleBar` to `"custom"` in your `config.cson`
to enable the Custom Title Bar mode. This feature is also available in your Core settings as
_Title Bar_.

For versions **older than 1.16.0**, set `core.useCustomTitleBar` to `true` in your `config.cson` to
enable the Custom Title Bar mode. This feature is also available in your Core settings as
_Use Custom Title Bar_.

## References

- [More title-bar options (macOS) `#13616`](https://github.com/atom/atom/pull/13616)
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
[issues]:           https://github.com/lexicalunit/no-title-bar/issues
[empty-screenshot]: https://cloud.githubusercontent.com/assets/1903876/21533874/dad294de-cd24-11e6-9fee-6e4809cc86a7.png
[main-screenshot]: https://cloud.githubusercontent.com/assets/1903876/18184202/8f52cd40-705d-11e6-95b0-1766fc741a16.png
