import * as THREE from 'three';

// The source has a continuous skin mesh. Keep its UVs and neck intact while
// giving the head a little more volume, with a smooth transition at the nape.
export function refineCobra(model) {
  let skin;
  model.traverse(object => { if (object.isMesh && object.name.startsWith('Continuous')) skin = object; });
  if (!skin) throw new Error('cobra-skin-missing');
  const detail = new THREE.Group();
  detail.name = 'Facial anatomy';
  detail.quaternion.copy(skin.quaternion);
  skin.parent.add(detail);
  const probe = new THREE.Mesh(skin.geometry, new THREE.MeshBasicMaterial({ side: THREE.DoubleSide }));
  probe.updateMatrixWorld();
  const ray = new THREE.Raycaster();
  function surface(x, y, side) {
    ray.set(new THREE.Vector3(x, y, side * 0.08), new THREE.Vector3(0, 0, -side));
    return ray.intersectObject(probe, false)[0];
  }
  function mesh(geometry, material, position, scale, normal) {
    const object = new THREE.Mesh(geometry, material);
    if (position) object.position.copy(position);
    if (scale) object.scale.copy(scale);
    if (normal) object.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), normal);
    object.updateMatrix();
    geometry.applyMatrix4(object.matrix);
    object.position.set(0, 0, 0); object.quaternion.identity(); object.scale.set(1, 1, 1);
    detail.add(object);
    return object;
  }
  const irisCanvas = document.createElement('canvas');
  irisCanvas.width = irisCanvas.height = 128;
  const ctx = irisCanvas.getContext('2d');
  const gradient = ctx.createRadialGradient(64, 64, 12, 64, 64, 63);
  gradient.addColorStop(0, '#bc8739'); gradient.addColorStop(0.6, '#8e642a'); gradient.addColorStop(1, '#302518');
  ctx.fillStyle = gradient; ctx.fillRect(0, 0, 128, 128);
  for (let i = 0; i < 180; i++) {
    const angle = i * Math.PI * 2 / 180, inner = 23 + Math.sin(i * 17) * 6;
    ctx.strokeStyle = i % 3 ? 'rgba(46,29,12,.44)' : 'rgba(227,184,93,.48)';
    ctx.lineWidth = 0.6;
    ctx.beginPath(); ctx.moveTo(64 + Math.cos(angle) * inner, 64 + Math.sin(angle) * inner);
    ctx.lineTo(64 + Math.cos(angle + 0.012) * 61, 64 + Math.sin(angle + 0.012) * 61); ctx.stroke();
  }
  const irisMap = new THREE.CanvasTexture(irisCanvas); irisMap.colorSpace = THREE.SRGBColorSpace;
  const eyeMaterial = new THREE.MeshPhysicalMaterial({ color: 0x45331e, roughness: 0.2, clearcoat: 1, clearcoatRoughness: 0.1 });
  const irisMaterial = new THREE.MeshPhysicalMaterial({ map: irisMap, roughness: 0.28, clearcoat: 1, clearcoatRoughness: 0.08 });
  const black = new THREE.MeshPhysicalMaterial({ color: 0x090b08, roughness: 0.15, clearcoat: 1 });
  const glint = new THREE.MeshBasicMaterial({ color: 0xfff8db });
  const crease = new THREE.MeshStandardMaterial({ color: 0x382719, roughness: 0.8 });
  const rim = new THREE.MeshStandardMaterial({ color: 0x8c6d3c, roughness: 0.66 });
  skin.parent.children.forEach(object => {
    if (/iris|pupil|nostril/i.test(object.name)) object.visible = false;
  });
  for (const side of [-1, 1]) {
    const hit = surface(0.184, 0.421, side);
    if (hit) {
      const normal = hit.face.normal.clone();
      if (normal.z * side < 0) normal.negate();
      const center = hit.point.clone().addScaledVector(normal, -0.0018);
      mesh(new THREE.SphereGeometry(0.0036, 32, 20), eyeMaterial, center);
      const irisCenter = center.clone().addScaledVector(normal, 0.00315);
      mesh(new THREE.CircleGeometry(0.0024, 48), irisMaterial, irisCenter, null, normal);
      mesh(new THREE.SphereGeometry(1, 24, 12), black, center.clone().addScaledVector(normal, 0.0034), new THREE.Vector3(0.00115, 0.00115, 0.00025), normal);
      mesh(new THREE.SphereGeometry(0.0003, 12, 8), glint, center.clone().addScaledVector(normal, 0.00352).add(new THREE.Vector3(-0.0005, 0.0007, 0)));
    }
    const points = [];
    for (let i = 0; i <= 28; i++) {
      const x = 0.155 + i / 28 * 0.065;
      const y = 0.416 - (x - 0.155) * 0.171;
      const hit = surface(x, y, side);
      if (hit) points.push(hit.point.clone().add(new THREE.Vector3(0, 0, side * 0.00025)));
    }
    if (points.length > 3) {
      const curve = new THREE.CatmullRomCurve3(points);
      mesh(new THREE.TubeGeometry(curve, 72, 0.00025, 6, false), crease);
      const lip = new THREE.CatmullRomCurve3(points.map(p => p.clone().add(new THREE.Vector3(0, -0.00065, 0))));
      mesh(new THREE.TubeGeometry(lip, 72, 0.00013, 5, false), rim);
    }
    const nose = surface(0.210, 0.411, side);
    if (nose) {
      const normal = nose.face.normal.clone(); if (normal.z * side < 0) normal.negate();
      mesh(new THREE.SphereGeometry(1, 20, 12), crease, nose.point.clone().addScaledVector(normal, 0.00015), new THREE.Vector3(0.00165, 0.00085, 0.00045), normal);
    }
  }
  probe.material.dispose();
  function sculpt(geometry) {
    const positions = geometry.attributes.position;
    for (let i = 0; i < positions.count; i++) {
      const x = positions.getX(i), y = positions.getY(i), z = positions.getZ(i);
      const blend = THREE.MathUtils.smoothstep(y, 0.386, 0.412) * THREE.MathUtils.smoothstep(x, 0.09, 0.145);
      positions.setXYZ(i, x + (x - 0.15) * 0.16 * blend, y + (y - 0.413) * 0.15 * blend, z * (1 + 0.42 * blend));
    }
    positions.needsUpdate = true;
    geometry.computeVertexNormals(); geometry.computeBoundingBox(); geometry.computeBoundingSphere();
  }
  sculpt(skin.geometry);
  detail.children.forEach(object => sculpt(object.geometry));
  const head = new THREE.Vector3(0.187, 0.421, 0);
  head.x += (head.x - 0.15) * 0.16; head.y += (head.y - 0.413) * 0.15;
  return { object: detail, center: head, count: detail.children.length };
}
