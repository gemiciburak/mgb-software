'use client';

import { shaderMaterial } from '@react-three/drei';
import { Canvas, extend, useFrame, useThree } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useTheme } from '@/hooks/use-theme';
import {
  fieldFor,
  frameSegments,
  gatherPulse,
  INK_GLSL,
  INK_VARIANTS,
  offsetXFor,
  type Field,
  type GridConfig,
  type InkVariant,
  type InkVariantName,
} from '@/lib/ink-field';

/**
 * three r183, `THREE.Clock`'u deprecated işaretledi; @react-three/fiber 9.8.1
 * (en son kararlı sürüm, React 19.3 peer kısıtı yüzünden v10'a geçilemiyor)
 * ise her canvas'ta koşulsuz bir Clock kuruyor. Bizim kodumuz Clock kullanmıyor
 * (bkz. InkScene'deki kendi saatimiz), uyarı her ziyaretçinin konsoluna düşen
 * gürültüden ibaret.
 *
 * three'nin resmî `setConsoleFunction` kancasıyla YALNIZCA bu mesaj elenir;
 * diğer her log/uyarı/hata aynen konsola gider. R3F Timer'a geçtiğinde bu blok
 * silinmeli.
 */
const IGNORED_THREE_MESSAGES = ['THREE.Clock: This module has been deprecated'];

THREE.setConsoleFunction((type, message, ...params) => {
  if (IGNORED_THREE_MESSAGES.some((ignored) => message.startsWith(ignored))) return;
  console[type](message, ...params);
});

/* ---------------------------------------------------------------------------
   Shader — lib/ink-field.ts içindeki TypeScript alanının GPU karşılığı.
   --------------------------------------------------------------------------- */

const vertexShader = /* glsl */ `
  uniform float uTime;
  uniform float uAmplitude;
  uniform float uGather;
  uniform vec2  uPointer;
  uniform float uPointerStrength;

  varying float vInk;
  varying float vFade;

  ${INK_GLSL}

  void main() {
    vec2 p = position.xy;
    float elevation = inkElevation(p, uTime);

    // İmleç yakınında yumuşak bir kabarma — mürekkebe dokunmak gibi.
    float distanceToPointer = distance(p, uPointer);
    elevation += exp(-distanceToPointer * distanceToPointer * 1.6) * uPointerStrength;

    // Toparlanma: genlik neredeyse sıfıra iner, çizgiler düzenli grid'e oturur.
    float amplitude = mix(uAmplitude, uAmplitude * 0.05, uGather);

    vInk = abs(elevation);
    vFade = inkFade(p);

    gl_Position = projectionMatrix * modelViewMatrix * vec4(p, elevation * amplitude, 1.0);
  }
`;

const fragmentShader = /* glsl */ `
  uniform vec3  uNeutral;
  uniform vec3  uAccent;
  uniform float uOpacity;
  uniform float uGather;
  uniform float uAccentOnly;

  varying float vInk;
  varying float vFade;

  void main() {
    // Mürekkep yoğunluğu arttıkça çizgi nötrden vurgu rengine kayar.
    // Eşik yüksek tutuldu: vurgu rengi yalnızca gerçek tepelerde görünür,
    // yüzeyin geneli nötr hairline olarak kalır.
    float density = smoothstep(0.35, 0.95, vInk);
    vec3 color = mix(uNeutral, uAccent, max(density, uAccentOnly));

    // Taban alfa bilinçli olarak yüksek: WebGL 1px çizgileri kenar yumuşatma
    // nedeniyle komşu piksellere yayılıyor ve etkin opaklık yarıya kadar
    // düşüyor. Ölçümle doğrulandı — düşük tabanla koyu temada çizgiler
    // zeminden yalnızca 1-4/255 sapıyordu, yani görünmüyordu.
    // Toparlanma sırasında yüzey geri çekilir, arayüz çerçevesi öne çıkar.
    float surface = (0.62 + 0.38 * density) * (1.0 - 0.42 * uGather);
    float alpha = uOpacity * vFade * mix(surface, 1.0, uAccentOnly);

    if (alpha < 0.004) discard;
    gl_FragColor = vec4(color, alpha);
  }
`;

const InkLineMaterial = extend(
  shaderMaterial(
    {
      uTime: 0,
      uAmplitude: 0.62,
      uGather: 0,
      uPointer: new THREE.Vector2(0, 0),
      uPointerStrength: 0,
      uNeutral: new THREE.Color('#7b88a6'),
      uAccent: new THREE.Color('#5888ff'),
      uOpacity: 0.95,
      uAccentOnly: 0,
      uField: new THREE.Vector2(1.5, 1.02),
      uFadeX: new THREE.Vector2(0.42, 0.95),
      uFadeY: new THREE.Vector2(0.4, 0.95),
    },
    vertexShader,
    fragmentShader,
  ),
);

/* ---------------------------------------------------------------------------
   Geometri
   --------------------------------------------------------------------------- */

