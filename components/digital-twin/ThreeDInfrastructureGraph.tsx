'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import gsap from 'gsap';
import { useInfrastructureStore } from '@/lib/store';

interface Node3D {
  id: string;
  name: string;
  status: string;
  health: number;
  x: number;
  y: number;
  z: number;
}

interface Edge3D {
  from: string;
  to: string;
  strength: string;
}

interface ThreeDGraphProps {
  nodesData: Array<{ id: string; name: string; status: string; health: number; dependencies: number; latency: number }>;
  dependenciesData: Array<{ from: string; to: string; strength: string }>;
}

export function ThreeDInfrastructureGraph({ nodesData, dependenciesData }: ThreeDGraphProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { setSelectedNode, setHoveredNode, selectedNodeId } = useInfrastructureStore();

  useEffect(() => {
    if (!containerRef.current) return;

    // --- Scene Setup ---
    const width = containerRef.current.clientWidth || 800;
    const height = containerRef.current.clientHeight || 500;
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x050816);
    scene.fog = new THREE.FogExp2(0x050816, 0.005);

    // --- Camera Setup ---
    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
    camera.position.set(0, 50, 150);

    // --- Renderer Setup ---
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    containerRef.current.appendChild(renderer.domElement);

    // --- Lights ---
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0x06b6d4, 0.8);
    dirLight1.position.set(100, 100, 50);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0x8b5cf6, 0.6);
    dirLight2.position.set(-100, -100, 50);
    scene.add(dirLight2);

    // --- Cyber Particles Field ---
    const particleCount = 150;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i += 3) {
      particlePositions[i] = (Math.random() - 0.5) * 300;
      particlePositions[i + 1] = (Math.random() - 0.5) * 200;
      particlePositions[i + 2] = (Math.random() - 0.5) * 300;
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0x06b6d4,
      size: 1.5,
      transparent: true,
      opacity: 0.5,
      blending: THREE.AdditiveBlending,
    });

    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // --- Graph Nodes Positioning & Instantiation ---
    const nodes: Node3D[] = [];
    const meshes: THREE.Mesh[] = [];

    // Map 2D nodes to spread out in a 3D coordinate space
    const radius = 50;
    nodesData.forEach((n, index) => {
      const theta = (index / nodesData.length) * Math.PI * 2;
      const x = Math.cos(theta) * radius + (Math.random() - 0.5) * 10;
      const y = (Math.random() - 0.5) * 25;
      const z = Math.sin(theta) * radius + (Math.random() - 0.5) * 10;

      nodes.push({ id: n.id, name: n.name, status: n.status, health: n.health, x, y, z });

      // Determine Node Color supporting Sandbox simulation overlays
      let color = 0x3b82f6; // Default Blue
      if ((n as any).isSimulatedAdded) {
        color = 0x8b5cf6; // Proposed State (Purple)
      } else if ((n as any).isSimulatedCompromised || (n as any).isSimulatedImpacted) {
        color = 0xef4444; // Negative Impact (Red)
      } else if ((n as any).isSimulatedImproved) {
        color = 0x10b981; // Improvement / Gateway check (Green)
      } else if ((n as any).zombie_classification === 'Zombie API') {
        color = 0xef4444; // Red = Zombie
      } else if ((n as any).documentation_status === 'Undocumented') {
        color = 0xf59e0b; // Yellow = Undocumented
      } else if ((n as any).zombie_classification === 'Shadow API') {
        color = 0x10b981; // Green = Active/Shadow
      } else if (n.status === 'Degraded') {
        color = 0xf59e0b; // Amber
      } else if (n.status === 'Critical') {
        color = 0xef4444; // Red
      } else if (n.status === 'quarantined') {
        color = 0x8b5cf6; // Purple
      } else {
        // Fallback category color mapping
        switch ((n as any).type) {
          case 'Frontend': color = 0x3b82f6; break;
          case 'Gateway': color = 0x8b5cf6; break;
          case 'Security': color = 0xec4899; break;
          case 'Database': color = 0x10b981; break;
          case 'External Integration': color = 0x06b6d4; break;
          default: color = 0xf59e0b;
        }
      }

      // Build Node Spheres with a holographic Wireframe Ring
      const geo = new THREE.SphereGeometry(4, 32, 32);
      const mat = new THREE.MeshPhongMaterial({
        color,
        emissive: color,
        emissiveIntensity: 0.3,
        shininess: 100,
        transparent: true,
        opacity: 0.8,
      });

      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(x, y, z);
      mesh.userData = { id: n.id, name: n.name, originalColor: color };
      scene.add(mesh);
      meshes.push(mesh);

      // Node ring
      const ringGeo = new THREE.RingGeometry(6, 6.3, 30);
      const ringMat = new THREE.MeshBasicMaterial({ color, side: THREE.DoubleSide, transparent: true, opacity: 0.3 });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.position.set(x, y, z);
      ring.rotation.x = Math.PI / 2;
      scene.add(ring);
      mesh.add(ring); // Attach ring to sphere
    });

    // --- Build Graph Edges (Connection Lines) ---
    const edgePoints: THREE.Vector3[][] = [];
    const threatSpheres: THREE.Mesh[] = [];

    dependenciesData.forEach((dep) => {
      const fromNode = nodes.find((n) => n.id === dep.from);
      const toNode = nodes.find((n) => n.id === dep.to);

      if (fromNode && toNode) {
        const p1 = new THREE.Vector3(fromNode.x, fromNode.y, fromNode.z);
        const p2 = new THREE.Vector3(toNode.x, toNode.y, toNode.z);
        edgePoints.push([p1, p2]);

        // Custom Sandbox Edge coloring in 3D WebGL
        let edgeColor = 0x3b82f6; // Default Blue
        let edgeOpacity = 0.35;

        if ((dep as any).isSimulatedAdded) {
          edgeColor = 0x8b5cf6; // Purple Proposed
          edgeOpacity = 0.6;
        } else if ((dep as any).isSimulatedAttackPath) {
          edgeColor = 0xef4444; // Red Attacking
          edgeOpacity = 0.95;
        } else if ((dep as any).isSimulatedSevered) {
          edgeColor = 0xef4444; // Red Severed
          edgeOpacity = 0.15;
        }

        const lineGeo = new THREE.BufferGeometry().setFromPoints([p1, p2]);
        const lineMaterial = new THREE.LineBasicMaterial({
          color: edgeColor,
          transparent: true,
          opacity: edgeOpacity,
          blending: THREE.AdditiveBlending,
        });
        const line = new THREE.Line(lineGeo, lineMaterial);
        scene.add(line);

        // Add Threat signal pulse indicator spheres traversing lines (active for degraded/compromised paths)
        const isAttack = (dep as any).isSimulatedAttackPath;
        if (isAttack || fromNode.status === 'Critical' || toNode.status === 'Critical') {
          const threatGeo = new THREE.SphereGeometry(isAttack ? 1.2 : 0.8, 8, 8);
          const threatMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });
          const tSphere = new THREE.Mesh(threatGeo, threatMat);
          tSphere.position.copy(p1);
          scene.add(tSphere);
          threatSpheres.push(tSphere);

          // GSAP animate threat signal along the line path
          gsap.to(tSphere.position, {
            x: p2.x,
            y: p2.y,
            z: p2.z,
            duration: isAttack ? 1.3 : (3 + Math.random() * 2), // Faster pulses along attack vectors
            repeat: -1,
            ease: 'none',
          });
        }
      }
    });

    // --- Raycasting / Interaction ---
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handleMouseMove = (event: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(meshes);

      if (intersects.length > 0) {
        const hoveredMesh = intersects[0].object as THREE.Mesh;
        setHoveredNode(hoveredMesh.userData.id);
        document.body.style.cursor = 'pointer';

        // Scale up node on hover
        gsap.to(hoveredMesh.scale, { x: 1.3, y: 1.3, z: 1.3, duration: 0.2 });
      } else {
        setHoveredNode(null);
        document.body.style.cursor = 'default';

        // Reset scales
        meshes.forEach((m) => {
          gsap.to(m.scale, { x: 1, y: 1, z: 1, duration: 0.2 });
        });
      }
    };

    const handleClick = (event: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(meshes);

      if (intersects.length > 0) {
        const clickedMesh = intersects[0].object as THREE.Mesh;
        const nodeId = clickedMesh.userData.id;
        setSelectedNode(nodeId);

        // Visual flash animation on selected node
        const material = clickedMesh.material as THREE.MeshPhongMaterial;
        gsap.to(material, {
          emissiveIntensity: 1.0,
          duration: 0.15,
          yoyo: true,
          repeat: 1,
          onComplete: () => {
            gsap.to(material, { emissiveIntensity: 0.3, duration: 0.2 });
          },
        });

        // Dynamic Camera pan to target node
        gsap.to(camera.position, {
          x: clickedMesh.position.x,
          y: clickedMesh.position.y + 15,
          z: clickedMesh.position.z + 65,
          duration: 1.2,
          ease: 'power2.out',
        });
      }
    };

    containerRef.current.addEventListener('mousemove', handleMouseMove);
    containerRef.current.addEventListener('click', handleClick);

    // --- Animation Loop ---
    let animationId: number;
    let time = 0;

    const animate = () => {
      animationId = requestAnimationFrame(animate);
      time += 0.005;

      // Slow orbital rotate of entire scene for cinematic style
      scene.rotation.y = time * 0.2;

      // Gentle floating nodes sine-wave bounce
      meshes.forEach((mesh, idx) => {
        mesh.position.y += Math.sin(time + idx) * 0.05;
      });

      // Slowly rotate particle field
      particles.rotation.y = -time * 0.05;

      renderer.render(scene, camera);
    };

    animate();

    // --- Resize handler ---
    const handleResize = () => {
      if (!containerRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    // --- Cleanup ---
    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', handleResize);
      if (containerRef.current) {
        containerRef.current.removeEventListener('mousemove', handleMouseMove);
        containerRef.current.removeEventListener('click', handleClick);
        // eslint-disable-next-line react-hooks/exhaustive-deps
        containerRef.current.removeChild(renderer.domElement);
      }
      scene.clear();
    };
  }, [nodesData, dependenciesData, setSelectedNode, setHoveredNode]);

  return (
    <div className="relative w-full h-full min-h-[450px] overflow-hidden">
      {/* 3D WebGL Canvas Container */}
      <div ref={containerRef} className="w-full h-full absolute inset-0 cursor-grab active:cursor-grabbing" />

      {/* Cyber overlay text */}
      <div className="absolute top-4 left-4 pointer-events-none z-10 font-mono text-[10px] text-cyber-cyan/60 space-y-1 bg-black/40 p-2 rounded backdrop-blur-md">
        <div>COGNITIVE SHADER: WEBGL_CORE_3D</div>
        <div>MATRIX RENDERING: STABLE</div>
        <div>ACTIVE ENGINE CORRELATION: ACTIVE</div>
      </div>
    </div>
  );
}
