/* #region Imports*/

import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import * as THREE from 'three';

/* #Endregion Imports*/

let _this;

/*** 
 * O componente principal da aplicação, referente ao Three
 */
@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class MainComponent implements AfterViewInit {

  /* #region Constructor*/

  constructor() {
    _this = this;
  }

  /* #Endregion Constructor*/

  /* #region Public Properties*/

  /*** 
   * A referência da tag canvas no template
   */
  @ViewChild('threeApplication') threeApplication: ElementRef<HTMLCanvasElement>;

  /* #Endregion Public Properties*/

  /* #region Private Properties*/

  /*** 
   * Contém as propriedades da câmera
   */
  private readonly cameraProperties = {
    fov: 75,
    aspect: window.innerWidth / window.innerHeight,
    near: 0.1,
    far: 5,
  };


  /*** 
   * Contém as propriedades da caixa
   */
  private readonly boxGeometryProperties = {
    width: 1,
    height: 1,
    depth: 1,
  }

  /*** 
   * Contém as propriedades da luz da caixa
   */
  private readonly boxLightProperties = {
    color: 0xFFFFFF,
    intensity: 1,
  }

  /*** 
   * O renderizador da aplicação
   */
  private renderer: THREE.WebGLRenderer = new THREE.WebGLRenderer();

  /*** 
   * A câmera da aplicação
   */
  private camera: THREE.PerspectiveCamera = new THREE.PerspectiveCamera(
    this.cameraProperties.fov,
    this.cameraProperties.aspect,
    this.cameraProperties.near,
    this.cameraProperties.far,
  );

  /*** 
   * A Cena da aplicação
   */
  private scene: THREE.Scene = new THREE.Scene();

  /*** 
   * A geometria de uma caixa
   */
  private boxGeometry: THREE.BoxGeometry = new THREE.BoxGeometry(
    this.boxGeometryProperties.width,
    this.boxGeometryProperties.height,
    this.boxGeometryProperties.depth,
  );

  /*** 
   * O material de uma caixa
   */
  private boxMaterial: THREE.MeshBasicMaterial = new THREE.MeshPhongMaterial({ color: 0x44aa88, name: 'Caixa' });

  /*** 
   * A luminosidade da caixa
   */
  private boxLight: THREE.DirectionalLight = new THREE.DirectionalLight(
    this.boxLightProperties.color,
    this.boxLightProperties.intensity
  );

  /*** 
   * O objeto que representa uma caixa
   */
  private cube: THREE.Mesh<any, any> = new THREE.Mesh(this.boxGeometry, this.boxMaterial);

  /* #Endregion Private Properties*/

  /* #region LifeCycle Events*/

  /*** 
   * Método chamado após iniciar as views
   */
  async ngAfterViewInit(): Promise<void> {

    await this.makeThree();
  }

  /* #Endregion LifeCycle Events*/

  /* #region Private Methods*/

  /*** 
   * O método que executa a biblioteca e cria as aplicações do ThreeJs
   */
  private async makeThree(): Promise<void> {

    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio);

    this.threeApplication.nativeElement.appendChild(this.renderer.domElement);
    console.log(this.threeApplication.nativeElement);

    this.scene.add(this.cube);
    this.camera.position.z = 3;

    this.boxLight.position.set(-1, 2, 4);
    this.scene.add(this.boxLight);

    this.renderer.render(this.scene, this.camera);

    requestAnimationFrame(this.animateCube);
    // this.animateCube();
  }

  /*** 
   * O método que anima o cubo
   * 
   * @note Repare que ele é executado em outro escopo, por isso é necessário utilizar o escopo da classe
   * ou até uma arrow function
   */
  private animateCube = () => {
    requestAnimationFrame(this.animateCube);

    if (this.resizeRendererToDisplaySize(this.renderer)) {
      const canvas = this.renderer.domElement;
      this.camera.aspect = canvas.clientWidth / canvas.clientHeight;
      this.camera.updateProjectionMatrix();
    }

    this.cube.rotation.x += 0.01;
    this.cube.rotation.y += 0.01;

    this.renderer.render(this.scene, this.camera);

  }

  /*** 
   * O método que atualiza a dimensão do canvas
   * 
   * @param renderer O rederer a ser verificado
   */
  private resizeRendererToDisplaySize(renderer): boolean {
    const canvas = renderer.domElement;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    const needResize = canvas.width !== width || canvas.height !== height;
    if (needResize) {
      renderer.setSize(width, height, false);
    }
    return needResize;
  }

  /* #Endregion Private Methods*/

}
