import { extractLabel } from 'hot-formula-parser';
import DataSource from '../../../shared/components/DataSheet/DataSource';
import * as styles from './styles.css';

var dataSource = null;

export function init(data) {
  dataSource = new DataSource(data, () => {});
}

export function parseShortcodes(html, data) {
  var HiddenDataTables = html.match(/{{([A-Za-z0-9]+)(\?)((([a-zA-Z]+)(=)([0-9,]+)(;))+)}}/g);
  if (HiddenDataTables) {
    for (let i = 0; i < HiddenDataTables.length; i++) {
      let HiddenDataTable = HiddenDataTables[i];
      HiddenDataTable = HiddenDataTable.replace('{{', '');
      HiddenDataTable = HiddenDataTable.replace('}}', '');
      let table = HiddenDataTable.match(/([A-Za-z0-9]+)(\?)/g)[0].replace('?', '');
      if (data[table] !== undefined) {
        html = html.replace(HiddenDataTables[i], createHiddenTable(data[table], HiddenDataTable));
      }
    }
  }

  var tables = html.match(/{{([A-Za-z0-9]+)}}/g);
  if (tables) {
    for (let i = 0; i < tables.length; i++) {
      let table = tables[i];
      table = table.replace('{{', '');
      table = table.replace('}}', '');
      if (data[table] !== undefined) {
        html = html.replace(tables[i], createTable(data[table], table));
      }
    }
  }

  var cells = html.match(/{{([A-Za-z0-9]+)(!)?([$])?([A-Za-z]+)([$])?([0-9]+)}}/g);
  if (cells) {
    for (let i = 0; i < cells.length; i++) {
      let match = cells[i];
      match = match.replace('{{', '');
      match = match.replace('}}', '');
      html = html.replace(cells[i], createCell(data, match));
    }
  }

  return html;
}

export function createCell(data, match) {
  if (dataSource) {
    const [{ index: rowIndex }, { index: colIndex }, sheet] = extractLabel(match);
    const cell = dataSource.getCellValue(sheet, rowIndex, colIndex);
    if (cell) {
      return (
        '<span contenteditable="false" data-shortcode="' + match + '">' + cell.value + '</span>'
      );
    }
  }

  return '{{' + match + '}}';
}

export function createHiddenTable(table, shortcode) {
  let hiddenColumns = shortcode.match(/(hideCol=)([0-9,]+)(;)/g);
  let hiddenRows = shortcode.match(/(hideRow=)([0-9,]+)(;)/g);
  if (hiddenColumns) {
    hiddenColumns = hiddenColumns[0]
      .replace('hideCol=', '')
      .replace(';', '')
      .split(',');
  } else {
    hiddenColumns = [];
  }
  if (hiddenRows) {
    hiddenRows = hiddenRows[0]
      .replace('hideRow=', '')
      .replace(';', '')
      .split(',');
  } else {
    hiddenRows = [];
  }
  var html = '<table contenteditable="false" data-shortcode="' + shortcode + '">';
  for (let i = 0; i < table.length; i++) {
    if (hiddenRows.indexOf(i.toString()) === -1) {
      html += '<tr>';
      for (let a = 0; a < table[i].length; a++) {
        if (hiddenColumns.indexOf(a.toString()) === -1) {
          if (table[i][a]) {
            html += '<td>' + table[i][a].value + '</td>';
          } else {
            html += '<td></td>';
          }
        }
      }
      html += '</tr>';
    }
  }
  html += '</table>';
  return html;
}

export function createTable(table, shortcode) {
  var html = '<table contenteditable="false" data-shortcode="' + shortcode + '">';
  for (let i = 0; i < table.length; i++) {
    html += '<tr>';
    for (let a = 0; a < table[i].length; a++) {
      if (table[i][a]) {
        html += '<td>' + table[i][a].value + '</td>';
      } else {
        html += '<td></td>';
      }
    }
    html += '</tr>';
  }
  html += '</table>';
  return html;
}

export function createRange(node, chars, range) {
  if (!range) {
    range = document.createRange();
    range.selectNode(node);
    range.setStart(node, 0);
  }

  if (chars.count === 0) {
    range.setEnd(node, chars.count);
  } else if (node && chars.count > 0) {
    if (node.nodeType === Node.TEXT_NODE) {
      if (node.textContent.length < chars.count) {
        chars.count -= node.textContent.length;
      } else {
        range.setEnd(node, chars.count);
        chars.count = 0;
      }
    } else {
      for (var lp = 0; lp < node.childNodes.length; lp++) {
        range = createRange(node.childNodes[lp], chars, range);

        if (chars.count === 0) {
          break;
        }
      }
    }
  }

  return range;
}

