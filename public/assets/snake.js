import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { refineCobra } from './cobra-detail.js?v=4';

// Explicit loading, rendering and recovery states prevent an empty black viewer.
const host = document.querySelector('#snake-scene');
const status = document.querySelector('#scene-status');
const fallback = host.querySelector('.scene-fallback');
const buttons = [...document.querySelectorAll('[data-scene]')];
const retry = document.querySelector('.scene-retry');
const motion = matchMedia('(prefers-reduced-motion: reduce)');
let generation = 0, active = null, cachedBytes = null;
retry.addEventListener('click', start);

function destroyScene(scene) {
  const geometries = new Set(), materials = new Set(), textures = new Set();
  scene.traverse(object => {
    if (object.geometry) geometries.add(object.geometry);
    for (const material of Array.isArray(object.material) ? object.material : object.material ? [object.material] : []) {
      materials.add(material);
      Object.values(material).forEach(value => { if (value?.isTexture) textures.add(value); });
    }
  });
  geometries.forEach(value => value.dispose()); materials.forEach(value => value.dispose()); textures.forEach(value => value.dispose());
}
function timeout(promise, duration, message) {
  let timer;
  return Promise.race([promise, new Promise((_, reject) => { timer = setTimeout(() => reject(new Error(message)), duration); })]).finally(() => clearTimeout(timer));
}

