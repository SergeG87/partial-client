import * as React from 'react';
import * as styles from './styles.css';
import { CloseFunction } from '../../../types/Report';
import { Button } from '../../../shared/components/Button';
import 'cropperjs/dist/cropper.min.css';
import Cropper from 'cropperjs';

export interface ImageCropperProps {
    closeModal: CloseFunction;
    imageUrl: string;
    onCrop: Function
}

export interface ImageCropperState {
    isReady: boolean
}


export interface ImageCropper {
    image: HTMLImageElement,
    cropper: object,
    imageElementWrapper: HTMLDivElement
}

export class ImageCropper extends React.Component<ImageCropperProps, ImageCropperState> implements ImageCropper{
    state: ImageCropperState = {
        isReady: false
    };

    constructor(props: ImageCropperProps) {
        super(undefined);
        this.props = props;
        this.initializeCropper = this.initializeCropper.bind(this);
        this.cropImage = this.cropImage.bind(this);
    }

    componentDidMount(){
        this.initializeCropper();
    }

    cropImage(){
        let imageSizes = this.cropper['getImageData']();
        let cropBox = this.cropper['getCropBoxData']();

        cropBox.left = cropBox.left < 0 ? 0 : cropBox.left;
        cropBox.top = cropBox.top < 0 ? 0 : cropBox.top;
        cropBox.width = cropBox.width > imageSizes.width ? imageSizes.width : cropBox.width;
        cropBox.height = cropBox.height > imageSizes.height ? imageSizes.height : cropBox.height;

        cropBox['zoom'] = imageSizes.width / cropBox.width * 100;
        cropBox['cropboxHeightToWidth'] = cropBox.height/cropBox.width;
        cropBox['initialHeightToWidth'] = imageSizes.height/imageSizes.width;

        cropBox.left = parseFloat((cropBox.left / imageSizes.width * 100).toFixed(1));
        cropBox.top = parseFloat((cropBox.top / imageSizes.height * 100).toFixed(1));
        cropBox.width = parseFloat((cropBox.width / imageSizes.width * 100).toFixed(1));
        cropBox.height = parseFloat((cropBox.height / imageSizes.height * 100).toFixed(1));

        cropBox['containerZoomWidth'] = 100 / cropBox.width * 100;
        cropBox['containerZoomHeight'] = 100 / cropBox.height * 100;

        this.props.onCrop(cropBox);
    }

    initializeCropper(){
        let _cthis = this;

        let image = document.getElementById('imageToCrop') as HTMLImageElement;
        image.onload = () => {
            let cropper = new Cropper(image, {
                zoomable: false,
                movable: false,
                rotatable: false,
                scalable: false,
                minCropBoxWidth: 5,
                minCropBoxHeight: 5,
                guides: true,
                ready: function () {
                    cropper.setCropBoxData({
                        left: 0,
                        top: 0,
                        width: image.naturalWidth,
                        height: image.naturalHeight
                    });

                    _cthis.image = image;
                    _cthis.cropper = cropper;
                    _cthis.setState({ isReady: true });
                }
            });
        };

    }

    render() {
        return (
            <div>
                <div ref={(el) => { this.imageElementWrapper = el; }} className={styles.imageElementWrapper}>
                    <img id="imageToCrop" src={this.props.imageUrl}/>
                </div>
                <Button disabled={!this.state.isReady} onClick={this.cropImage}>Crop</Button>
            </div>
        );
    }
}
