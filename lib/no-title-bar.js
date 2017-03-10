/** @babel */

import { CompositeDisposable } from 'atom'

var disposables = null
var fullscreen = null
var titleBarHeight = null
var tabBarHeight = null

function setMarginTopForElement(selector, marginTop) {
  let element = document.querySelector(selector)
  if (element) {
    element.style.marginTop = marginTop
  }
}

function setMarginTopForPanel(selector, marginTop) {
  // Only need to set marginTop for `custom` and `custom-inset` title bars.
  setMarginTopForElement(`.platform-darwin.custom-title-bar ${selector}`, marginTop)
  setMarginTopForElement(`.platform-darwin.custom-inset-title-bar ${selector}`, marginTop)
}

function getTitleBarHeight() {
  var height = "0"
  for (let panel of atom.workspace.getHeaderPanels()) {
    let element = panel.item.element
    if (element && element.className == "title-bar") {
      return window.getComputedStyle(element).height
    }
  }
  return height
}

function getTabBarHeight() {
  let tabBar = document.querySelector(".tab-bar")
  if (tabBar) {
    return window.getComputedStyle(tabBar).height
  }
  return "0"
}

function panelMarginTop() {
  return Math.max(
    parseFloat(tabBarHeight.replace("px", "")),
    parseFloat(titleBarHeight.replace("px", "")),
  ) + "px"
}

function setPanelMargins() {
  let marginTop = fullscreen ? "0" : panelMarginTop()
  setMarginTopForPanel("atom-panel-container.left", marginTop)
  setMarginTopForPanel("atom-panel-container.right", marginTop)
}

function togglePanelMargins() {
  fullscreen = !fullscreen
  setPanelMargins()
}

function __guard__ (value, transform) {
  return (typeof value !== "undefined" && value !== null) ? transform(value) : undefined
}

export function activate () {
  fullscreen = atom.applicationDelegate.isWindowFullScreen()
  disposables = new CompositeDisposable()
  disposables.add(atom.themes.onDidChangeActiveThemes(() => {
    titleBarHeight = getTitleBarHeight()
    tabBarHeight = getTabBarHeight()
    setPanelMargins()
  }))
  disposables.add(atom.commands.add(atom.window, 'window:toggle-full-screen', togglePanelMargins))
}

export function deactivate () {
    __guard__(disposables, x1 => x1.dispose())
    disposables = null
}
