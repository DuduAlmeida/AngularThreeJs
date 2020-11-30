/* #region Imports*/

import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';

import * as THREE from 'three';
import { OrbitControls } from './../../threeJs/jsm/controls/OrbitControls.js';
import { GLTFLoader } from './../../threeJs/jsm/loaders/GLTFLoader.js';
import { RGBELoader } from './../../threeJs/jsm/loaders/RGBELoader.js';
import { RoughnessMipmapper } from './../../threeJs/jsm/utils/RoughnessMipmapper.js';
import { ARButton } from '../../threeJs/jsm/webxr/ARButton.js';
import { PMREMGenerator } from 'three';

/* #Endregion Imports*/

let _this;

/*** 
 * O componente que faz uma aplicação AR
 */
@Component({
  selector: 'app-webxr-application',
  templateUrl: './webxr-application.component.html',
  styleUrls: ['./webxr-application.component.scss']
})
export class WebxrApplicationComponent implements AfterViewInit {

  /* #region Constructor*/

  constructor() {
    _this = this;
  }

  /* #Endregion Constructor*/

  /* #region Public Properties*/

  /*** 
   * A referência da tag canvas no template
   */
  @ViewChild('webxrPage') page: ElementRef<HTMLCanvasElement>;
  @ViewChild('webxrContainer') container: ElementRef<HTMLCanvasElement>;

  /* #Endregion Public Properties*/

  /* #region LifeCycle Events*/

  /*** 
   * Evento executado após as views serem executadas
   */
  async ngAfterViewInit(): Promise<void> {

    await this.init();
    await this.animate();
  }

  /* #Endregion LifeCycle Events*/

  /* #region Public Properties*/

  /*** 
   * A câmera da aplicação
   */
  public camera: THREE.PerspectiveCamera;

  /*** 
   * O cenário da aplicação
   */
  public scene: THREE.Scene;

  /*** 
   * O renderizador da aplicação
   */
  public renderer;

  /*** 
   * O controlador da aplicação
   */
  public controller;

  /*** 
   * O retículo de mirar da aplicação
   */
  public reticle: THREE.Mesh<THREE.BufferGeometry, THREE.MeshBasicMaterial>;

  /*** 
   * 
   */
  public hitTestSource = null;

  /*** 
   * Diz se foi solicitado o hit para adicionar o objeto
   */
  public hitTestSourceRequested = false;

  /*** 
   * A geometria do cilindro 
   */
  public cylinderGeometry = new THREE.CylinderBufferGeometry(0.2, 0.2, 0.2, 32).translate(0, 0.1, 0);

  public pmremGenerator: THREE.PMREMGenerator;

  /*** 
   * A luminosidade da caixa
   */
  private directionalLight: THREE.DirectionalLight = new THREE.DirectionalLight(0xFFFFFF, 1);

  public currentObject?: THREE.Group = null;

  /* #Endregion Public Properties*/

  /* #region Public Methods*/

  /*** 
   * Método que inicia a aplicação 
   */
  public init = async (): Promise<void> => {
    this.scene = new THREE.Scene();

    this.camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.01, 5000);
    this.camera.position.z = 10;

    const light = new THREE.HemisphereLight(0xffffff, 0xbbbbff, 1);
    light.position.set(0.5, 1, 0.25);
    this.scene.add(light);


    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.xr.enabled = true;
    this.container.nativeElement.appendChild(this.renderer.domElement);

    this.pmremGenerator = new THREE.PMREMGenerator(this.renderer);
    this.pmremGenerator.compileEquirectangularShader();

    this.page.nativeElement.appendChild(ARButton.createButton(this.renderer, { requiredFeatures: ['hit-test'] }));

    this.controller = this.renderer.xr.getController(0);
    this.controller.addEventListener('select', this.onSelect);
    this.scene.add(this.controller);

    this.reticle = new THREE.Mesh(
      new THREE.RingBufferGeometry(0.15, 0.2, 32).rotateX(- Math.PI / 2),
      new THREE.MeshBasicMaterial()
    );
    this.reticle.matrixAutoUpdate = false;
    this.reticle.visible = false;
    this.scene.add(this.reticle);

