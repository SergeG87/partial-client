import * as React from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { Responsive, WidthProvider } from 'react-grid-layout';
require('react-grid-layout/css/styles.css');
require('font-awesome/css/font-awesome.css');
var ContentEditable = require('react-contenteditable');
const uuidv4 = require('uuid/v4');
import * as classnames from 'classnames';
import { Checkbox } from '../../../shared/components/Checkbox';
import WorkfileService from '../../../services/workfiles';
import { Toolbar } from './Toolbar';
import * as utils from './utils';

import * as styles from './styles.css';
import { PageProps, ReportBuilderAction, Report, CloseFunction } from '../../../types/Report';
import ReportService from '../../../services/reports';

const ResponsiveGridLayout = WidthProvider(Responsive);

export interface ReportBuilderState {
  reports: Report[];
  analysis: Array<Array<Cell>>;
  pages: number;
  parseShortcodes: boolean;
  cursorPosition: number;
  italic: boolean;
  bold: boolean;
  underline: boolean;
  ul: boolean;
  ol: boolean;
  table: any;
  figure: any;
  tag: string;
  textAlign: string;
  zoom: number;
  currentPage: number,
}

interface Cell {
  formula: string | null;
  value: string | null;
  error: string | null;
}

export interface ReportBuilderProps {
  tractId: string;
  workfileId: string;
}

export class ReportBuilder extends React.Component<
  RouteComponentProps<ReportBuilderProps>,
  ReportBuilderState