export function isChildOf(node, parentId) {
  while (node !== null) {
    if (node.id === parentId) {
      return true;
    }
    node = node.parentNode;
  }

  return false;
}

export function getCurrentCursorPosition(parentId) {
  var selection = window.getSelection(),
    charCount = -1,
    node;

  if (selection.focusNode) {
    if (this.isChildOf(selection.focusNode, parentId)) {
      node = selection.focusNode;
      charCount = selection.focusOffset;

      while (node) {
        if (node.id === parentId) {
          break;
        }

        if (node.previousSibling) {
          node = node.previousSibling;
          charCount += node.textContent.length;
        } else {
          node = node.parentNode;
          if (node === null) {
            break;
          }
        }
      }
    }
  }

  return charCount;
}

export function setCurrentCursorPosition(chars, id) {
  if (chars >= 0) {
    var selection = window.getSelection();

    var range = this.createRange(document.getElementById(id).parentNode, {
      count: chars
    });

    if (range) {
      range.collapse(false);
      selection.removeAllRanges();
      selection.addRange(range);
    }
  }
}

export function getPagesWithShortcodes(pages) {
  var pageClones = [];
  var pagesHtml = [];
  for (let i = 0; i < pages.length; i++) {
    let page = pages[i];
    pageClones[i] = pages[i].innerHTML.toString();
    let shortcodes = page.querySelectorAll('[data-shortcode]');
    for (let a = 0; a < shortcodes.length; a++) {
      let shortcode = shortcodes[a].dataset.shortcode;
      pageClones[i] = pageClones[i].replace(shortcodes[a].outerHTML, '{{' + shortcode + '}}');
    }
    pagesHtml[i] = pageClones[i];
  }
  return pagesHtml;
}

export function placeCaretAfterNode(node) {
  if (typeof window.getSelection != 'undefined') {
    var range = document.createRange();
    range.setStartAfter(node);
    range.collapse(true);
    var selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
  }
}

export function getSelectionContext() {
  var node = this.getSelectedNode();
  var selectionContext = {
    italic: false,
    bold: false,
    underline: false,
    ol: false,
    ul: false,
    tag: '',
    textAlign: '',
    table: false,
    figure: false
  };
  if (!insidePage(node)) return false;
  var next = !node.className || node.className.indexOf(styles.pages) === -1;
  while (next) {
    switch (node.nodeName) {
      case 'B':
        selectionContext.bold = true;
        break;
      case 'I':
        selectionContext.italic = true;
        break;
      case 'U':
        selectionContext.underline = true;
        break;
      case 'H1':
        selectionContext.tag = 'H1';
        break;
      case 'H2':
        selectionContext.tag = 'H2';
        break;
      case 'H3':
        selectionContext.tag = 'H3';
        break;
      case 'H4':
        selectionContext.tag = 'H4';
        break;
      case 'H5':
        selectionContext.tag = 'H5';
        break;
      case 'H6':
        selectionContext.tag = 'H6';
        break;
      case 'P':
        selectionContext.tag = 'P';
        break;
      case 'UL':
        selectionContext.ul = true;
        break;
      case 'OL':
        selectionContext.ol = true;
        break;
      case 'TABLE':
        selectionContext.table = {
          node: node,
          width: node.style.width.replace('%', '') || 100,
          float: node.className || 'none'
        };
        break;
      case 'FIGURE':
        selectionContext.figure = {
          node: node,
          width: node.style.width.replace('%', '') || 100,
          float: node.className || 'none'
        };
        break;
    }
    if (node.style && selectionContext.textAlign === '') {
      switch (node.style.textAlign) {
        case 'center':
          selectionContext.textAlign = 'center';
          break;
        case 'left':
          selectionContext.textAlign = 'left';
          break;
        case 'right':
          selectionContext.textAlign = 'right';
          break;
      }
    }
    node = node.parentNode;
    next = node ? !node.className || node.className.indexOf(styles.pages) === -1 : false;
  }

  return selectionContext;
}

export function getSelectedNode() {
  if (document.selection) return document.selection.createRange().parentElement();
  else {
    var selection = window.getSelection();
    if (selection.rangeCount > 0) return selection.getRangeAt(0).startContainer;
  }
}

export function insidePage(node) {
  while (node != null) {
    if (node.className && node.className.indexOf(styles.pages) !== -1) {
      return true;
    }
    node = node.parentNode;
  }
  return false;
}