function geometryFromPositions(positions: number[]): THREE.BufferGeometry {
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  return geometry;
}

/**
 * Prop olarak verilen geometriyi R3F kendisi bırakmıyor. Geometri yeniden
 * kurulduğunda (ör. pencere 768px eşiğini geçip grid seyreldiğinde) eskisi
 * GPU belleğinde kalıyordu; yenisi gelince ya da sahne sökülünce bırakılır.
 */
function useDisposable(geometry: THREE.BufferGeometry): THREE.BufferGeometry {
  useEffect(() => () => geometry.dispose(), [geometry]);
  return geometry;
}

/**
 * Yatay ve dikey çizgilerden oluşan grid.
 *
 * `PlaneGeometry` + `wireframe` yerine elle kurulmuş `LineSegments`
 * kullanılıyor: wireframe modu üçgenlerin köşegenlerini de çizer ve teknik
 * çizim yerine "poligon mesh" görüntüsü verir. Burada yalnızca dik çizgiler
 * var — blueprint dili bu. Z değeri vertex shader'da hesaplanır.
 */
function useGridGeometry({ rows, cols, samples }: GridConfig, field: Field) {
  const { halfWidth: hw, halfHeight: hh } = field;

  const geometry = useMemo(() => {
    const positions: number[] = [];

    for (let r = 0; r < rows; r += 1) {
      const y = -hh + (2 * hh * r) / (rows - 1);
      for (let i = 0; i < samples - 1; i += 1) {
        positions.push(
          -hw + (2 * hw * i) / (samples - 1),
          y,
          0,
          -hw + (2 * hw * (i + 1)) / (samples - 1),
          y,
          0,
        );
      }
    }

    for (let c = 0; c < cols; c += 1) {
      const x = -hw + (2 * hw * c) / (cols - 1);
      for (let i = 0; i < samples - 1; i += 1) {
        positions.push(
          x,
          -hh + (2 * hh * i) / (samples - 1),
          0,
          x,
          -hh + (2 * hh * (i + 1)) / (samples - 1),
          0,
        );
      }
    }

    return geometryFromPositions(positions);
  }, [rows, cols, samples, hw, hh]);

  return useDisposable(geometry);
}

/**
 * Arayüz çerçevesi. Her parça alt bölümlere ayrılır ki çözülme sırasında
 * yüzeyle birlikte bükülsün; toparlandığında düz ve okunur hale gelir.
 */
function useFrameGeometry(variant: InkVariant, subdivisions: number) {
  const geometry = useMemo(() => {
    const positions: number[] = [];

    for (const [x1, y1, x2, y2] of frameSegments(variant)) {
      for (let i = 0; i < subdivisions; i += 1) {
        const t0 = i / subdivisions;
        const t1 = (i + 1) / subdivisions;
        positions.push(
          x1 + (x2 - x1) * t0,
          y1 + (y2 - y1) * t0,
          0,
          x1 + (x2 - x1) * t1,
          y1 + (y2 - y1) * t1,
          0,
        );
      }
    }

    return geometryFromPositions(positions);
  }, [variant, subdivisions]);

  return useDisposable(geometry);
}

/* ---------------------------------------------------------------------------
   Sahne
   --------------------------------------------------------------------------- */

/** Tema başına çizgi renkleri ve toplam opaklık. */
const PALETTE = {
  dark: { neutral: '#7b88a6', accent: '#5888ff', opacity: 0.95 },
  light: { neutral: '#a8a598', accent: '#1f46e0', opacity: 0.72 },
} as const;

type InkMaterial = THREE.ShaderMaterial & {
  uTime: number;
  uGather: number;
  uPointer: THREE.Vector2;
  uPointerStrength: number;
  uOpacity: number;
  uField: THREE.Vector2;
  uFadeX: THREE.Vector2;
  uFadeY: THREE.Vector2;
};

