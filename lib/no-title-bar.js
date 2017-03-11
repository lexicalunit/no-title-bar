/** @babel */

import {CompositeDisposable} from 'atom'

var disposables = null
var hasBeenActive = false
var init = false
var tabBar = null

function disableDrag () {
  tabBar.querySelectorAll('.tab').forEach((tab) => {
    tab.style.webkitAppRegion = 'no-drag'
  })
  tabBar.style.border = 'inherit'
}

function enableDrag () {
  tabBar.querySelectorAll('.tab').forEach((tab) => {
    tab.style.webkitAppRegion = 'drag'
  })
  tabBar.style.border = '1px solid red'
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
  tabBar = document.querySelector('.tab-bar')
  if (tabBar && !init) {
    tabBar.addEventListener('mouseenter', toggleDrag)
    tabBar.addEventListener('mousemove', toggleDrag)
    tabBar.addEventListener('mouseleave', disableDrag)
    init = true
  }
  hasBeenActive = true
}

export function activate () {
  disposables = new CompositeDisposable()
  disposables.add(atom.themes.onDidChangeActiveThemes(handleEvents))
  if (hasBeenActive) handleEvents() // package has been re-activated
}

export function deactivate () {
  __guard__(disposables, x1 => x1.dispose())
  disposables = null

  if (tabBar && init) {
    tabBar.removeEventListener('mouseenter', toggleDrag)
    tabBar.removeEventListener('mousemove', toggleDrag)
    tabBar.removeEventListener('mouseleave', disableDrag)
    init = false
  }
}
