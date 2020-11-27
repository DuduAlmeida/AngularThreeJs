/* #region Imports*/

import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';

import * as THREE from 'three';
import { ARButton } from '../../threeJs/jsm/webxr/ARButton.js';

/* #Endregion Imports*/

@Component({
  selector: 'app-webxr-application',
  templateUrl: './webxr-application.component.html',
  styleUrls: ['./webxr-application.component.scss']
})
export class WebxrApplicationComponent implements AfterViewInit {

  /* #region Constructor*/

  constructor() { }

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
    // await this.animate();
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
   * 
   */
  public reticle;

  /*** 
   * 
   */
  public hitTestSource = null;

  /*** 
   * 
   */
  public hitTestSourceRequested = false;

  /* #Endregion Public Properties*/

  /* #region Public Methods*/

  public async init(): Promise<void> {
    this.scene = new THREE.Scene();

    this.camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.01, 20);

    const light = new THREE.HemisphereLight(0xffffff, 0xbbbbff, 1);
    light.position.set(0.5, 1, 0.25);
    this.scene.add(light);

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.xr.enabled = true;
    this.container.nativeElement.appendChild(this.renderer.domElement);

    this.page.nativeElement.appendChild(ARButton.createButton(this.renderer, { requiredFeatures: ['hit-test'] }));

    const geometry = new THREE.CylinderBufferGeometry(0.1, 0.1, 0.2, 32).translate(0, 0.1, 0);
    this.reticle = new THREE.Mesh(
      new THREE.RingBufferGeometry(0.15, 0.2, 32).rotateX(- Math.PI / 2),
      new THREE.MeshBasicMaterial()
    );
    this.reticle.matrixAutoUpdate = false;
    this.reticle.visible = false;
    this.scene.add(this.reticle);

    this.controller = this.renderer.xr.getController(0);
    this.controller.addEventListener('select', this.onSelect(geometry));
    this.scene.add(this.controller);

    window.addEventListener('resize', this.onWindowResize, false);
  }

  /*** 
   * Método chamado para animar um objeto
   */
  public animate() {

    this.renderer.setAnimationLoop(this.render);
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

          session.requestHitTestSource({ space: referenceSpace }).then(function (source) {

            this.hitTestSource = source;

          });

        });

        session.addEventListener('end', function () {

          this.hitTestSourceRequested = false;
          this.hitTestSource = null;

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

  /* #Endregion Public Methods*/

  /* #region Private Methods*/

  /*** 
   * Método chamado ao selecionar um objeto
   * 
   * @param geometry O objeto a ser selecionado
   */
  private onSelect = (geometry: THREE.BufferGeometry): void => {

    if (this.reticle.visible) {

      const material = new THREE.MeshPhongMaterial({ color: 0xffffff * Math.random() });
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.setFromMatrixPosition(this.reticle.matrix);
      mesh.scale.y = Math.random() * 2 + 1;
      this.scene.add(mesh);
    }
  }

  /*** 
   * Método chamado ao mudar a forma da janela
   */
  private onWindowResize = () => {

    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  /* #Endregion Private Methods*/

}