> {
  constructor(props: RouteComponentProps<ReportBuilderProps>) {
    super(props);
    this.state = {
      reports: [],
      analysis: [],
      pages: 1,
      parseShortcodes: true,
      cursorPosition: null,
      italic: false,
      bold: false,
      underline: false,
      ul: false,
      ol: false,
      table: false,
      figure: false,
      tag: '',
      textAlign: '',
      zoom: 100,
      currentPage: 0,
    };
    this.getReports = this.getReports.bind(this);
    this.saveReport = this.saveReport.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.addPage = this.addPage.bind(this);
    this.addItem = this.addItem.bind(this);
  }

  componentWillMount() {
    this.getReports();
    // this.fetchWorkfileAnalysis();
  }

  componentDidMount() {
    document.addEventListener('selectionchange', this.handleSelectionChange, false);
  }

  handleSelectionChange = () => {
    var selectionContext = utils.getSelectionContext();
    if (!selectionContext) return;
    this.setState({
      italic: selectionContext.italic,
      bold: selectionContext.bold,
      underline: selectionContext.underline,
      tag: selectionContext.tag,
      textAlign: selectionContext.textAlign,
      ul: selectionContext.ul,
      ol: selectionContext.ol,
      table: selectionContext.table,
      figure: selectionContext.figure
    });
  };

  async fetchWorkfileAnalysis() {
    const workfileId = this.props.match.params.workfileId;
    try {
      const analysis: any = await WorkfileService.getSubjectAnalysis(workfileId);
      utils.init(analysis);
      this.setState({
        analysis: analysis
      });
    } catch (e) {
      console.log(e);
    }
  }

  FetchReports() {
    Promise.all([ReportService.getReports(this.props.match.params.workfileId)]).then(
      ([reports]) => {
        this.setState(() => ({
          reports: [{ report: JSON.parse(reports[0].report) }]
        }));
      }
    );
  }

  async saveReport() {
    // Use mock method to prevent overwriting of existing data
    const reports = ReportService.emulateCreateReport(this.props.match.params.workfileId, {
      report: JSON.stringify({ pages: this.state.reports[0].report.pages })
    });
  }

  async getReports() {
    // Use mock method to get static test data
    const reports = ReportService.emulateGetReports(this.props.match.params.workfileId);
    this.setState({ reports: [{ report: reports[0].report }] });
  }

  handleChange(evt: any) {
    this.handleSelectionChange();
    var pages: any = document.querySelectorAll('.' + styles.page);
    var pageClones = [];
    var pagesHtml = [];
    for (let i = 0; i < pages.length; i++) {
      let page = pages[i];
      pagesHtml[i] = page.innerHTML;
    }
    this.setState({
      reports: [{ report: { pages: pagesHtml } }]
    });
  }

  addPage() {
    const pages = this.state.reports[0].report.pages;

    const newitem = {id: uuidv4(), x: 0, y: 0, w: 12, h: 5, html: 'New Content Block...<br><br><br><br><br>'};
    const newPage = {items: [newitem]};
    pages.push(newPage);

    this.setState({ reports: [{ report: { pages: pages } }] });
  }

  // adds new Content Block to current page
  addItem() {
    const pageIndex = this.state.currentPage;
    const pages = this.state.reports[0].report.pages;
    const page = pages[pageIndex];
    const items = page.items;

    const newitem = {id: uuidv4(), x: 0, y: Infinity, w: 12, h: 5, html: 'New Content Block...<br><br><br><br><br>'};
    items.push(newitem);

    this.setState({ reports: [{ report: { pages: pages } }] });
  }

  // removes selected Content Block
  removeItem = (blockId, pageIndex) => e => {
    if (confirm('Are you sure?')) {
      const pages = this.state.reports[0].report.pages;

      const page = pages[pageIndex];
      const items = page.items;

      page.items = items.filter(item => item.id !== blockId);

      this.setState({reports: [{report: {pages: pages}}]});
    }
  };

  execCommand(cmd: string) {
    document.execCommand(cmd, false, null);
  }

  formatBlock(tag: string) {
    document.execCommand('formatBlock', false, tag);
  }

  changeZoom = e => {
    this.setState({ zoom: e.target.value });
  };

  // edit content inside Content Block
  handleBlockChange = (blockId, pageIndex) => e => {
    const pages = this.state.reports[0].report.pages;
    const items = pages[pageIndex].items;

    const editedBlock = items.find(item => item.id === blockId);
    editedBlock.html = e.target.value;
    this.setState({ reports: [{ report: { pages: pages } }] });
  };

  // recalculate position and size of Content Blocks
  handleLayoutChange = pageIndex => layouts => {
    const pages = this.state.reports[0].report.pages;
    const items = pages[pageIndex].items;

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const itemLayout = layouts.find(layout => layout.i === item.id);

      if (itemLayout) {
        item.x = itemLayout.x;
        item.y = itemLayout.y;
        item.w = itemLayout.w;
        item.h = itemLayout.h;
      }
    }

    this.setState({ reports: [{ report: { pages: pages } }] });
  };

  // select page as current
  setCurrentPage = pageIndex => e => {
    this.setState({ currentPage: pageIndex });
  };

  render() {
    var report: any = '';

    const pages = [];
    if (
        this.state.reports.length &&
        this.state.reports[0].report.pages
    ) {
      report = this.state.reports[0].report;
      const pagesData = report.pages;

      for (let pageIndex = 0; pageIndex < pagesData.length; pageIndex++) {
        const page = pagesData[pageIndex];
        const items = page.items;

        const contentBlocks = [];
        for (let i = 0; i < items.length; i++) {
          const item = items[i];
          contentBlocks.push(
              <div data-grid={{x: item.x, y: item.y, w: item.w, h: item.h, minH: 2}} key={item.id} className={styles.reactGridItem}>
                <div className={classnames('fa fa-arrows', styles.dragHandle)} />
                <div className={classnames('fa fa-times-circle', styles.removeItem)} onClick={this.removeItem(item.id, pageIndex)} />
                <ContentEditable
                    key={`content_${item.id}`}
                    id={`content_${item.id}`}
                    className={styles.contentEditable}
                    html={item.html}
                    disabled={false}
                    onChange={this.handleBlockChange(item.id, pageIndex)}
                />
              </div>
          );
        }

        pages.push(
            <div
                className={classnames(styles.page, { [styles.pageCurrent]: pageIndex === this.state.currentPage })}
                id={`page_${pageIndex}`}
                data-id={pageIndex.toString()}
                key={`page_${pageIndex}`}
                onClick={this.setCurrentPage(pageIndex)}
            >
              <ResponsiveGridLayout
                  className={styles.gridLayout}
                  cols={{lg: 12, md: 12, sm: 12, xs: 12, xxs: 12}}
                  rowHeight={20}
                  key="grid-layout"
                  draggableHandle={`.${styles.dragHandle}`}
                  onLayoutChange={this.handleLayoutChange(pageIndex)}
              >
                {contentBlocks}
              </ResponsiveGridLayout>
            </div>
        );
      }
    } else {
      return null;
    }

    return (
      <div className={styles.ReportBuilder}>
        <Toolbar
          workfileId={this.props.match.params.workfileId}
          saveReport={this.saveReport}
          addPage={this.addPage}
          addItem={this.addItem}
        >
          <div className={styles.buttonGroup}>
            <input type="number" value={this.state.zoom} onChange={this.changeZoom} />
          </div>
          <div className={styles.buttonGroup} style={{ display: 'none' }}>
            <Checkbox
              checked={this.state.parseShortcodes}
              onChange={() => {
                var pages: any = document.querySelectorAll('.' + styles.page);
                this.setState({
                  parseShortcodes: !this.state.parseShortcodes,
                  reports: [{ report: { pages: utils.getPagesWithShortcodes(pages) } }]
                });
              }}
              id="parseShortcodes"
            />
            Parse Shortcodes
          </div>
        </Toolbar>
        <div className={styles.pages}>
          <div style={{ zoom: this.state.zoom / 100 }}>{pages}</div>
        </div>
        <div className={styles.ContextSidebar}>
          {this.state.figure ? (
            <div className={styles.section + ' clearfix'}>
              <div className={styles.buttonGroup + ' clearfix'}>
                <h5>Image</h5>
                <label>
                  Width<br />
                  <input
                    type="number"
                    value={this.state.figure.width}
                    onChange={e => {
                      var figure = this.state.figure;
                      figure.width = e.target.value;
                      this.setState({
                        figure
                      });
                      this.state.figure.node.style.width = e.target.value + '%';
                    }}
                  />
                </label>
              </div>
              <div className={styles.buttonGroup}>
                <button
                  onClick={() => {
                    var figure = this.state.figure;
                    figure.float = 'left';
                    this.setState({
                      figure
                    });
                    this.state.figure.node.classList.remove(styles.center);
                    this.state.figure.node.classList.remove(styles.right);
                    this.state.figure.node.classList.add(styles.left);
                  }}
                  className={this.state.figure.float === 'left' ? styles.selected : ''}
                >
                  Float Left
                </button>
                <button
                  onClick={() => {
                    var figure = this.state.figure;
                    figure.float = 'center';
                    this.setState({
                      figure
                    });
                    this.state.figure.node.classList.remove(styles.left);
                    this.state.figure.node.classList.remove(styles.right);
                    this.state.figure.node.classList.add(styles.center);
                  }}
                  className={this.state.figure.float === 'center' ? styles.selected : ''}
                >
                  center
                </button>
                <button
                  onClick={() => {
                    var figure = this.state.figure;
                    figure.float = 'right';
                    this.setState({
                      figure
                    });
                    this.state.figure.node.classList.remove(styles.center);
                    this.state.figure.node.classList.remove(styles.left);
                    this.state.figure.node.classList.add(styles.right);
                  }}
                  className={this.state.figure.float === 'right' ? styles.selected : ''}
                >
                  Float Right
                </button>
              </div>
              <div className={styles.buttonGroup}>
                <button
                  onClick={() => {
                    var figure = this.state.figure;
                    figure.float = 'none';
                    this.setState({
                      figure
                    });
                    this.state.figure.node.classList.remove(styles.center);
                    this.state.figure.node.classList.remove(styles.left);
                    this.state.figure.node.classList.remove(styles.right);
                  }}
                  className={this.state.figure.float === 'none' ? styles.selected : ''}
                >
                  Float None
                </button>
              </div>
            </div>
          ) : (
            ''
          )}
          {this.state.table ? (
            <div className={styles.section + ' clearfix'}>
              <div className={styles.buttonGroup}>
                <h5>Table</h5>
                <label>
                  Width<br />
                  <input
                    type="number"
                    value={this.state.table.width}
                    onChange={e => {
                      var table = this.state.table;
                      table.width = e.target.value;
                      this.setState({
                        table
                      });
                      this.state.table.node.style.width = e.target.value + '%';
                    }}
                  />
                </label>
              </div>
              <div className={styles.buttonGroup}>
                <button
                  onClick={() => {
                    var table = this.state.table;
                    table.float = 'left';
                    this.setState({
                      table
                    });
                    this.state.table.node.classList.remove(styles.center);
                    this.state.table.node.classList.remove(styles.right);
                    this.state.table.node.classList.add(styles.left);
                  }}
                  className={this.state.table.float === 'left' ? styles.selected : ''}
                >
                  Float Left
                </button>
                <button
                  onClick={() => {
                    var table = this.state.table;
                    table.float = 'center';
                    this.setState({
                      table
                    });
                    this.state.table.node.classList.remove(styles.left);
                    this.state.table.node.classList.remove(styles.right);
                    this.state.table.node.classList.add(styles.center);
                  }}
                  className={this.state.table.float === 'center' ? styles.selected : ''}
                >
                  center
                </button>
                <button
                  onClick={() => {
                    var table = this.state.table;
                    table.float = 'right';
                    this.setState({
                      table
                    });
                    this.state.table.node.classList.remove(styles.center);
                    this.state.table.node.classList.remove(styles.left);
                    this.state.table.node.classList.add(styles.right);
                  }}
                  className={this.state.table.float === 'right' ? styles.selected : ''}
                >
                  Float Right
                </button>
              </div>
              <div className={styles.buttonGroup}>
                <button
                  onClick={() => {
                    var table = this.state.table;
                    table.float = 'none';
                    this.setState({
                      table
                    });
                    this.state.table.node.classList.remove(styles.center);
                    this.state.table.node.classList.remove(styles.left);
                    this.state.table.node.classList.remove(styles.right);
                  }}
                  className={this.state.figure.float === 'none' ? styles.selected : ''}
                >
                  Float None
                </button>
              </div>
            </div>
          ) : (
            ''
          )}
          <div className={styles.section + ' clearfix'}>
            <h5>Text</h5>
            <div className={styles.buttonGroup}>
              <select
                onChange={event => {
                  this.formatBlock(event.target.value);
                }}
                value={this.state.tag}
              >
                <option value="div">No Formatting</option>
                <option value="H1">Heading 1</option>
                <option value="H2">Heading 2</option>
                <option value="H3">Heading 3</option>
                <option value="H4">Heading 4</option>
                <option value="H5">Heading 5</option>
                <option value="P">Paragraph</option>
              </select>
            </div>
            <div className={styles.buttonGroup}>
              <button
                onClick={() => {
                  this.execCommand('italic');
                }}
                className={this.state.italic ? styles.selected : ''}
              >
                Italics
              </button>
              <button
                onClick={() => {
                  this.execCommand('bold');
                }}
                className={this.state.bold ? styles.selected : ''}
              >
                Bold
              </button>
              <button
                onClick={() => {
                  this.execCommand('underline');
                }}
                className={this.state.underline ? styles.selected : ''}
              >
                Underline
              </button>
            </div>
            <div className={styles.buttonGroup}>
              <button
                onClick={() => {
                  this.execCommand('justifyLeft');
                }}
                className={
                  this.state.textAlign === 'left' || this.state.textAlign === ''
                    ? styles.selected
                    : ''
                }
              >
                Justify Left
              </button>
              <button
                onClick={() => {
                  this.execCommand('justifyCenter');
                }}
                className={this.state.textAlign === 'center' ? styles.selected : ''}
              >
                Justify Center
              </button>
              <button
                onClick={() => {
                  this.execCommand('justifyRight');
                }}
                className={this.state.textAlign === 'right' ? styles.selected : ''}
              >
                Justify Right
              </button>
            </div>
            <div className={styles.buttonGroup}>
              <button
                onClick={() => {
                  this.execCommand('insertOrderedList');
                }}
                className={this.state.ol ? styles.selected : ''}
              >
                Ordered List
              </button>
              <button
                onClick={() => {
                  this.execCommand('insertUnorderedList');
                }}
                className={this.state.ul ? styles.selected : ''}
              >
                Unordered List
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
