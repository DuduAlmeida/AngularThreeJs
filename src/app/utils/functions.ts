/* #region Imports*/

import * as THREE from 'three';

/* #Endregion Imports*/

/*** 
 * Função que carrega uma fonte
 * 
 * @param url A url onde a fonte está armazenada
 * @note É preciso ter um Three.FontLoader nomeado como fontLoader
 */
export async function loadFont(_this:any , url: string): Promise<any> {
    return new Promise((resolve, reject) => {
        _this.fontLoader.load(url, resolve, undefined, reject);
    });
}

/*** 
 * Método que cria uma material e retorna o mesmo
 */
export function createMaterial(): THREE.MeshPhongMaterial {
    const material = new THREE.MeshPhongMaterial({
        side: THREE.DoubleSide,
    });

    const hue = Math.random();
    const saturation = 1;
    const luminance = .5;
    // material.color.setHSL(hue, saturation, luminance);
    material.color = new THREE.Color(0x44aa88);

    return material;
}