/** @babel */

import {CompositeDisposable} from 'atom'

var hasBeenActive = false
var init = false
var subs = null
var tabBar = null
var tabBarHeight = null

function platformSupported () {
  return document.body.classList.contains('platform-darwin')
}

function disableDrag () {
  tabBar.querySelectorAll('.tab').forEach((tab) => {
    tab.style.display = ''
  })
  tabBar.style.height = ''
}

function enableDrag () {
  tabBar.querySelectorAll('.tab').forEach((tab) => {
    tab.style.display = 'none'
  })
  tabBar.style.height = tabBarHeight
}

function toggleDrag (event) {
  if (event.metaKey) {
    enableDrag()
  } else {
    disableDrag()
  }
}

function __guard__ (value, transform) {
  return (typeof value !== 'undefined' && value !== null)
    ? transform(value)
    : undefined
}

function handleEvents () {
  if (!atom.config.get('no-title-bar.metaKeyMouseDrag')) {
    return
  }

  tabBar = document.querySelector('.tab-bar')
  if (!init) {
    tabBarHeight = window.getComputedStyle(tabBar).height
    tabBar.addEventListener('mouseenter', toggleDrag)
    tabBar.addEventListener('mousemove', toggleDrag)
    tabBar.addEventListener('mouseleave', disableDrag)
    init = true
  }
  hasBeenActive = true
}

function removeEvents () {
  if (init) {
    tabBar.removeEventListener('mouseenter', toggleDrag)
    tabBar.removeEventListener('mousemove', toggleDrag)
    tabBar.removeEventListener('mouseleave', disableDrag)
    init = false
  }
}

export function activate (state) {
  if (!platformSupported()) {
    return
  }

  subs = new CompositeDisposable()
  subs.add(atom.themes.onDidChangeActiveThemes(handleEvents))
  subs.add(atom.config.observe('no-title-bar.metaKeyMouseDrag', (value) => {
    if (value) {
      if (hasBeenActive) {
        handleEvents()
      }
    } else {
      removeEvents()
    }
  }))

  document.body.classList.add('no-title-bar')

  if (hasBeenActive && atom.config.get('no-title-bar.metaKeyMouseDrag')) {
    handleEvents() // package has been re-activated
  }
}

export function deactivate () {
  if (!platformSupported()) {
    return
  }

  __guard__(subs, x1 => x1.dispose())
  subs = null

  removeEvents()

  document.body.classList.remove('no-title-bar')
}

export const config = {
  'metaKeyMouseDrag': {
    'title': 'Use ⌘ + Mouse on the Tab Bar to drag the Atom window.',
    'type': 'boolean',
    'default': false
  }
}
