import {
	CubeTexture,
	Loader,
	LoadingManager,
	TextureDataType
} from 'three';

import { RGBELoader } from './RGBELoader';

export class HDRCubeTextureLoader extends Loader {

	constructor( manager?: LoadingManager );
	hdrLoader: RGBELoader;
	type: TextureDataType;

	load( urls: string[], onLoad: ( texture: CubeTexture ) => void, onProgress?: ( event: ProgressEvent ) => void, onError?: ( event: ErrorEvent ) => void ): void;
	setDataType( type: TextureDataType ): this;

}
