import * as React from 'react';
import * as styles from './styles.css';
import { CloseFunction } from '../../../types/Report';
import { File as IFile } from '../../../types';
import TractService from '../../../services/tracts';
import SaleService from '../../../services/sales';
import WorkfileService from '../../../services/workfiles';
import { Button } from '../../../shared/components/Button';
import { ImageList } from '../FileList';
import { ComponentTab } from '../ComponentTab';
import { Modal } from '../../../shared/components/Modal';
import {ImageCropper} from "../ImageCropper";

export interface ImageLibraryProps {
  closeModal: CloseFunction;
  workfileId: string;
}

export interface ImageLibraryState {
  tracts: IFile[][];
  sales: IFile[][];
  selectedFile: IFile;
  selectedTract: number;
  showImageCropModal: boolean;
}

export class ImageLibrary extends React.Component<ImageLibraryProps, ImageLibraryState> {
  state: ImageLibraryState = {
    tracts: [[]],
    sales: [[]],
    selectedFile: null,
    selectedTract: null,
    showImageCropModal: false
  };

  constructor(props: ImageLibraryProps) {
    super(undefined);
    this.props = props;
    this.insertImage = this.insertImage.bind(this);
    this.selectHandler = this.selectHandler.bind(this);
    this.closeModal = this.closeModal.bind(this);
    this.handleCrop = this.handleCrop.bind(this);
    this.getTracts();
    this.getSales();
  }

  shouldComponentUpdate(nextProps: any, nextState: any) {
    return (
      nextState.tracts !== this.state.tracts ||
      nextState.sales !== this.state.sales ||
      nextState.selectedFile !== this.state.selectedFile ||
      nextState.showImageCropModal !== this.state.showImageCropModal
    );
  }

  async getTractImages(workfileId: string, tractId: number) {
    var tractFiles = await TractService.getFiles(workfileId, tractId);
    var prevTracts = [];
    for (let i = 0; i < this.state.tracts.length; i++) {
      prevTracts[i] = this.state.tracts[i];
    }
    prevTracts[tractId] = tractFiles;
    this.setState({ tracts: prevTracts });
  }

  async getSaleImages(workfileId: string, saleId: number) {
    var saleFiles = await SaleService.getFiles(saleId);
    var prevSales = [];
    for (let i = 0; i < this.state.sales.length; i++) {
      prevSales[i] = this.state.sales[i];
    }
    prevSales[saleId] = saleFiles;
    this.setState({ sales: prevSales });
  }

  async getTracts() {
    var tracts = await TractService.getTracts(this.props.workfileId);
    for (let i = 0; i < tracts.length; i++) {
      this.getTractImages(this.props.workfileId, tracts[i].id);
    }
  }

  async getSales() {
    var sales = await WorkfileService.getWorkfileSales(this.props.workfileId);
    for (let i = 0; i < sales.length; i++) {
      this.getSaleImages(this.props.workfileId, sales[i]);
    }
  }

  selectHandler(file: IFile) {
    this.setState({ selectedFile: file });
  }

  insertImage() {
    if (this.state.selectedFile !== null) {
      this.setState({
          showImageCropModal: true
      });
    }
  }

  handleCrop(cropBox){
    console.log(cropBox)
      document.execCommand(
        'insertHTML',
        false,
        `<figure><svg width="100%" viewBox="0 0 ${cropBox.width} ${cropBox.height*cropBox.initialHeightToWidth}" preserveAspectRatio="xMinYMin slice">
                    <image xlink:href="${this.state.selectedFile.file_url}" x="-${cropBox.left*cropBox.containerZoomWidth/100}%" y="-${cropBox.top*cropBox.containerZoomHeight/100}%" width="${cropBox.containerZoomWidth}%"></image>
            </svg> </figure>`
      );
      this.setState({ selectedFile: null });
      this.closeModal();
      this.props.closeModal();
  }

  closeModal() {
      this.setState({
          showImageCropModal: false
      });
  }

  render() {
    var components = [];
    for (var i = 0; i < this.state.tracts.length; i++) {
      if (this.state.tracts[i]) {
        if (this.state.tracts[i].length) {
          components.push({
            label: 'tract ' + (i + 1),
            component: (
              <ImageList
                files={this.state.tracts[i]}
                onSelect={this.selectHandler}
                useButtons={true}
              />
            )
          });
        }
      }
    }
    for (var i = 0; i < this.state.sales.length; i++) {
      if (this.state.sales[i]) {
        if (this.state.sales[i].length) {
          components.push({
            label: 'sale ' + (i + 1),
            component: (
              <ImageList
                files={this.state.sales[i]}
                onSelect={this.selectHandler}
                useButtons={true}
              />
            )
          });
        }
      }
    }
    return (
      <div>
          {
              this.state.selectedFile && (<Modal
                  show={this.state.showImageCropModal}
                  showCancel={true}
                  showOk={false}
                  onCancel={this.closeModal}
              >
                  <ImageCropper onCrop={this.handleCrop} imageUrl={this.state.selectedFile.file_url} closeModal={this.closeModal} />
              </Modal>)
          }
        <div className={styles.mediaLibrary}>
          <ComponentTab components={components} />
        </div>
        <Button onClick={this.insertImage}>Insert Media</Button>
      </div>
    );
  }
}
