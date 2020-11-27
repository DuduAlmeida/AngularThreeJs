import {
	LoadingManager,
	DataTextureLoader,
	TextureDataType,
	PixelFormat
} from 'three';

export interface EXR {
	header: object;
	width: number;
	height: number;
	data: Float32Array;
	format: PixelFormat;
	type: TextureDataType;
}

export class EXRLoader extends DataTextureLoader {

	constructor( manager?: LoadingManager );
	type: TextureDataType;

	parse( buffer: ArrayBuffer ) : EXR;
	setDataType( type: TextureDataType ): this;

}
