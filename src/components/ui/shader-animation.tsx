import { useEffect, useRef } from 'react'
import * as THREE from 'three'

export function ShaderAnimation() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const camera = new THREE.Camera()
    camera.position.z = 1

    const scene = new THREE.Scene()
    const geometry = new THREE.PlaneGeometry(2, 2)

    const uniforms = {
      time: { value: 0.0 },
      resolution: { value: new THREE.Vector2(container.clientWidth, container.clientHeight) },
    }

    const material = new THREE.ShaderMaterial({
      uniforms,
      vertexShader: `
        void main() {
          gl_Position = vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        precision highp float;
        uniform vec2 resolution;
        uniform float time;

        // Simplex-like noise
        vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
        vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
        vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }

        float snoise(vec2 v) {
          const vec4 C = vec4(0.211324865405187, 0.366025403784439,
                             -0.577350269189626, 0.024390243902439);
          vec2 i = floor(v + dot(v, C.yy));
          vec2 x0 = v - i + dot(i, C.xx);
          vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
          vec4 x12 = x0.xyxy + C.xxzz;
          x12.xy -= i1;
          i = mod289(i);
          vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
          vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
          m = m*m;
          m = m*m;
          vec3 x = 2.0 * fract(p * C.www) - 1.0;
          vec3 h = abs(x) - 0.5;
          vec3 ox = floor(x + 0.5);
          vec3 a0 = x - ox;
          m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);
          vec3 g;
          g.x = a0.x * x0.x + h.x * x0.y;
          g.yz = a0.yz * x12.xz + h.yz * x12.yw;
          return 130.0 * dot(m, g);
        }

        void main() {
          vec2 uv = gl_FragCoord.xy / resolution.xy;
          vec2 p = uv * 2.0 - 1.0;
          p.x *= resolution.x / resolution.y;

          float t = time * 0.15;

          // Layered noise for atmosphere
          float n1 = snoise(p * 1.2 + vec2(t * 0.3, t * 0.2));
          float n2 = snoise(p * 2.5 + vec2(-t * 0.2, t * 0.4));
          float n3 = snoise(p * 4.0 + vec2(t * 0.1, -t * 0.3));

          float combined = n1 * 0.5 + n2 * 0.3 + n3 * 0.2;

          // Deep space dark base with cyan/teal accents
          vec3 darkBase = vec3(0.008, 0.016, 0.035);
          vec3 cyan = vec3(0.05, 0.55, 0.88);
          vec3 teal = vec3(0.02, 0.65, 0.70);
          vec3 deepBlue = vec3(0.02, 0.08, 0.22);

          // Vignette
          float vignette = 1.0 - dot(p * 0.5, p * 0.5);
          vignette = smoothstep(0.0, 1.0, vignette);

          // Subtle glow spots
          float glow1 = exp(-length(p - vec2(0.4, 0.3)) * 3.0) * 0.15;
          float glow2 = exp(-length(p + vec2(0.3, 0.2)) * 4.0) * 0.10;

          float colorMix = combined * 0.5 + 0.5;
          vec3 color = mix(darkBase, mix(cyan, teal, colorMix), colorMix * 0.12 * vignette);
          color += deepBlue * (1.0 - colorMix) * 0.08;
          color += cyan * glow1;
          color += teal * glow2;

          // Scanline effect (very subtle)
          float scanline = sin(gl_FragCoord.y * 0.8) * 0.003;
          color += scanline;

          // Grid dots at intersections
          vec2 gridUV = fract(uv * 20.0);
          float gridDot = smoothstep(0.92, 1.0, max(gridUV.x, gridUV.y));
          color += vec3(0.05, 0.3, 0.5) * gridDot * 0.04;

          gl_FragColor = vec4(color, 1.0);
        }
      `,
    })

    const mesh = new THREE.Mesh(geometry, material)
    scene.add(mesh)

    let renderer: THREE.WebGLRenderer
    try {
      renderer = new THREE.WebGLRenderer({ antialias: false, alpha: false })
    } catch {
      // WebGL not supported – show fallback gradient
      return
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5))
    renderer.setSize(container.clientWidth, container.clientHeight)
    container.appendChild(renderer.domElement)

    let animFrameId: number
    const animate = () => {
      animFrameId = requestAnimationFrame(animate)
      uniforms.time.value += 0.016
      renderer!.render(scene, camera)
    }
    animate()

    const handleResize = () => {
      if (!container) return
      renderer!.setSize(container.clientWidth, container.clientHeight)
      uniforms.resolution.value.set(container.clientWidth, container.clientHeight)
    }
    window.addEventListener('resize', handleResize)

    return () => {
      cancelAnimationFrame(animFrameId)
      window.removeEventListener('resize', handleResize)
      if (renderer) {
        if (container && renderer.domElement.parentNode === container) {
          container.removeChild(renderer.domElement)
        }
        renderer.dispose()
      }
      material.dispose()
      geometry.dispose()
    }
  }, [])

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 w-full h-full"
      style={{
        overflow: 'hidden',
        background: 'radial-gradient(ellipse at 30% 30%, hsl(199 89% 48% / 0.12) 0%, hsl(222 47% 4%) 70%)',
      }}
    />
  )
}