async function start() {
  const run = ++generation;
  active?.dispose(); active = null;
  host.querySelectorAll('canvas').forEach(canvas => canvas.remove());
  host.classList.remove('is-live'); delete host.dataset.ready; delete host.dataset.proof;
  host.dataset.state = 'loading'; host.setAttribute('aria-busy', 'true');
  fallback.hidden = false; retry.hidden = true;
  buttons.forEach(button => { button.disabled = true; });
  status.textContent = 'Đang tải mô hình 3D…';
  let renderer, scene, controls, resizeObserver, viewportObserver, loadController;
  let disposed = false, ready = false, visible = true, playing = false, dragging = false, tween = null;
  const handlers = [];
  const dispose = () => {
    if (disposed) return;
    disposed = true; loadController?.abort(); renderer?.setAnimationLoop(null);
    resizeObserver?.disconnect(); viewportObserver?.disconnect(); controls?.dispose();
    handlers.forEach(([target, event, handler]) => target.removeEventListener(event, handler));
    if (scene) destroyScene(scene);
    renderer?.dispose(); renderer?.domElement.remove();
  };
  const on = (target, event, handler) => { target.addEventListener(event, handler); handlers.push([target, event, handler]); };
  const fail = message => {
    if (run !== generation || disposed) return;
    dispose(); host.classList.remove('is-live'); delete host.dataset.ready; delete host.dataset.proof;
    host.dataset.state = 'error'; host.setAttribute('aria-busy', 'false'); fallback.hidden = false;
    status.textContent = message; retry.hidden = false;
    buttons.forEach(button => { button.disabled = true; });
  };
  active = { dispose };
  try {
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true, powerPreference: 'default' });
    } catch {
      fail('Thiết bị không hỗ trợ WebGL. Ảnh thay thế vẫn hiển thị.'); return;
    }
    renderer.setPixelRatio(Math.min(devicePixelRatio, innerWidth <= 760 ? 1.4 : 1.7));
    renderer.setClearColor(0x000000, 0);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    renderer.shadowMap.enabled = innerWidth > 760;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    const canvas = renderer.domElement;
    canvas.setAttribute('aria-hidden', 'true'); host.append(canvas);
    on(canvas, 'webglcontextlost', event => {
      event.preventDefault(); fail('WebGL đã bị gián đoạn. Bạn có thể tải lại mô hình.');
    });
    scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(36, 1, 0.04, 100);
    controls = new OrbitControls(camera, canvas);
    controls.enablePan = false; controls.enableZoom = false;
    controls.enableDamping = !motion.matches; controls.dampingFactor = 0.13;
    controls.minPolarAngle = Math.PI * 0.17; controls.maxPolarAngle = Math.PI * 0.48;
    canvas.style.touchAction = 'pan-y';
    // Direct and hemispheric light work without a GPU-heavy generated environment map.
    scene.add(new THREE.HemisphereLight(0xfff9e8, 0x68755b, 2.65));
    const key = new THREE.DirectionalLight(0xffeed7, 3.25);
    key.position.set(-3, 5, 4); key.castShadow = renderer.shadowMap.enabled;
    key.shadow.mapSize.set(1024, 1024); key.shadow.normalBias = 0.025; key.shadow.bias = -0.00015;
    Object.assign(key.shadow.camera, { left: -4, right: 4, top: 4, bottom: -4, near: 0.2, far: 15 });
    scene.add(key);
    const fill = new THREE.DirectionalLight(0xe9f2e2, 1.5); fill.position.set(4, 2, -3); scene.add(fill);
    if (!cachedBytes) {
      loadController = new AbortController();
      const response = await timeout(fetch('/assets/models/cobra.glb?v=3', { signal: loadController.signal }), 15000, 'model-timeout');
      if (!response.ok) throw new Error('model-request');
      const bytes = await timeout(response.arrayBuffer(), 15000, 'model-timeout');
      if (run !== generation || disposed) return;
      cachedBytes = bytes;
    }
    status.textContent = 'Đang chuẩn bị hình ảnh 3D…';
    const parsed = new GLTFLoader().parseAsync(cachedBytes, '/assets/models/');
    parsed.then(gltf => { if (run !== generation || disposed) destroyScene(gltf.scene); }).catch(() => {});
    const gltf = await timeout(parsed, 12000, 'decode-timeout');
    if (run !== generation || disposed) return;
    const model = gltf.scene;
    const facial = refineCobra(model);
    const bounds = new THREE.Box3().setFromObject(model);
    const originalSize = bounds.getSize(new THREE.Vector3());
    const center = bounds.getCenter(new THREE.Vector3());
    const scale = 3.3 / Math.max(originalSize.x, originalSize.y, originalSize.z);
    model.scale.setScalar(scale); model.position.copy(center).multiplyScalar(-scale); model.rotation.y = -0.35;
    scene.add(model);
    model.updateMatrixWorld(true);
    const faceTarget = facial.object.localToWorld(facial.center.clone());
    const faceDirection = new THREE.Vector3(0.8, 0.22, 1.6).applyQuaternion(facial.object.getWorldQuaternion(new THREE.Quaternion())).normalize();
    model.traverse(mesh => {
      if (!mesh.isMesh) return;
      mesh.castShadow = true; mesh.receiveShadow = true;
      for (const material of Array.isArray(mesh.material) ? mesh.material : [mesh.material]) {
        material.metalness = 0;
        if (material.normalMap) { material.normalScale.set(0.55, 0.55); material.roughness = 0.5; }
        if (material.map) material.map.anisotropy = Math.min(4, renderer.capabilities.getMaxAnisotropy());
      }
    });
    const fittedBounds = new THREE.Box3().setFromObject(model);
    const size = fittedBounds.getSize(new THREE.Vector3());
    const centerNow = fittedBounds.getCenter(new THREE.Vector3());
    controls.target.copy(centerNow);
    const sphere = fittedBounds.getBoundingSphere(new THREE.Sphere());
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(14, 14), new THREE.ShadowMaterial({ opacity: 0.2, depthWrite: false }));
    floor.rotation.x = -Math.PI / 2; floor.position.y = fittedBounds.min.y - 0.012; floor.receiveShadow = true; scene.add(floor);
    const direction = new THREE.Vector3(1.4, 0.34, 0.7).normalize();
    const initialPosition = new THREE.Vector3();
    const offset = new THREE.Vector3();
    let fitDistance = 0, previousTime = 0, faceMode = false;
    const faceButton = buttons.find(button => button.dataset.scene === 'face');
    const hint = 'Kéo ngang để xoay · Chọn Cận mặt để xem mắt, mũi và miệng';
    function limits() {
      controls.minDistance = faceMode ? 0.38 : Math.max(sphere.radius * 1.3, fitDistance * 0.66);
      controls.maxDistance = faceMode ? 3 : fitDistance * 1.65;
    }
    function mode(close) {
      faceMode = close; host.dataset.view = close ? 'face' : 'full';
      faceButton.setAttribute('aria-pressed', String(close));
      limits();
      status.textContent = close ? 'Cận mặt · Kéo ngang để đổi góc · Bấm ↺ để xem toàn thân' : hint;
    }
    function draw() {
      if (disposed || !visible || document.hidden) return;
      if (renderer.getContext().isContextLost()) { fail('WebGL đã bị gián đoạn. Bạn có thể tải lại mô hình.'); return; }
      try { renderer.render(scene, camera); } catch { fail('Chưa hiển thị được 3D. Hãy thử tải lại mô hình.'); }
    }
    function stop() { playing = false; renderer.setAnimationLoop(null); }
    function frame(time) {
      if (disposed || !visible || document.hidden) { stop(); return; }
      const delta = Math.min((time - previousTime) / 1000 || 0.016, 0.05); previousTime = time;
      if (tween) {
        const progress = Math.min(1, (time - tween.time) / 320);
        camera.position.lerpVectors(tween.from, tween.to, 1 - Math.pow(1 - progress, 3));
        controls.target.lerpVectors(tween.targetFrom, tween.targetTo, 1 - Math.pow(1 - progress, 3));
        if (progress >= 1) { tween = null; limits(); controls.enableDamping = !motion.matches; }
      }
      const changed = controls.update(delta);
      draw();
      if (!dragging && !tween && !changed) stop();
    }
    function play() {
      if (!ready || disposed || !visible || document.hidden) return;
      if (motion.matches) { controls.update(); draw(); return; }
      if (!playing) { playing = true; previousTime = performance.now(); renderer.setAnimationLoop(frame); }
    }
    function animateTo(to, target = controls.target.clone()) {
      controls.enableDamping = false;
      if (motion.matches) { camera.position.copy(to); controls.target.copy(target); limits(); controls.update(); draw(); return; }
      controls.minDistance = 0.04; controls.maxDistance = 100;
      tween = { from: camera.position.clone(), to, targetFrom: controls.target.clone(), targetTo: target, time: performance.now() }; play();
    }
    function resize() {
      if (disposed) return;
      const width = host.clientWidth, height = host.clientHeight;
      if (!width || !height) return;
      const ratio = fitDistance ? camera.position.distanceTo(controls.target) / fitDistance : 1;
      renderer.setSize(width, height, false); camera.aspect = width / height; camera.updateProjectionMatrix();
      const tangent = Math.tan(THREE.MathUtils.degToRad(camera.fov) / 2);
      const newDistance = Math.max(size.y / (2 * tangent), size.x / (2 * tangent * camera.aspect)) * 1.08 + size.z * 0.35;
      initialPosition.copy(centerNow).addScaledVector(direction, newDistance);
      fitDistance = newDistance;
      if (faceMode) { draw(); return; }
      controls.minDistance = Math.max(sphere.radius * 1.3, newDistance * 0.66);
      controls.maxDistance = newDistance * 1.65;
      offset.copy(camera.position.lengthSq() ? camera.position : initialPosition).sub(controls.target).normalize();
      camera.position.copy(controls.target).addScaledVector(offset, THREE.MathUtils.clamp(newDistance * ratio, controls.minDistance, controls.maxDistance));
      fitDistance = newDistance; controls.update(); draw();
    }
    controls.addEventListener('start', () => { dragging = true; tween = null; controls.enableDamping = !motion.matches; play(); });
    controls.addEventListener('change', () => { if (ready && !playing) { if (motion.matches) draw(); else play(); } });
    controls.addEventListener('end', () => { dragging = false; play(); });
    buttons.forEach(button => on(button, 'click', () => {
      if (!ready || disposed) return;
      offset.copy(camera.position).sub(controls.target);
      const spherical = new THREE.Spherical().setFromVector3(offset);
      const action = button.dataset.scene;
      if (action === 'face' && !faceMode) {
        mode(true);
        const distance = Math.max(0.92, 0.62 / camera.aspect);
        animateTo(faceTarget.clone().addScaledVector(faceDirection, distance), faceTarget.clone()); return;
      }
      if (action === 'reset' || action === 'face') {
        mode(false); animateTo(initialPosition.clone(), centerNow.clone()); return;
      }
      if (action === 'left') spherical.theta -= Math.PI / 7;
      if (action === 'right') spherical.theta += Math.PI / 7;
      if (action === 'zoom-in') spherical.radius = Math.max(controls.minDistance, spherical.radius * 0.85);
      if (action === 'zoom-out') spherical.radius = Math.min(controls.maxDistance, spherical.radius * 1.17);
      const destination = new THREE.Vector3().setFromSpherical(spherical).add(controls.target);
      animateTo(destination);
    }));
    resize();
    // Read a tiny first frame before replacing the photo: a black/empty frame is an error state.
    const proof = new THREE.WebGLRenderTarget(24, 24);
    const pixels = new Uint8Array(24 * 24 * 4);
    try {
      renderer.setRenderTarget(proof); renderer.render(scene, camera); renderer.readRenderTargetPixels(proof, 0, 0, 24, 24, pixels);
    } finally { renderer.setRenderTarget(null); proof.dispose(); }
    let litPixels = 0;
    for (let i = 0; i < pixels.length; i += 4) if (pixels[i + 3] > 30 && pixels[i] + pixels[i + 1] + pixels[i + 2] > 30) litPixels++;
    if (litPixels < 4 || renderer.getContext().isContextLost()) throw new Error('empty-frame');
    draw();
    if (disposed) return;
    ready = true; host.dataset.ready = 'true'; host.dataset.model = 'textured-cobra'; host.dataset.proof = 'verified'; host.dataset.state = 'ready';
    host.setAttribute('aria-busy', 'false'); host.classList.add('is-live'); fallback.hidden = true;
    mode(false); buttons.forEach(button => { button.disabled = false; });
    resizeObserver = new ResizeObserver(resize); resizeObserver.observe(host);
    viewportObserver = new IntersectionObserver(entries => { visible = entries[0].isIntersecting; if (visible) draw(); else stop(); });
    viewportObserver.observe(host);
    on(document, 'visibilitychange', () => { if (document.hidden) stop(); else draw(); });
    on(motion, 'change', () => {
      controls.enableDamping = !motion.matches;
      if (motion.matches) {
        if (tween) { camera.position.copy(tween.to); controls.target.copy(tween.targetTo); tween = null; }
        limits(); controls.update(); stop(); draw();
      }
    });
  } catch (error) {
    fail(error.message === 'empty-frame' ? 'Thiết bị chưa vẽ được 3D. Ảnh thay thế vẫn hiển thị.' : 'Chưa tải được mô hình 3D. Bạn có thể thử lại.');
  }
}

window.addEventListener('pagehide', event => { if (!event.persisted) { generation++; active?.dispose(); } });
start();