    window.addEventListener('resize', this.onWindowResize, false);
  }

  /*** 
   * Método chamado para animar um objeto
   */
  public async animate(): Promise<void> {

    return void await this.renderer.setAnimationLoop(this.render);
  }

  /*** 
   * Método que executa a renderização da página
   * 
   * @param timestamp Valor provido da função que chama esse método, seria o horário atual
   */
  public render = (timestamp, frame) => {

    if (frame) {

      const referenceSpace = this.renderer.xr.getReferenceSpace();
      const session = this.renderer.xr.getSession();

      if (this.hitTestSourceRequested === false) {

        session.requestReferenceSpace('viewer').then(function (referenceSpace) {
          console.log('referenceSpace', referenceSpace);

          session.requestHitTestSource({ space: referenceSpace }).then(function (source) {
            console.log('source', source);
            _this.hitTestSource = source;

          });

        });

        session.addEventListener('end', function () {

          _this.hitTestSourceRequested = false;
          _this.hitTestSource = null;

        });

        this.hitTestSourceRequested = true;

      }

      if (this.hitTestSource) {

        const hitTestResults = frame.getHitTestResults(this.hitTestSource);

        if (hitTestResults.length) {

          const hit = hitTestResults[0];

          this.reticle.visible = true;
          this.reticle.matrix.fromArray(hit.getPose(referenceSpace).transform.matrix);

        } else {

          this.reticle.visible = false;

        }

      }

    }

    this.renderer.render(this.scene, this.camera);

  }

  /*** 
   * Método que carrega um modelo
   */
  public loadModel(model: string) {

    new RGBELoader()
      .setDataType(THREE.UnsignedByteType)
      .setPath('https://casadocodigolojastoragdu.blob.core.windows.net/threejsapplication/')
      .load('photo_studio_01_1k.hdr', (texture) => {

        let envmap = this.pmremGenerator.fromEquirectangular(texture).texture;

        this.scene.environment = envmap;
        texture.dispose();
        this.pmremGenerator.dispose();
        // this.render(1, true);

        var loader = new GLTFLoader()
          .setPath('https://casadocodigolojastoragdu.blob.core.windows.net/threejsapplication/');
        loader.load(model, (glb) => {

          this.currentObject = glb.scene;
          // this.scene.add(this.currentObject);

          // this.render(1, true);
        }, undefined, function (error) {

          console.error(error);
        });
      });

    this.closeNav();
  }

  /* #Endregion Public Methods*/

  /* #region Private Methods*/

  /*** 
   * Método chamado ao selecionar um objeto
   */
  private onSelect = (): void => {

    if (this.reticle.visible) {

      const mesh = this.createCurrentObject();
      mesh.position.setFromMatrixPosition(this.reticle.matrix);
      mesh.scale.y = Math.random() * 2 + 1;
      this.scene.add(mesh);

      this.directionalLight.position.set(-1, 2, 4);
      this.scene.add(this.directionalLight);
    }
  }

  /*** 
   * Método chamado ao mudar a forma da janela
   */
  private onWindowResize = (): void => {

    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  /*** 
   * O método que cria o objeto atual
   * 
   * @note Caso não tenha sido selecionado algum objeto no sidebar, ele retorna um cilindro
   */
  private createCurrentObject = (): any => {

    if (this.currentObject)
      return this.currentObject.clone();


    const material = new THREE.MeshPhongMaterial({ color: 0xffffff * Math.random() });
    return new THREE.Mesh(this.cylinderGeometry, material);
  }

  /* #Endregion Private Methods*/

  /* #region Nav Methods*/

  /*** 
   * O método que abre o navbar
   */
  public openNav(): void {
    // console.log('open');
    document.getElementById("mySidenav").style.width = "250px";
    document.getElementById("openBtn").style.left = "-100vw";
  }

  /*** 
   * O método que fecha o navbar
   */
  public closeNav(): void {
    // console.log('close');
    document.getElementById("mySidenav").style.width = "0";
    document.getElementById("openBtn").style.left = "1rem";
  }

  /* #Endregion Nav Methods*/

}
