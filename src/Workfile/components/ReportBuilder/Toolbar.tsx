import * as React from 'react';
import { RouteComponentProps, Link, matchPath } from 'react-router-dom';
import * as styles from './styles.css';
import { ImageLibrary } from '../../../shared/components/MediaLibrary';
import { TableBuilder } from './TableBuilder';
import { Button } from '../../../shared/components/Button';
import { Modal } from '../../../shared/components/Modal';

export interface ToolbarProps {
  saveReport: any;
  addPage: any;
  addItem: any;
  workfileId: string;
}

export interface ToolbarState {
  showImageModal: boolean;
  showTableModal: boolean;
  activeElement: any;
}

export class Toolbar extends React.Component<ToolbarProps, ToolbarState> {
  state: ToolbarState = {
    showImageModal: false,
    showTableModal: false,
    activeElement: null
  };

  constructor(props: ToolbarProps) {
    super(props);
    this.props = props;
    this.insertImage = this.insertImage.bind(this);
    this.closeModal = this.closeModal.bind(this);
  }

  insertImage() {
    this.setState({
      showImageModal: true,
      activeElement: document.activeElement
    });
  }

  openTableModal() {
    this.setState({
      showTableModal: true,
      activeElement: document.activeElement
    });
  }

  closeModal() {
    this.setState({
      showImageModal: false,
      showTableModal: false,
      activeElement: null
    });
  }

  render() {
    return (
      <div className={styles.toolbar + ' clearfix'}>
        <Modal
          show={this.state.showImageModal}
          showCancel={true}
          showOk={false}
          onCancel={this.closeModal}
        >
          <ImageLibrary closeModal={this.closeModal} workfileId={this.props.workfileId} />
        </Modal>

        <TableBuilder
          workfileId={this.props.workfileId}
          closeModal={this.closeModal}
          show={this.state.showTableModal}
        />

        <div className={styles.buttonGroup}>
          <Button onClick={this.props.saveReport}>Save</Button>
          <Link to={`/workfiles/${this.props.workfileId}/report-preview`} target="_blank">
            <Button>Preview</Button>
          </Link>
        </div>

        <div className={styles.buttonGroup}>
          <Button
            onClick={() => {
              this.insertImage();
            }}
          >
            Insert Image
          </Button>

          <Button
            onClick={() => {
              this.openTableModal();
            }}
          >
            Insert Table
          </Button>
          <Button onClick={this.props.addPage}>New Page</Button>
          <Button onClick={this.props.addItem}>New Content Block</Button>
        </div>
        {this.props.children}
      </div>
    );
  }
}