function InkScene({
  variant,
  compact,
  pointerEnabled,
  scrollFade,
}: {
  variant: InkVariant;
  compact: boolean;
  pointerEnabled: boolean;
  /** Hero'da scroll ilerledikçe yüzey sönümlenir; şeritte gerekmez. */
  scrollFade: boolean;
}) {
  const { resolved } = useTheme();
  const palette = PALETTE[resolved];

  const size = useThree((state) => state.size);
  const aspect = size.width / Math.max(size.height, 1);
  const field = fieldFor(variant, aspect);
  const offsetX = offsetXFor(variant, aspect);

  const gridGeometry = useGridGeometry(compact ? variant.grid.mobile : variant.grid.desktop, field);
  const frameGeometry = useFrameGeometry(variant, 10);

  const surfaceMaterial = useRef<InkMaterial>(null);
  const frameMaterial = useRef<InkMaterial>(null);
  const smoothPointer = useRef(new THREE.Vector2(0, 0));
  const targetPointer = useRef(new THREE.Vector2(0, 0));

  const neutralColor = useMemo(() => new THREE.Color(palette.neutral), [palette.neutral]);
  const accentColor = useMemo(() => new THREE.Color(palette.accent), [palette.accent]);
  const fieldVector = useMemo(
    () => new THREE.Vector2(field.halfWidth, field.halfHeight),
    [field.halfWidth, field.halfHeight],
  );
  const fadeXVector = useMemo(
    () => new THREE.Vector2(variant.fadeX[0], variant.fadeX[1]),
    [variant.fadeX],
  );
  const fadeYVector = useMemo(
    () => new THREE.Vector2(variant.fadeY[0], variant.fadeY[1]),
    [variant.fadeY],
  );

  /**
   * Kendi saatimiz. R3F'nin `clock.elapsedTime`'ı duvar saatini izliyor:
   * `frameloop="never"` ile duraklayan döngü sürdürüldüğünde aradaki süre
   * tek karede ekleniyor ve yüzey bir anda başka bir şekle atlıyordu.
   * Delta kırpılarak biriktirilince döngü kaldığı yerden devam eder.
   */
  const elapsed = useRef(0);

  useFrame((state, delta) => {
    elapsed.current += Math.min(delta, 0.1);
    const time = elapsed.current + variant.timeOffset;
    const gather = gatherPulse(time);

    // İmleci yumuşatarak takip et — ani sıçrama yerine mürekkep gibi gecikmeli.
    if (pointerEnabled) {
      targetPointer.current.set(
        state.pointer.x * field.halfWidth,
        state.pointer.y * field.halfHeight,
      );
      smoothPointer.current.lerp(targetPointer.current, 0.06);
    }

    const fade = scrollFade
      ? 1 - Math.min(window.scrollY / Math.max(window.innerHeight, 1), 1) * 0.85
      : 1;

    for (const material of [surfaceMaterial.current, frameMaterial.current]) {
      if (!material) continue;
      material.uTime = time;
      material.uGather = gather;
      material.uPointer.copy(smoothPointer.current);
      material.uPointerStrength = pointerEnabled ? 0.22 : 0;
    }

    if (surfaceMaterial.current) {
      surfaceMaterial.current.uOpacity = palette.opacity * fade;
    }
    if (frameMaterial.current) {
      // Çerçeve yalnızca toparlanma anında belirir.
      frameMaterial.current.uOpacity = gather * variant.frameOpacity * fade;
    }
  });

  const shared = {
    transparent: true,
    depthWrite: false,
    uAmplitude: variant.amplitude,
    uField: fieldVector,
    uFadeX: fadeXVector,
    uFadeY: fadeYVector,
  };

  return (
    <group
      rotation={[variant.rotation.x, variant.rotation.y, 0]}
      position={[offsetX, variant.offsetY, 0]}
    >
      <lineSegments geometry={gridGeometry}>
        <InkLineMaterial
          ref={surfaceMaterial}
          {...shared}
          uNeutral={neutralColor}
          uAccent={accentColor}
          uOpacity={palette.opacity}
        />
      </lineSegments>

      <lineSegments geometry={frameGeometry}>
        <InkLineMaterial
          ref={frameMaterial}
          {...shared}
          uNeutral={accentColor}
          uAccent={accentColor}
          uOpacity={0}
          uAccentOnly={1}
        />
      </lineSegments>
    </group>
  );
}

/**
 * Mürekkep yüzeyinin canvas katmanı.
 *
 * `active` false olduğunda `frameloop="never"` ile render döngüsü tamamen
 * durur — bölüm ekrandan çıktığında veya sekme arkaya atıldığında CPU/GPU
 * harcanmaz. Mobilde grid seyreltilir ve DPR 1.5'te sınırlanır.
 */
export function InkSurface({
  variant: variantName,
  active,
  compact,
  pointerEnabled,
  onReady,
}: {
  variant: InkVariantName;
  active: boolean;
  compact: boolean;
  pointerEnabled: boolean;
  /** Renderer kurulduğunda çağrılır; statik görselin sönümlenmesini tetikler. */
  onReady: () => void;
}) {
  const variant = INK_VARIANTS[variantName];

  return (
    <Canvas
      frameloop={active ? 'always' : 'never'}
      dpr={[1, compact ? 1.5 : 2]}
      // Dekoratif arka plan: çift GPU'lu dizüstülerde ayrık GPU'yu uyandırıp pili
      // tüketmesin diye tarayıcının varsayılan seçimine bırakılır.
      gl={{ antialias: true, alpha: true, powerPreference: 'default' }}
      camera={{ position: [0, 0, variant.camera.z], fov: variant.camera.fov }}
      style={{ width: '100%', height: '100%' }}
      onCreated={onReady}
    >
      <InkScene
        variant={variant}
        compact={compact}
        pointerEnabled={pointerEnabled}
        scrollFade={variantName === 'hero'}
      />
    </Canvas>
  );
}
