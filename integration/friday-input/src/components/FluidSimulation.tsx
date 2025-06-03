
'use client';

import React, { useRef, useEffect, useCallback, useState } from 'react';

interface RGBAColor {
  r: number;
  g: number;
  b: number;
  a?: number;
}

interface PointerPrototype {
  id: number;
  texcoordX: number;
  texcoordY: number;
  prevTexcoordX: number;
  prevTexcoordY: number;
  deltaX: number;
  deltaY: number;
  down: boolean;
  moved: boolean;
  color: number[];
}

class Pointer implements PointerPrototype {
  id: number = -1;
  texcoordX: number = 0;
  texcoordY: number = 0;
  prevTexcoordX: number = 0;
  prevTexcoordY: number = 0;
  deltaX: number = 0;
  deltaY: number = 0;
  down: boolean = false;
  moved: boolean = false;
  color: number[] = [30, 0, 300];
}

interface SupportedFormat {
  internalFormat: number; // GLenum
  format: number; // GLenum
}

interface WebGLExtensions {
  formatRGBA: SupportedFormat | null;
  formatRG: SupportedFormat | null;
  formatR: SupportedFormat | null;
  halfFloatTexType: number; // GLenum
  supportLinearFiltering: boolean;
}

interface FBO {
  texture: WebGLTexture;
  fbo: WebGLFramebuffer | null;
  width: number;
  height: number;
  texelSizeX: number;
  texelSizeY: number;
  attach: (id: number) => number;
}

interface DoubleFBO {
  width: number;
  height: number;
  texelSizeX: number;
  texelSizeY: number;
  read: FBO;
  write: FBO;
  swap: () => void;
}

interface TextureAsync {
  texture: WebGLTexture;
  width: number;
  height: number;
  attach: (id: number) => number;
}

class GLProgram {
  uniforms: { [name: string]: WebGLUniformLocation | null } = {};
  program: WebGLProgram;
  gl: WebGL2RenderingContext | WebGLRenderingContext;

  constructor(gl: WebGL2RenderingContext | WebGLRenderingContext, vertexShader: WebGLShader, fragmentShader: WebGLShader) {
    this.gl = gl;
    this.program = createProgramInternal(gl, vertexShader, fragmentShader);
    this.uniforms = getUniformsInternal(gl, this.program);
  }

  bind() {
    this.gl.useProgram(this.program);
  }
}

class Material {
  vertexShader: WebGLShader;
  fragmentShaderSource: string;
  programs: { [hash: number]: WebGLProgram };
  activeProgram: WebGLProgram | null;
  uniforms: { [name: string]: WebGLUniformLocation | null };
  gl: WebGL2RenderingContext | WebGLRenderingContext;

  constructor(gl: WebGL2RenderingContext | WebGLRenderingContext, vertexShader: WebGLShader, fragmentShaderSource: string) {
    this.gl = gl;
    this.vertexShader = vertexShader;
    this.fragmentShaderSource = fragmentShaderSource;
    this.programs = {};
    this.activeProgram = null;
    this.uniforms = {};
  }

  setKeywords(keywords: string[]) {
    let hash = 0;
    for (let i = 0; i < keywords.length; i++)
      hash += hashCodeInternal(keywords[i]);

    let program = this.programs[hash];
    if (program == null) {
      const fragmentShader = compileShaderInternal(this.gl, this.gl.FRAGMENT_SHADER, this.fragmentShaderSource, keywords);
      program = createProgramInternal(this.gl, this.vertexShader, fragmentShader);
      this.programs[hash] = program;
    }

    if (program == this.activeProgram) return;

    this.uniforms = getUniformsInternal(this.gl, program);
    this.activeProgram = program;
  }

  bind() {
    if (this.activeProgram) {
      this.gl.useProgram(this.activeProgram);
    }
  }
}

// Helper functions for WebGL program and shader management (to avoid making them methods of GLProgram/Material for simplicity in porting)
function createProgramInternal(gl: WebGL2RenderingContext | WebGLRenderingContext, vertexShader: WebGLShader, fragmentShader: WebGLShader): WebGLProgram {
  let program = gl.createProgram();
  if (!program) throw new Error("Failed to create GL program");
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS))
    console.trace(gl.getProgramInfoLog(program));

  return program;
}

function getUniformsInternal(gl: WebGL2RenderingContext | WebGLRenderingContext, program: WebGLProgram): { [name: string]: WebGLUniformLocation | null } {
  let uniforms: { [name: string]: WebGLUniformLocation | null } = {};
  let uniformCount = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);
  for (let i = 0; i < uniformCount; i++) {
    const activeUniform = gl.getActiveUniform(program, i);
    if (activeUniform) {
        uniforms[activeUniform.name] = gl.getUniformLocation(program, activeUniform.name);
    }
  }
  return uniforms;
}

function compileShaderInternal(gl: WebGL2RenderingContext | WebGLRenderingContext, type: number, source: string, keywords?: string[] | null): WebGLShader {
  source = addKeywordsInternal(source, keywords);

  const shader = gl.createShader(type);
  if (!shader) throw new Error("Failed to create GL shader");
  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS))
    console.trace(gl.getShaderInfoLog(shader));

  return shader;
};

function addKeywordsInternal(source: string, keywords?: string[] | null): string {
  if (keywords == null) return source;
  let keywordsString = "";
  keywords.forEach(keyword => {
    keywordsString += "#define " + keyword + "\\n";
  });
  return keywordsString + source;
}

function hashCodeInternal(s: string): number {
  if (s.length == 0) return 0;
  let hash = 0;
  for (let i = 0; i < s.length; i++) {
    hash = (hash << 5) - hash + s.charCodeAt(i);
    hash |= 0; // Convert to 32bit integer
  }
  return hash;
};


const FluidSimulation: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const glRef = useRef<WebGL2RenderingContext | WebGLRenderingContext | null>(null);
  const extRef = useRef<WebGLExtensions | null>(null);
  
  const pointers = useRef<Pointer[]>([]);
  const splatStack = useRef<number[]>([]);
  
  const lastUpdateTime = useRef<number>(Date.now());
  const colorUpdateTimer = useRef<number>(0.0);
  const animationFrameId = useRef<number | null>(null);

  // Shader Programs
  const blurProgram = useRef<GLProgram | null>(null);
  const copyProgram = useRef<GLProgram | null>(null);
  const clearProgram = useRef<GLProgram | null>(null);
  const colorProgram = useRef<GLProgram | null>(null);
  const checkerboardProgram = useRef<GLProgram | null>(null);
  const bloomPrefilterProgram = useRef<GLProgram | null>(null);
  const bloomBlurProgram = useRef<GLProgram | null>(null);
  const bloomFinalProgram = useRef<GLProgram | null>(null);
  const sunraysMaskProgram = useRef<GLProgram | null>(null);
  const sunraysProgram = useRef<GLProgram | null>(null);
  const splatProgram = useRef<GLProgram | null>(null);
  const advectionProgram = useRef<GLProgram | null>(null);
  const divergenceProgram = useRef<GLProgram | null>(null);
  const curlProgram = useRef<GLProgram | null>(null);
  const vorticityProgram = useRef<GLProgram | null>(null);
  const pressureProgram = useRef<GLProgram | null>(null);
  const gradienSubtractProgram = useRef<GLProgram | null>(null);
  const displayMaterial = useRef<Material | null>(null);

  // FBOs
  const dye = useRef<DoubleFBO | null>(null);
  const velocity = useRef<DoubleFBO | null>(null);
  const divergenceFBO = useRef<FBO | null>(null); // Renamed from 'divergence' to avoid conflict with program name
  const curlFBO = useRef<FBO | null>(null); // Renamed from 'curl'
  const pressureFBO = useRef<DoubleFBO | null>(null); // Renamed from 'pressure'
  const bloomFBO = useRef<FBO | null>(null); // Renamed from 'bloom'
  const bloomFramebuffers = useRef<FBO[]>([]);
  const sunraysFBO = useRef<FBO | null>(null); // Renamed from 'sunrays'
  const sunraysTempFBO = useRef<FBO | null>(null); // Renamed from 'sunraysTemp'
  
  const ditheringTexture = useRef<TextureAsync | null>(null);

  // Config (mutable part for BACK_COLOR)
  const [config, setConfig] = useState(() => {
    let initialConfig = {
        SIM_RESOLUTION: 128,
        DYE_RESOLUTION: 1024,
        CAPTURE_RESOLUTION: 512,
        DENSITY_DISSIPATION: 1,
        VELOCITY_DISSIPATION: 0.2,
        PRESSURE: 0.8,
        PRESSURE_ITERATIONS: 20,
        CURL: 30,
        SPLAT_RADIUS: 0.25,
        SPLAT_FORCE: 6000,
        SHADING: true,
        COLORFUL: true,
        COLOR_UPDATE_SPEED: 10,
        PAUSED: false,
        BACK_COLOR: { r: 0, g: 0, b: 0 },
        TRANSPARENT: false,
        BLOOM: true, // Defaulting to true as in original, will be overridden if no linear filtering
        BLOOM_ITERATIONS: 8,
        BLOOM_RESOLUTION: 256,
        BLOOM_INTENSITY: 0.8,
        BLOOM_THRESHOLD: 0.6,
        BLOOM_SOFT_KNEE: 0.7,
        SUNRAYS: true, // Defaulting to true, will be overridden
        SUNRAYS_RESOLUTION: 196,
        SUNRAYS_WEIGHT: 1.0,
    };

    if (typeof window !== 'undefined') {
        const storedFluidBackground = localStorage.getItem('FLUID_BACKGROUND');
        if (storedFluidBackground) {
            const parsedColor = parseRgb(storedFluidBackground);
            if (parsedColor) {
                initialConfig.BACK_COLOR = parsedColor;
            }
        }
    }
    return initialConfig;
  });


  const getConfig = useCallback(() => config, [config]);


  // All simulation functions will be defined within useEffect or as useCallback memoized functions
  // if they need access to refs/state and are called from event handlers or other effects.
  // For simplicity of porting, many will be nested in the main useEffect.

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Helper: scaleByPixelRatio
    const scaleByPixelRatio = (input: number): number => {
        const pixelRatio = typeof window !== 'undefined' ? (window.devicePixelRatio || 1) : 1;
        return Math.floor(input * pixelRatio);
    };
    
    // Initial resize
    const initialResizeCanvas = (): boolean => {
        if (!glRef.current) return false;
        let width = scaleByPixelRatio(canvas.clientWidth);
        let height = scaleByPixelRatio(canvas.clientHeight);
        if (canvas.width != width || canvas.height != height) {
            canvas.width = width;
            canvas.height = height;
            return true;
        }
        return false;
    };


    // getWebGLContext
    const getWebGLContext = (canvas: HTMLCanvasElement): { gl: WebGL2RenderingContext | WebGLRenderingContext, ext: WebGLExtensions } => {
        const params = { alpha: true, depth: false, stencil: false, antialias: false, preserveDrawingBuffer: false };

        let gl:any = canvas.getContext("webgl2", params) as WebGL2RenderingContext | null;
        const isWebGL2 = !!gl;
        if (!isWebGL2) {
            gl = (canvas.getContext("webgl", params) || canvas.getContext("experimental-webgl", params)) as WebGLRenderingContext | null;
        }
        if (!gl) throw new Error("WebGL not supported");

        let halfFloatExt: any = null; // OES_texture_half_float
        let supportLinearFilteringExt: any = null; // OES_texture_float_linear or OES_texture_half_float_linear

        if (isWebGL2) {
            (gl as WebGL2RenderingContext).getExtension("EXT_color_buffer_float");
            supportLinearFilteringExt = (gl as WebGL2RenderingContext).getExtension("OES_texture_float_linear");
        } else {
            halfFloatExt = (gl as WebGLRenderingContext).getExtension("OES_texture_half_float");
            supportLinearFilteringExt = (gl as WebGLRenderingContext).getExtension("OES_texture_half_float_linear");
        }

        gl.clearColor(0.0, 0.0, 0.0, 1.0);

        const halfFloatTexType = isWebGL2 ? (gl as WebGL2RenderingContext).HALF_FLOAT : (halfFloatExt ? halfFloatExt.HALF_FLOAT_OES : 0); // Fallback to 0 if ext missing
        
        let formatRGBA: SupportedFormat | null;
        let formatRG: SupportedFormat | null;
        let formatR: SupportedFormat | null;

        if (isWebGL2) {
            const gl2 = gl as WebGL2RenderingContext;
            formatRGBA = getSupportedFormat(gl2, gl2.RGBA16F, gl2.RGBA, halfFloatTexType);
            formatRG = getSupportedFormat(gl2, gl2.RG16F, gl2.RG, halfFloatTexType);
            formatR = getSupportedFormat(gl2, gl2.R16F, gl2.RED, halfFloatTexType);
        } else {
            formatRGBA = getSupportedFormat(gl, gl.RGBA, gl.RGBA, halfFloatTexType);
            formatRG = getSupportedFormat(gl, gl.RGBA, gl.RGBA, halfFloatTexType); // WebGL1 doesn't have RG format directly
            formatR = getSupportedFormat(gl, gl.RGBA, gl.RGBA, halfFloatTexType);  // WebGL1 doesn't have R format directly
        }
        
        // ga("send", "event", isWebGL2 ? "webgl2" : "webgl", formatRGBA == null ? "not supported" : "supported");

        return {
            gl,
            ext: {
                formatRGBA,
                formatRG,
                formatR,
                halfFloatTexType,
                supportLinearFiltering: !!supportLinearFilteringExt
            }
        };
    };

    const getSupportedFormat = (gl: WebGL2RenderingContext | WebGLRenderingContext, internalFormat: number, format: number, type: number): SupportedFormat | null => {
        if (!supportRenderTextureFormat(gl, internalFormat, format, type)) {
            const gl2 = gl as WebGL2RenderingContext; // Assuming WebGL2 for R16F, RG16F etc.
            switch (internalFormat) {
                case gl2.R16F:
                    return getSupportedFormat(gl, gl2.RG16F, gl2.RG, type);
                case gl2.RG16F:
                    return getSupportedFormat(gl, gl2.RGBA16F, gl2.RGBA, type);
                default:
                    return null;
            }
        }
        return { internalFormat, format };
    };

    const supportRenderTextureFormat = (gl: WebGL2RenderingContext | WebGLRenderingContext, internalFormat: number, format: number, type: number): boolean => {
        let texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texImage2D(gl.TEXTURE_2D, 0, internalFormat, 4, 4, 0, format, type, null);

        let fbo = gl.createFramebuffer();
        gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);

        const status = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
        gl.deleteTexture(texture);
        gl.deleteFramebuffer(fbo);
        return status == gl.FRAMEBUFFER_COMPLETE;
    };

    const { gl, ext } = getWebGLContext(canvas);
    glRef.current = gl;
    extRef.current = ext;

    // Update config based on WebGL capabilities
    if (!ext.supportLinearFiltering) {
        setConfig(prevConfig => ({
            ...prevConfig,
            DYE_RESOLUTION: 512,
            SHADING: false,
            BLOOM: false,
            SUNRAYS: false,
        }));
    }
    
    pointers.current = [];
    pointers.current.push(new Pointer());

    // Shader Definitions (as strings)
    const baseVertexShaderSource = `
        precision highp float;
        attribute vec2 aPosition;
        varying vec2 vUv;
        varying vec2 vL;
        varying vec2 vR;
        varying vec2 vT;
        varying vec2 vB;
        uniform vec2 texelSize;
        void main () {
            vUv = aPosition * 0.5 + 0.5;
            vL = vUv - vec2(texelSize.x, 0.0);
            vR = vUv + vec2(texelSize.x, 0.0);
            vT = vUv + vec2(0.0, texelSize.y);
            vB = vUv - vec2(0.0, texelSize.y);
            gl_Position = vec4(aPosition, 0.0, 1.0);
        }
    `;

    const blurVertexShaderSource = `
        precision highp float;
        attribute vec2 aPosition;
        varying vec2 vUv;
        varying vec2 vL;
        varying vec2 vR;
        uniform vec2 texelSize;
        void main () {
            vUv = aPosition * 0.5 + 0.5;
            float offset = 1.33333333;
            vL = vUv - texelSize * offset;
            vR = vUv + texelSize * offset;
            gl_Position = vec4(aPosition, 0.0, 1.0);
        }
    `;
    const blurShaderSource = `
        precision mediump float;
        precision mediump sampler2D;
        varying vec2 vUv;
        varying vec2 vL;
        varying vec2 vR;
        uniform sampler2D uTexture;
        void main () {
            vec4 sum = texture2D(uTexture, vUv) * 0.29411764;
            sum += texture2D(uTexture, vL) * 0.35294117;
            sum += texture2D(uTexture, vR) * 0.35294117;
            gl_FragColor = sum;
        }
    `;
    const copyShaderSource = `
        precision mediump float;
        precision mediump sampler2D;
        varying highp vec2 vUv;
        uniform sampler2D uTexture;
        void main () {
            gl_FragColor = texture2D(uTexture, vUv);
        }
    `;
    const clearShaderSource = `
        precision mediump float;
        precision mediump sampler2D;
        varying highp vec2 vUv;
        uniform sampler2D uTexture;
        uniform float value;
        void main () {
            gl_FragColor = value * texture2D(uTexture, vUv);
        }
    `;
    const colorShaderSource = `
        precision mediump float;
        uniform vec4 color;
        void main () {
            gl_FragColor = color;
        }
    `;
    const checkerboardShaderSource = `
        precision highp float;
        precision highp sampler2D;
        varying vec2 vUv;
        uniform sampler2D uTexture;
        uniform float aspectRatio;
        #define SCALE 25.0
        void main () {
            vec2 uv = floor(vUv * SCALE * vec2(aspectRatio, 1.0));
            float v = mod(uv.x + uv.y, 2.0);
            v = v * 0.1 + 0.8;
            gl_FragColor = vec4(vec3(v), 1.0);
        }
    `;
    const displayShaderSourceText = `
        precision highp float;
        precision highp sampler2D;
        varying vec2 vUv;
        varying vec2 vL;
        varying vec2 vR;
        varying vec2 vT;
        varying vec2 vB;
        uniform sampler2D uTexture;
        uniform sampler2D uBloom;
        uniform sampler2D uSunrays;
        uniform sampler2D uDithering;
        uniform vec2 ditherScale;
        uniform vec2 texelSize;
        vec3 linearToGamma (vec3 color) {
            color = max(color, vec3(0));
            return max(1.055 * pow(color, vec3(0.416666667)) - 0.055, vec3(0));
        }
        void main () {
            vec3 c = texture2D(uTexture, vUv).rgb;
        #ifdef SHADING
            vec3 lc = texture2D(uTexture, vL).rgb;
            vec3 rc = texture2D(uTexture, vR).rgb;
            vec3 tc = texture2D(uTexture, vT).rgb;
            vec3 bc = texture2D(uTexture, vB).rgb;
            float dx = length(rc) - length(lc);
            float dy = length(tc) - length(bc);
            vec3 n = normalize(vec3(dx, dy, length(texelSize)));
            vec3 l = vec3(0.0, 0.0, 1.0);
            float diffuse = clamp(dot(n, l) + 0.7, 0.7, 1.0);
            c *= diffuse;
        #endif
        #ifdef BLOOM
            vec3 bloom = texture2D(uBloom, vUv).rgb;
        #endif
        #ifdef SUNRAYS
            float sunrays = texture2D(uSunrays, vUv).r;
            c *= sunrays;
        #ifdef BLOOM
            bloom *= sunrays;
        #endif
        #endif
        #ifdef BLOOM
            float noise = texture2D(uDithering, vUv * ditherScale).r;
            noise = noise * 2.0 - 1.0;
            bloom += noise / 255.0;
            bloom = linearToGamma(bloom);
            c += bloom;
        #endif
            float a = max(c.r, max(c.g, c.b));
            gl_FragColor = vec4(c, a);
        }
    `;
    const bloomPrefilterShaderSource = `
        precision mediump float;
        precision mediump sampler2D;
        varying vec2 vUv;
        uniform sampler2D uTexture;
        uniform vec3 curve;
        uniform float threshold;
        void main () {
            vec3 c = texture2D(uTexture, vUv).rgb;
            float br = max(c.r, max(c.g, c.b));
            float rq = clamp(br - curve.x, 0.0, curve.y);
            rq = curve.z * rq * rq;
            c *= max(rq, br - threshold) / max(br, 0.0001);
            gl_FragColor = vec4(c, 0.0);
        }
    `;
    const bloomBlurShaderSource = `
        precision mediump float;
        precision mediump sampler2D;
        varying vec2 vL;
        varying vec2 vR;
        varying vec2 vT;
        varying vec2 vB;
        uniform sampler2D uTexture;
        void main () {
            vec4 sum = vec4(0.0);
            sum += texture2D(uTexture, vL);
            sum += texture2D(uTexture, vR);
            sum += texture2D(uTexture, vT);
            sum += texture2D(uTexture, vB);
            sum *= 0.25;
            gl_FragColor = sum;
        }
    `;
    const bloomFinalShaderSource = `
        precision mediump float;
        precision mediump sampler2D;
        varying vec2 vL;
        varying vec2 vR;
        varying vec2 vT;
        varying vec2 vB;
        uniform sampler2D uTexture;
        uniform float intensity;
        void main () {
            vec4 sum = vec4(0.0);
            sum += texture2D(uTexture, vL);
            sum += texture2D(uTexture, vR);
            sum += texture2D(uTexture, vT);
            sum += texture2D(uTexture, vB);
            sum *= 0.25;
            gl_FragColor = sum * intensity;
        }
    `;
    const sunraysMaskShaderSource = `
        precision highp float;
        precision highp sampler2D;
        varying vec2 vUv;
        uniform sampler2D uTexture;
        void main () {
            vec4 c = texture2D(uTexture, vUv);
            float br = max(c.r, max(c.g, c.b));
            c.a = 1.0 - min(max(br * 20.0, 0.0), 0.8);
            gl_FragColor = c;
        }
    `;
    const sunraysShaderSource = `
        precision highp float;
        precision highp sampler2D;
        varying vec2 vUv;
        uniform sampler2D uTexture;
        uniform float weight;
        #define ITERATIONS 16
        void main () {
            float Density = 0.3;
            float Decay = 0.95;
            float Exposure = 0.7;
            vec2 coord = vUv;
            vec2 dir = vUv - 0.5;
            dir *= 1.0 / float(ITERATIONS) * Density;
            float illuminationDecay = 1.0;
            float color = texture2D(uTexture, vUv).a;
            for (int i = 0; i < ITERATIONS; i++)
            {
                coord -= dir;
                float col = texture2D(uTexture, coord).a;
                color += col * illuminationDecay * weight;
                illuminationDecay *= Decay;
            }
            gl_FragColor = vec4(color * Exposure, 0.0, 0.0, 1.0);
        }
    `;
    const splatShaderSource = `
        precision highp float;
        precision highp sampler2D;
        varying vec2 vUv;
        uniform sampler2D uTarget;
        uniform float aspectRatio;
        uniform vec3 color;
        uniform vec2 point;
        uniform float radius;
        void main () {
            vec2 p = vUv - point.xy;
            p.x *= aspectRatio;
            vec3 splat = exp(-dot(p, p) / radius) * color;
            vec3 base = texture2D(uTarget, vUv).xyz;
            gl_FragColor = vec4(base + splat, 1.0);
        }
    `;
    const advectionShaderSource = `
        precision highp float;
        precision highp sampler2D;
        varying vec2 vUv;
        uniform sampler2D uVelocity;
        uniform sampler2D uSource;
        uniform vec2 texelSize;
        uniform vec2 dyeTexelSize;
        uniform float dt;
        uniform float dissipation;
        vec4 bilerp (sampler2D sam, vec2 uv, vec2 tsize) {
            vec2 st = uv / tsize - 0.5;
            vec2 iuv = floor(st);
            vec2 fuv = fract(st);
            vec4 a = texture2D(sam, (iuv + vec2(0.5, 0.5)) * tsize);
            vec4 b = texture2D(sam, (iuv + vec2(1.5, 0.5)) * tsize);
            vec4 c = texture2D(sam, (iuv + vec2(0.5, 1.5)) * tsize);
            vec4 d = texture2D(sam, (iuv + vec2(1.5, 1.5)) * tsize);
            return mix(mix(a, b, fuv.x), mix(c, d, fuv.x), fuv.y);
        }
        void main () {
        #ifdef MANUAL_FILTERING
            vec2 coord = vUv - dt * bilerp(uVelocity, vUv, texelSize).xy * texelSize;
            vec4 result = bilerp(uSource, coord, dyeTexelSize);
        #else
            vec2 coord = vUv - dt * texture2D(uVelocity, vUv).xy * texelSize;
            vec4 result = texture2D(uSource, coord);
        #endif
            float decay = 1.0 + dissipation * dt;
            gl_FragColor = result / decay;
        }`;
    const divergenceShaderSource = `
        precision mediump float;
        precision mediump sampler2D;
        varying highp vec2 vUv;
        varying highp vec2 vL;
        varying highp vec2 vR;
        varying highp vec2 vT;
        varying highp vec2 vB;
        uniform sampler2D uVelocity;
        void main () {
            float L = texture2D(uVelocity, vL).x;
            float R = texture2D(uVelocity, vR).x;
            float T = texture2D(uVelocity, vT).y;
            float B = texture2D(uVelocity, vB).y;
            vec2 C = texture2D(uVelocity, vUv).xy;
            if (vL.x < 0.0) { L = -C.x; }
            if (vR.x > 1.0) { R = -C.x; }
            if (vT.y > 1.0) { T = -C.y; }
            if (vB.y < 0.0) { B = -C.y; }
            float div = 0.5 * (R - L + T - B);
            gl_FragColor = vec4(div, 0.0, 0.0, 1.0);
        }
    `;
    const curlShaderSource = `
        precision mediump float;
        precision mediump sampler2D;
        varying highp vec2 vUv;
        varying highp vec2 vL;
        varying highp vec2 vR;
        varying highp vec2 vT;
        varying highp vec2 vB;
        uniform sampler2D uVelocity;
        void main () {
            float L = texture2D(uVelocity, vL).y;
            float R = texture2D(uVelocity, vR).y;
            float T = texture2D(uVelocity, vT).x;
            float B = texture2D(uVelocity, vB).x;
            float vorticity = R - L - T + B;
            gl_FragColor = vec4(0.5 * vorticity, 0.0, 0.0, 1.0);
        }
    `;
    const vorticityShaderSource = `
        precision highp float;
        precision highp sampler2D;
        varying vec2 vUv;
        varying vec2 vL;
        varying vec2 vR;
        varying vec2 vT;
        varying vec2 vB;
        uniform sampler2D uVelocity;
        uniform sampler2D uCurl;
        uniform float curl;
        uniform float dt;
        void main () {
            float L = texture2D(uCurl, vL).x;
            float R = texture2D(uCurl, vR).x;
            float T = texture2D(uCurl, vT).x;
            float B = texture2D(uCurl, vB).x;
            float C = texture2D(uCurl, vUv).x;
            vec2 force = 0.5 * vec2(abs(T) - abs(B), abs(R) - abs(L));
            force /= length(force) + 0.0001;
            force *= curl * C;
            force.y *= -1.0;
            vec2 velocity = texture2D(uVelocity, vUv).xy;
            velocity += force * dt;
            velocity = min(max(velocity, -1000.0), 1000.0);
            gl_FragColor = vec4(velocity, 0.0, 1.0);
        }
    `;
    const pressureShaderSource = `
        precision mediump float;
        precision mediump sampler2D;
        varying highp vec2 vUv;
        varying highp vec2 vL;
        varying highp vec2 vR;
        varying highp vec2 vT;
        varying highp vec2 vB;
        uniform sampler2D uPressure;
        uniform sampler2D uDivergence;
        void main () {
            float L = texture2D(uPressure, vL).x;
            float R = texture2D(uPressure, vR).x;
            float T = texture2D(uPressure, vT).x;
            float B = texture2D(uPressure, vB).x;
            float C = texture2D(uPressure, vUv).x;
            float divergence = texture2D(uDivergence, vUv).x;
            float pressure = (L + R + B + T - divergence) * 0.25;
            gl_FragColor = vec4(pressure, 0.0, 0.0, 1.0);
        }
    `;
    const gradientSubtractShaderSource = `
        precision mediump float;
        precision mediump sampler2D;
        varying highp vec2 vUv;
        varying highp vec2 vL;
        varying highp vec2 vR;
        varying highp vec2 vT;
        varying highp vec2 vB;
        uniform sampler2D uPressure;
        uniform sampler2D uVelocity;
        void main () {
            float L = texture2D(uPressure, vL).x;
            float R = texture2D(uPressure, vR).x;
            float T = texture2D(uPressure, vT).x;
            float B = texture2D(uPressure, vB).x;
            vec2 velocity = texture2D(uVelocity, vUv).xy;
            velocity.xy -= vec2(R - L, T - B);
            gl_FragColor = vec4(velocity, 0.0, 1.0);
        }
    `;

    // Compile Shaders
    const baseVertexShaderCompiled = compileShaderInternal(gl, gl.VERTEX_SHADER, baseVertexShaderSource);
    const blurVertexShaderCompiled = compileShaderInternal(gl, gl.VERTEX_SHADER, blurVertexShaderSource);

    // Initialize Programs
    blurProgram.current = new GLProgram(gl, blurVertexShaderCompiled, compileShaderInternal(gl, gl.FRAGMENT_SHADER, blurShaderSource));
    copyProgram.current = new GLProgram(gl, baseVertexShaderCompiled, compileShaderInternal(gl, gl.FRAGMENT_SHADER, copyShaderSource));
    clearProgram.current = new GLProgram(gl, baseVertexShaderCompiled, compileShaderInternal(gl, gl.FRAGMENT_SHADER, clearShaderSource));
    colorProgram.current = new GLProgram(gl, baseVertexShaderCompiled, compileShaderInternal(gl, gl.FRAGMENT_SHADER, colorShaderSource));
    checkerboardProgram.current = new GLProgram(gl, baseVertexShaderCompiled, compileShaderInternal(gl, gl.FRAGMENT_SHADER, checkerboardShaderSource));
    bloomPrefilterProgram.current = new GLProgram(gl, baseVertexShaderCompiled, compileShaderInternal(gl, gl.FRAGMENT_SHADER, bloomPrefilterShaderSource));
    bloomBlurProgram.current = new GLProgram(gl, baseVertexShaderCompiled, compileShaderInternal(gl, gl.FRAGMENT_SHADER, bloomBlurShaderSource));
    bloomFinalProgram.current = new GLProgram(gl, baseVertexShaderCompiled, compileShaderInternal(gl, gl.FRAGMENT_SHADER, bloomFinalShaderSource));
    sunraysMaskProgram.current = new GLProgram(gl, baseVertexShaderCompiled, compileShaderInternal(gl, gl.FRAGMENT_SHADER, sunraysMaskShaderSource));
    sunraysProgram.current = new GLProgram(gl, baseVertexShaderCompiled, compileShaderInternal(gl, gl.FRAGMENT_SHADER, sunraysShaderSource));
    splatProgram.current = new GLProgram(gl, baseVertexShaderCompiled, compileShaderInternal(gl, gl.FRAGMENT_SHADER, splatShaderSource));
    advectionProgram.current = new GLProgram(gl, baseVertexShaderCompiled, compileShaderInternal(gl, gl.FRAGMENT_SHADER, advectionShaderSource, ext.supportLinearFiltering ? null : ["MANUAL_FILTERING"]));
    divergenceProgram.current = new GLProgram(gl, baseVertexShaderCompiled, compileShaderInternal(gl, gl.FRAGMENT_SHADER, divergenceShaderSource));
    curlProgram.current = new GLProgram(gl, baseVertexShaderCompiled, compileShaderInternal(gl, gl.FRAGMENT_SHADER, curlShaderSource));
    vorticityProgram.current = new GLProgram(gl, baseVertexShaderCompiled, compileShaderInternal(gl, gl.FRAGMENT_SHADER, vorticityShaderSource));
    pressureProgram.current = new GLProgram(gl, baseVertexShaderCompiled, compileShaderInternal(gl, gl.FRAGMENT_SHADER, pressureShaderSource));
    gradienSubtractProgram.current = new GLProgram(gl, baseVertexShaderCompiled, compileShaderInternal(gl, gl.FRAGMENT_SHADER, gradientSubtractShaderSource));
    
    displayMaterial.current = new Material(gl, baseVertexShaderCompiled, displayShaderSourceText);
    
    // Blit function
    const blit = (target: FBO | null, clear: boolean = false) => {
        const currentGl = glRef.current;
        if (!currentGl) return;

        if (target == null) {
            currentGl.viewport(0, 0, currentGl.drawingBufferWidth, currentGl.drawingBufferHeight);
            currentGl.bindFramebuffer(currentGl.FRAMEBUFFER, null);
        } else {
            currentGl.viewport(0, 0, target.width, target.height);
            currentGl.bindFramebuffer(currentGl.FRAMEBUFFER, target.fbo);
        }
        if (clear) {
            currentGl.clearColor(0.0, 0.0, 0.0, 1.0);
            currentGl.clear(currentGl.COLOR_BUFFER_BIT);
        }
        currentGl.drawElements(currentGl.TRIANGLES, 6, currentGl.UNSIGNED_SHORT, 0);
    };
    
    // Initial setup for blit
    (() => {
        const currentGl = glRef.current;
        if (!currentGl) return;
        currentGl.bindBuffer(currentGl.ARRAY_BUFFER, currentGl.createBuffer());
        currentGl.bufferData(currentGl.ARRAY_BUFFER, new Float32Array([-1, -1, -1, 1, 1, 1, 1, -1]), currentGl.STATIC_DRAW);
        currentGl.bindBuffer(currentGl.ELEMENT_ARRAY_BUFFER, currentGl.createBuffer());
        currentGl.bufferData(currentGl.ELEMENT_ARRAY_BUFFER, new Uint16Array([0, 1, 2, 0, 2, 3]), currentGl.STATIC_DRAW);
        currentGl.vertexAttribPointer(0, 2, currentGl.FLOAT, false, 0, 0);
        currentGl.enableVertexAttribArray(0);
    })();

    // FBO creation functions
    const createFBO = (w: number, h: number, internalFormat: number, format: number, type: number, param: number): FBO => {
        const currentGl = glRef.current;
        if (!currentGl) throw new Error("GL context not available for FBO creation");

        currentGl.activeTexture(currentGl.TEXTURE0);
        let texture = currentGl.createTexture();
        if (!texture) throw new Error("Failed to create texture for FBO");
        currentGl.bindTexture(currentGl.TEXTURE_2D, texture);
        currentGl.texParameteri(currentGl.TEXTURE_2D, currentGl.TEXTURE_MIN_FILTER, param);
        currentGl.texParameteri(currentGl.TEXTURE_2D, currentGl.TEXTURE_MAG_FILTER, param);
        currentGl.texParameteri(currentGl.TEXTURE_2D, currentGl.TEXTURE_WRAP_S, currentGl.CLAMP_TO_EDGE);
        currentGl.texParameteri(currentGl.TEXTURE_2D, currentGl.TEXTURE_WRAP_T, currentGl.CLAMP_TO_EDGE);
        currentGl.texImage2D(currentGl.TEXTURE_2D, 0, internalFormat, w, h, 0, format, type, null);

        let fbo = currentGl.createFramebuffer();
        if (!fbo) throw new Error("Failed to create framebuffer");
        currentGl.bindFramebuffer(currentGl.FRAMEBUFFER, fbo);
        currentGl.framebufferTexture2D(currentGl.FRAMEBUFFER, currentGl.COLOR_ATTACHMENT0, currentGl.TEXTURE_2D, texture, 0);
        currentGl.viewport(0, 0, w, h);
        currentGl.clear(currentGl.COLOR_BUFFER_BIT);

        return {
            texture, fbo, width: w, height: h,
            texelSizeX: 1.0 / w, texelSizeY: 1.0 / h,
            attach(id: number) {
                currentGl.activeTexture(currentGl.TEXTURE0 + id);
                currentGl.bindTexture(currentGl.TEXTURE_2D, texture);
                return id;
            }
        };
    };

    const createDoubleFBO = (w: number, h: number, internalFormat: number, format: number, type: number, param: number): DoubleFBO => {
        let fbo1 = createFBO(w, h, internalFormat, format, type, param);
        let fbo2 = createFBO(w, h, internalFormat, format, type, param);
        return {
            width: w, height: h,
            texelSizeX: fbo1.texelSizeX, texelSizeY: fbo1.texelSizeY,
            get read() { return fbo1; },
            set read(value) { fbo1 = value; },
            get write() { return fbo2; },
            set write(value) { fbo2 = value; },
            swap() { let temp = fbo1; fbo1 = fbo2; fbo2 = temp; }
        };
    };
    
    const resizeFBO = (target: FBO, w: number, h: number, internalFormat: number, format: number, type: number, param: number): FBO => {
        const currentGl = glRef.current;
        const currentCopyProgram = copyProgram.current;
        if (!currentGl || !currentCopyProgram) throw new Error("GL or copyProgram not ready for resizeFBO");

        let newFBO = createFBO(w, h, internalFormat, format, type, param);
        currentCopyProgram.bind();
        currentGl.uniform1i(currentCopyProgram.uniforms['uTexture'], target.attach(0));
        blit(newFBO);
        gl.deleteTexture(target.texture);
        gl.deleteFramebuffer(target.fbo);
        return newFBO;
    };

    const resizeDoubleFBO = (target: DoubleFBO, w: number, h: number, internalFormat: number, format: number, type: number, param: number): DoubleFBO => {
        if (target.width == w && target.height == h) return target;
        
        const oldReadTexture = target.read.texture;
        const oldReadFbo = target.read.fbo;
        const oldWriteTexture = target.write.texture;
        const oldWriteFbo = target.write.fbo;

        target.read = resizeFBO(target.read, w, h, internalFormat, format, type, param);
        target.write = createFBO(w, h, internalFormat, format, type, param);
        target.width = w;
        target.height = h;
        target.texelSizeX = 1.0 / w;
        target.texelSizeY = 1.0 / h;

        // Clean up old textures and FBOs from the previous size that are no longer part of target.read or target.write
        if (oldReadTexture !== target.read.texture) gl.deleteTexture(oldReadTexture);
        if (oldReadFbo !== target.read.fbo) gl.deleteFramebuffer(oldReadFbo);
        gl.deleteTexture(oldWriteTexture); // old target.write is always replaced
        gl.deleteFramebuffer(oldWriteFbo);

        return target;
    };


    const createTextureAsync = (url: string): TextureAsync => {
        const currentGl = glRef.current;
        if (!currentGl) throw new Error("GL context not available for texture creation");

        let texture = currentGl.createTexture();
        if (!texture) throw new Error("Failed to create texture");
        currentGl.bindTexture(currentGl.TEXTURE_2D, texture);
        currentGl.texParameteri(currentGl.TEXTURE_2D, currentGl.TEXTURE_MIN_FILTER, currentGl.LINEAR);
        currentGl.texParameteri(currentGl.TEXTURE_2D, currentGl.TEXTURE_MAG_FILTER, currentGl.LINEAR);
        currentGl.texParameteri(currentGl.TEXTURE_2D, currentGl.TEXTURE_WRAP_S, currentGl.REPEAT);
        currentGl.texParameteri(currentGl.TEXTURE_2D, currentGl.TEXTURE_WRAP_T, currentGl.REPEAT);
        currentGl.texImage2D(currentGl.TEXTURE_2D, 0, currentGl.RGB, 1, 1, 0, currentGl.RGB, currentGl.UNSIGNED_BYTE, new Uint8Array([255, 255, 255]));

        let obj: TextureAsync = {
            texture, width: 1, height: 1,
            attach(id: number) {
                currentGl.activeTexture(currentGl.TEXTURE0 + id);
                currentGl.bindTexture(currentGl.TEXTURE_2D, texture);
                return id;
            }
        };

        let image = new Image();
        image.onload = () => {
            obj.width = image.width;
            obj.height = image.height;
            const currentGlOnLoad = glRef.current; // Re-check gl context in async callback
            if(currentGlOnLoad) {
                 currentGlOnLoad.bindTexture(currentGlOnLoad.TEXTURE_2D, texture);
                 currentGlOnLoad.texImage2D(currentGlOnLoad.TEXTURE_2D, 0, currentGlOnLoad.RGB, currentGlOnLoad.RGB, currentGlOnLoad.UNSIGNED_BYTE, image);
            }
        };
        image.onerror = () => {
            console.error("Failed to load image for texture: " + url + ". Make sure 'LDR_LLL1_0.png' is in the 'public' directory.");
        }
        image.src = url; // Ensure this path is correct, e.g., /LDR_LLL1_0.png if in public folder
        return obj;
    };

    const getResolution = (resolution: number): { width: number, height: number } => {
        const currentGl = glRef.current;
        if (!currentGl) return { width: resolution, height: resolution };
        let aspectRatio = currentGl.drawingBufferWidth / currentGl.drawingBufferHeight;
        if (aspectRatio < 1) aspectRatio = 1.0 / aspectRatio;
        let min = Math.round(resolution);
        let max = Math.round(resolution * aspectRatio);
        if (currentGl.drawingBufferWidth > currentGl.drawingBufferHeight) return { width: max, height: min };
        else return { width: min, height: max };
    };
    
    const initFramebuffers = () => {
        const currentGl = glRef.current;
        const currentExt = extRef.current;
        const currentConfig = getConfig();
        if (!currentGl || !currentExt) return;

        let simRes = getResolution(currentConfig.SIM_RESOLUTION);
        let dyeRes = getResolution(currentConfig.DYE_RESOLUTION);

        const texType = currentExt.halfFloatTexType;
        const rgba = currentExt.formatRGBA;
        const rg = currentExt.formatRG;
        const r = currentExt.formatR;
        
        if (!rgba || !rg || !r ) {
            console.error("Required texture formats not supported.");
            // Potentially disable features or stop simulation
             setConfig(prev => ({...prev, SHADING: false, BLOOM: false, SUNRAYS: false}));
            return;
        }

        const filtering = currentExt.supportLinearFiltering ? currentGl.LINEAR : currentGl.NEAREST;
        currentGl.disable(currentGl.BLEND);

        if (dye.current == null) dye.current = createDoubleFBO(dyeRes.width, dyeRes.height, rgba.internalFormat, rgba.format, texType, filtering);
        else dye.current = resizeDoubleFBO(dye.current, dyeRes.width, dyeRes.height, rgba.internalFormat, rgba.format, texType, filtering);

        if (velocity.current == null) velocity.current = createDoubleFBO(simRes.width, simRes.height, rg.internalFormat, rg.format, texType, filtering);
        else velocity.current = resizeDoubleFBO(velocity.current, simRes.width, simRes.height, rg.internalFormat, rg.format, texType, filtering);

        divergenceFBO.current = createFBO(simRes.width, simRes.height, r.internalFormat, r.format, texType, currentGl.NEAREST);
        curlFBO.current = createFBO(simRes.width, simRes.height, r.internalFormat, r.format, texType, currentGl.NEAREST);
        pressureFBO.current = createDoubleFBO(simRes.width, simRes.height, r.internalFormat, r.format, texType, currentGl.NEAREST);

        initBloomFramebuffers();
        initSunraysFramebuffers();
    };
    
    const initBloomFramebuffers = () => {
        const currentGl = glRef.current;
        const currentExt = extRef.current;
        const currentConfig = getConfig();
        if (!currentGl || !currentExt || !currentExt.formatRGBA) return;

        let res = getResolution(currentConfig.BLOOM_RESOLUTION);
        const texType = currentExt.halfFloatTexType;
        const rgba = currentExt.formatRGBA;
        const filtering = currentExt.supportLinearFiltering ? currentGl.LINEAR : currentGl.NEAREST;

        bloomFBO.current = createFBO(res.width, res.height, rgba.internalFormat, rgba.format, texType, filtering);
        bloomFramebuffers.current.length = 0;
        for (let i = 0; i < currentConfig.BLOOM_ITERATIONS; i++) {
            let width = res.width >> (i + 1);
            let height = res.height >> (i + 1);
            if (width < 2 || height < 2) break;
            let fbo = createFBO(width, height, rgba.internalFormat, rgba.format, texType, filtering);
            bloomFramebuffers.current.push(fbo);
        }
    };

    const initSunraysFramebuffers = () => {
        const currentGl = glRef.current;
        const currentExt = extRef.current;
        const currentConfig = getConfig();
        if (!currentGl || !currentExt || !currentExt.formatR) return;

        let res = getResolution(currentConfig.SUNRAYS_RESOLUTION);
        const texType = currentExt.halfFloatTexType;
        const r = currentExt.formatR;
        const filtering = currentExt.supportLinearFiltering ? currentGl.LINEAR : currentGl.NEAREST;
        
        sunraysFBO.current = createFBO(res.width, res.height, r.internalFormat, r.format, texType, filtering);
        sunraysTempFBO.current = createFBO(res.width, res.height, r.internalFormat, r.format, texType, filtering);
    };
    
    ditheringTexture.current = createTextureAsync("/LDR_LLL1_0.png"); // Path relative to public folder

    const updateKeywords = () => {
        const currentConfig = getConfig();
        const currentDisplayMaterial = displayMaterial.current;
        if (!currentDisplayMaterial) return;
        let displayKeywords = [];
        if (currentConfig.SHADING) displayKeywords.push("SHADING");
        if (currentConfig.BLOOM) displayKeywords.push("BLOOM");
        if (currentConfig.SUNRAYS) displayKeywords.push("SUNRAYS");
        currentDisplayMaterial.setKeywords(displayKeywords);
    };

    updateKeywords(); // Call after config might have been updated by ext checks
    initialResizeCanvas(); // Ensure canvas has dimensions before FBO init
    initFramebuffers();

    const splat = (x: number, y: number, dx: number, dy: number, color: RGBAColor) => {
        const currentGl = glRef.current;
        const currentSplatProgram = splatProgram.current;
        const currentVelocity = velocity.current;
        const currentDye = dye.current;
        const currentConfig = getConfig();

        if (!currentGl || !currentSplatProgram || !currentVelocity || !currentDye || !canvasRef.current) return;

        currentSplatProgram.bind();
        currentGl.uniform1i(currentSplatProgram.uniforms['uTarget'], currentVelocity.read.attach(0));
        currentGl.uniform1f(currentSplatProgram.uniforms['aspectRatio'], canvasRef.current.width / canvasRef.current.height);
        currentGl.uniform2f(currentSplatProgram.uniforms['point'], x, y);
        currentGl.uniform3f(currentSplatProgram.uniforms['color'], dx, dy, 0.0);
        currentGl.uniform1f(currentSplatProgram.uniforms['radius'], correctRadius(currentConfig.SPLAT_RADIUS / 100.0));
        blit(currentVelocity.write);
        currentVelocity.swap();

        currentGl.uniform1i(currentSplatProgram.uniforms['uTarget'], currentDye.read.attach(0));
        currentGl.uniform3f(currentSplatProgram.uniforms['color'], color.r, color.g, color.b);
        blit(currentDye.write);
        currentDye.swap();
    };

    const correctRadius = (radius: number): number => {
        if (!canvasRef.current) return radius;
        let aspectRatio = canvasRef.current.width / canvasRef.current.height;
        if (aspectRatio > 1) radius *= aspectRatio;
        return radius;
    };

    const HSVtoRGB = (h: number, s: number, v: number): RGBAColor => {
        let r = 0, g = 0, b = 0, i, f, p, q, t;
        i = Math.floor(h * 6);
        f = h * 6 - i;
        p = v * (1 - s);
        q = v * (1 - f * s);
        t = v * (1 - (1 - f) * s);
        switch (i % 6) {
            case 0: r = v; g = t; b = p; break;
            case 1: r = q; g = v; b = p; break;
            case 2: r = p; g = v; b = t; break;
            case 3: r = p; g = q; b = v; break;
            case 4: r = t; g = p; b = v; break;
            case 5: r = v; g = p; b = q; break;
        }
        return { r, g, b };
    };

    const generateColor = (): RGBAColor => {
        let c = HSVtoRGB(Math.random(), 1.0, 1.0);
        c.r *= 0.15;
        c.g *= 0.15;
        c.b *= 0.15;
        return c;
    };
    
    const multipleSplats = (amount: number) => {
        for (let i = 0; i < amount; i++) {
            const color = generateColor();
            color.r *= 10.0;
            color.g *= 10.0;
            color.b *= 10.0;
            const x = Math.random();
            const y = Math.random();
            const dx = 1000 * (Math.random() - 0.5);
            const dy = 1000 * (Math.random() - 0.5);
            splat(x, y, dx, dy, color);
        }
    };
    multipleSplats(parseInt((Math.random() * 20).toString()) + 5);
    
    // Main update loop
    const mainUpdate = () => {
        const currentConfig = getConfig();
        const dt = calcDeltaTime();
        if (resizeCanvas()) initFramebuffers(); // resizeCanvas uses glRef and canvasRef
        updateColors(dt);
        applyInputs();
        if (!currentConfig.PAUSED) step(dt);
        renderToScreen(null); // renderToScreen uses various refs
        animationFrameId.current = requestAnimationFrame(mainUpdate);
    };

    const calcDeltaTime = (): number => {
        let now = Date.now();
        let dt = (now - lastUpdateTime.current) / 1000;
        dt = Math.min(dt, 0.016666);
        lastUpdateTime.current = now;
        return dt;
    };

    const resizeCanvas = (): boolean => {
        const currentGl = glRef.current;
        const currentCanvas = canvasRef.current;
        if (!currentGl || !currentCanvas) return false;
        let width = scaleByPixelRatio(currentCanvas.clientWidth);
        let height = scaleByPixelRatio(currentCanvas.clientHeight);
        if (currentCanvas.width != width || currentCanvas.height != height) {
            currentCanvas.width = width;
            currentCanvas.height = height;
            return true;
        }
        return false;
    };
    
    const updateColors = (dt: number) => {
        const currentConfig = getConfig();
        if (!currentConfig.COLORFUL) return;
        colorUpdateTimer.current += dt * currentConfig.COLOR_UPDATE_SPEED;
        if (colorUpdateTimer.current >= 1) {
            colorUpdateTimer.current = wrap(colorUpdateTimer.current, 0, 1);
            pointers.current.forEach(p => {
                p.color = Object.values(generateColor()).slice(0, 3); // Ensure it's an array of numbers
            });
        }
    };
    
    const wrap = (value: number, min: number, max: number): number => {
        let range = max - min;
        if (range == 0) return min;
        return (value - min) % range + min;
    };

    const applyInputs = () => {
        if (splatStack.current.length > 0) multipleSplats(splatStack.current.pop()!);
        pointers.current.forEach(p => {
            if (p.moved) {
                p.moved = false;
                splatPointer(p);
            }
        });
    };
    
    const splatPointer = (pointer: Pointer) => {
        const currentConfig = getConfig();
        let dx = pointer.deltaX * currentConfig.SPLAT_FORCE;
        let dy = pointer.deltaY * currentConfig.SPLAT_FORCE;
        const colorValues = pointer.color;
        splat(pointer.texcoordX, pointer.texcoordY, dx, dy, { r: colorValues[0], g: colorValues[1], b: colorValues[2] });
    };

    const step = (dt: number) => {
        const currentGl = glRef.current;
        const currentExt = extRef.current;
        const currentConfig = getConfig();
        if (!currentGl || !currentExt || !velocity.current || !curlFBO.current || !vorticityProgram.current || !divergenceProgram.current || !pressureFBO.current || !clearProgram.current || !pressureProgram.current || !divergenceFBO.current || !gradienSubtractProgram.current || !advectionProgram.current || !dye.current || !curlProgram.current) return;

        currentGl.disable(currentGl.BLEND);

        curlProgram.current.bind();
        currentGl.uniform2f(curlProgram.current.uniforms['texelSize'], velocity.current.texelSizeX, velocity.current.texelSizeY);
        currentGl.uniform1i(curlProgram.current.uniforms['uVelocity'], velocity.current.read.attach(0));
        blit(curlFBO.current);

        vorticityProgram.current.bind();
        currentGl.uniform2f(vorticityProgram.current.uniforms['texelSize'], velocity.current.texelSizeX, velocity.current.texelSizeY);
        currentGl.uniform1i(vorticityProgram.current.uniforms['uVelocity'], velocity.current.read.attach(0));
        currentGl.uniform1i(vorticityProgram.current.uniforms['uCurl'], curlFBO.current.attach(1));
        currentGl.uniform1f(vorticityProgram.current.uniforms['curl'], currentConfig.CURL);
        currentGl.uniform1f(vorticityProgram.current.uniforms['dt'], dt);
        blit(velocity.current.write);
        velocity.current.swap();

        divergenceProgram.current.bind();
        currentGl.uniform2f(divergenceProgram.current.uniforms['texelSize'], velocity.current.texelSizeX, velocity.current.texelSizeY);
        currentGl.uniform1i(divergenceProgram.current.uniforms['uVelocity'], velocity.current.read.attach(0));
        blit(divergenceFBO.current);

        clearProgram.current.bind();
        currentGl.uniform1i(clearProgram.current.uniforms['uTexture'], pressureFBO.current.read.attach(0));
        currentGl.uniform1f(clearProgram.current.uniforms['value'], currentConfig.PRESSURE);
        blit(pressureFBO.current.write);
        pressureFBO.current.swap();

        pressureProgram.current.bind();
        currentGl.uniform2f(pressureProgram.current.uniforms['texelSize'], velocity.current.texelSizeX, velocity.current.texelSizeY);
        currentGl.uniform1i(pressureProgram.current.uniforms['uDivergence'], divergenceFBO.current.attach(0));
        for (let i = 0; i < currentConfig.PRESSURE_ITERATIONS; i++) {
            currentGl.uniform1i(pressureProgram.current.uniforms['uPressure'], pressureFBO.current.read.attach(1));
            blit(pressureFBO.current.write);
            pressureFBO.current.swap();
        }

        gradienSubtractProgram.current.bind();
        currentGl.uniform2f(gradienSubtractProgram.current.uniforms['texelSize'], velocity.current.texelSizeX, velocity.current.texelSizeY);
        currentGl.uniform1i(gradienSubtractProgram.current.uniforms['uPressure'], pressureFBO.current.read.attach(0));
        currentGl.uniform1i(gradienSubtractProgram.current.uniforms['uVelocity'], velocity.current.read.attach(1));
        blit(velocity.current.write);
        velocity.current.swap();

        advectionProgram.current.bind();
        currentGl.uniform2f(advectionProgram.current.uniforms['texelSize'], velocity.current.texelSizeX, velocity.current.texelSizeY);
        if (!currentExt.supportLinearFiltering) currentGl.uniform2f(advectionProgram.current.uniforms['dyeTexelSize'], velocity.current.texelSizeX, velocity.current.texelSizeY);
        let velocityId = velocity.current.read.attach(0);
        currentGl.uniform1i(advectionProgram.current.uniforms['uVelocity'], velocityId);
        currentGl.uniform1i(advectionProgram.current.uniforms['uSource'], velocityId);
        currentGl.uniform1f(advectionProgram.current.uniforms['dt'], dt);
        currentGl.uniform1f(advectionProgram.current.uniforms['dissipation'], currentConfig.VELOCITY_DISSIPATION);
        blit(velocity.current.write);
        velocity.current.swap();

        if (!currentExt.supportLinearFiltering) currentGl.uniform2f(advectionProgram.current.uniforms['dyeTexelSize'], dye.current.texelSizeX, dye.current.texelSizeY);
        currentGl.uniform1i(advectionProgram.current.uniforms['uVelocity'], velocity.current.read.attach(0));
        currentGl.uniform1i(advectionProgram.current.uniforms['uSource'], dye.current.read.attach(1));
        currentGl.uniform1f(advectionProgram.current.uniforms['dissipation'], currentConfig.DENSITY_DISSIPATION);
        blit(dye.current.write);
        dye.current.swap();
    };

    const renderToScreen = (target: FBO | null) => {
        const currentGl = glRef.current;
        const currentConfig = getConfig();
        const currentDye = dye.current;
        if(!currentGl || !currentDye) return;

        if (currentConfig.BLOOM && bloomFBO.current) applyBloom(currentDye.read, bloomFBO.current);
        if (currentConfig.SUNRAYS && sunraysFBO.current && sunraysTempFBO.current) {
            applySunrays(currentDye.read, currentDye.write, sunraysFBO.current);
            performBlur(sunraysFBO.current, sunraysTempFBO.current, 1);
        }

        if (target == null || !currentConfig.TRANSPARENT) {
            currentGl.blendFunc(currentGl.ONE, currentGl.ONE_MINUS_SRC_ALPHA);
            currentGl.enable(currentGl.BLEND);
        } else {
            currentGl.disable(currentGl.BLEND);
        }
        
        const bgColor = normalizeColor(currentConfig.BACK_COLOR);
        if (!currentConfig.TRANSPARENT) drawColor(target, bgColor);
        if (target == null && currentConfig.TRANSPARENT) drawCheckerboard(target);
        drawDisplay(target);
    };
    
    const normalizeColor = (input: {r:number, g:number, b:number}): RGBAColor => ({ r: input.r / 255, g: input.g / 255, b: input.b / 255 });

    const drawColor = (target: FBO | null, color: RGBAColor) => {
        const currentGl = glRef.current;
        const cProgram = colorProgram.current;
        if(!currentGl || !cProgram) return;
        cProgram.bind();
        currentGl.uniform4f(cProgram.uniforms['color'], color.r, color.g, color.b, 1);
        blit(target);
    };

    const drawCheckerboard = (target: FBO | null) => {
        const currentGl = glRef.current;
        const cbProgram = checkerboardProgram.current;
        const currentCanvas = canvasRef.current;
        if(!currentGl || !cbProgram || !currentCanvas) return;
        cbProgram.bind();
        currentGl.uniform1f(cbProgram.uniforms['aspectRatio'], currentCanvas.width / currentCanvas.height);
        blit(target);
    };
    
    const getTextureScale = (texture: TextureAsync, width: number, height: number): { x: number, y: number } => ({ x: width / texture.width, y: height / texture.height });

    const drawDisplay = (target: FBO | null) => {
        const currentGl = glRef.current;
        const currentDisplayMat = displayMaterial.current;
        const currentDye = dye.current;
        const currentConfig = getConfig();
        const currentDitheringTex = ditheringTexture.current;

        if(!currentGl || !currentDisplayMat || !currentDye) return;

        let width = target == null ? currentGl.drawingBufferWidth : target.width;
        let height = target == null ? currentGl.drawingBufferHeight : target.height;

        currentDisplayMat.bind();
        if (currentConfig.SHADING) currentGl.uniform2f(currentDisplayMat.uniforms['texelSize'], 1.0 / width, 1.0 / height);
        currentGl.uniform1i(currentDisplayMat.uniforms['uTexture'], currentDye.read.attach(0));
        if (currentConfig.BLOOM && bloomFBO.current && currentDitheringTex) {
            currentGl.uniform1i(currentDisplayMat.uniforms['uBloom'], bloomFBO.current.attach(1));
            currentGl.uniform1i(currentDisplayMat.uniforms['uDithering'], currentDitheringTex.attach(2));
            let scale = getTextureScale(currentDitheringTex, width, height);
            currentGl.uniform2f(currentDisplayMat.uniforms['ditherScale'], scale.x, scale.y);
        }
        if (currentConfig.SUNRAYS && sunraysFBO.current) currentGl.uniform1i(currentDisplayMat.uniforms['uSunrays'], sunraysFBO.current.attach(3));
        blit(target);
    };
    
    const applyBloom = (source: FBO, destination: FBO) => {
        const currentGl = glRef.current;
        const currentConfig = getConfig();
        const currentBloomPrefilterProgram = bloomPrefilterProgram.current;
        const currentBloomBlurProgram = bloomBlurProgram.current;
        const currentBloomFinalProgram = bloomFinalProgram.current;

        if (bloomFramebuffers.current.length < 2 || !currentGl || !currentBloomPrefilterProgram || !currentBloomBlurProgram || !currentBloomFinalProgram) return;

        let last: FBO = destination;
        currentGl.disable(currentGl.BLEND);
        currentBloomPrefilterProgram.bind();
        let knee = currentConfig.BLOOM_THRESHOLD * currentConfig.BLOOM_SOFT_KNEE + 0.0001;
        let curve0 = currentConfig.BLOOM_THRESHOLD - knee;
        let curve1 = knee * 2;
        let curve2 = 0.25 / knee;
        currentGl.uniform3f(currentBloomPrefilterProgram.uniforms['curve'], curve0, curve1, curve2);
        currentGl.uniform1f(currentBloomPrefilterProgram.uniforms['threshold'], currentConfig.BLOOM_THRESHOLD);
        currentGl.uniform1i(currentBloomPrefilterProgram.uniforms['uTexture'], source.attach(0));
        blit(last);

        currentBloomBlurProgram.bind();
        for (let i = 0; i < bloomFramebuffers.current.length; i++) {
            let dest = bloomFramebuffers.current[i];
            currentGl.uniform2f(currentBloomBlurProgram.uniforms['texelSize'], last.texelSizeX, last.texelSizeY);
            currentGl.uniform1i(currentBloomBlurProgram.uniforms['uTexture'], last.attach(0));
            blit(dest);
            last = dest;
        }

        currentGl.blendFunc(currentGl.ONE, currentGl.ONE);
        currentGl.enable(currentGl.BLEND);

        for (let i = bloomFramebuffers.current.length - 2; i >= 0; i--) {
            let baseTex = bloomFramebuffers.current[i];
            currentGl.uniform2f(currentBloomBlurProgram.uniforms['texelSize'], last.texelSizeX, last.texelSizeY);
            currentGl.uniform1i(currentBloomBlurProgram.uniforms['uTexture'], last.attach(0));
            currentGl.viewport(0, 0, baseTex.width, baseTex.height); // Ensure viewport is set for each FBO
            blit(baseTex);
            last = baseTex;
        }

        currentGl.disable(currentGl.BLEND);
        currentBloomFinalProgram.bind();
        currentGl.uniform2f(currentBloomFinalProgram.uniforms['texelSize'], last.texelSizeX, last.texelSizeY);
        currentGl.uniform1i(currentBloomFinalProgram.uniforms['uTexture'], last.attach(0));
        currentGl.uniform1f(currentBloomFinalProgram.uniforms['intensity'], currentConfig.BLOOM_INTENSITY);
        blit(destination);
    };

    const applySunrays = (source: FBO, mask: FBO, destination: FBO) => {
        const currentGl = glRef.current;
        const currentSunraysMaskProgram = sunraysMaskProgram.current;
        const currentSunraysProgram = sunraysProgram.current;
        const currentConfig = getConfig();

        if(!currentGl || !currentSunraysMaskProgram || !currentSunraysProgram) return;

        currentGl.disable(currentGl.BLEND);
        currentSunraysMaskProgram.bind();
        currentGl.uniform1i(currentSunraysMaskProgram.uniforms['uTexture'], source.attach(0));
        blit(mask);

        currentSunraysProgram.bind();
        currentGl.uniform1f(currentSunraysProgram.uniforms['weight'], currentConfig.SUNRAYS_WEIGHT);
        currentGl.uniform1i(currentSunraysProgram.uniforms['uTexture'], mask.attach(0));
        blit(destination);
    };

    const performBlur = (target: FBO, temp: FBO, iterations: number) => {
        const currentGl = glRef.current;
        const cBlurProgram = blurProgram.current;
        if(!currentGl || !cBlurProgram) return;

        cBlurProgram.bind();
        for (let i = 0; i < iterations; i++) {
            currentGl.uniform2f(cBlurProgram.uniforms['texelSize'], target.texelSizeX, 0.0);
            currentGl.uniform1i(cBlurProgram.uniforms['uTexture'], target.attach(0));
            blit(temp);

            currentGl.uniform2f(cBlurProgram.uniforms['texelSize'], 0.0, target.texelSizeY);
            currentGl.uniform1i(cBlurProgram.uniforms['uTexture'], temp.attach(0));
            blit(target);
        }
    };

    // Event listeners setup
    const updatePointerDownData = (pointer: Pointer, id: number, posX: number, posY: number) => {
        const currentCanvas = canvasRef.current;
        if(!currentCanvas) return;
        pointer.id = id;
        pointer.down = true;
        pointer.moved = false;
        pointer.texcoordX = posX / currentCanvas.width;
        pointer.texcoordY = 1.0 - posY / currentCanvas.height;
        pointer.prevTexcoordX = pointer.texcoordX;
        pointer.prevTexcoordY = pointer.texcoordY;
        pointer.deltaX = 0;
        pointer.deltaY = 0;
        pointer.color = Object.values(generateColor()).slice(0,3);
    };
    
    const correctDelta = (delta: number, isX: boolean): number => {
        const currentCanvas = canvasRef.current;
        if(!currentCanvas) return delta;
        let aspectRatio = currentCanvas.width / currentCanvas.height;
        if (isX && aspectRatio < 1) delta *= aspectRatio;
        if (!isX && aspectRatio > 1) delta /= aspectRatio;
        return delta;
    };

    const updatePointerMoveData = (pointer: Pointer, posX: number, posY: number) => {
        const currentCanvas = canvasRef.current;
        if(!currentCanvas) return;
        pointer.prevTexcoordX = pointer.texcoordX;
        pointer.prevTexcoordY = pointer.texcoordY;
        pointer.texcoordX = posX / currentCanvas.width;
        pointer.texcoordY = 1.0 - posY / currentCanvas.height;
        pointer.deltaX = correctDelta(pointer.texcoordX - pointer.prevTexcoordX, true);
        pointer.deltaY = correctDelta(pointer.texcoordY - pointer.prevTexcoordY, false);
        pointer.moved = Math.abs(pointer.deltaX) > 0 || Math.abs(pointer.deltaY) > 0;
    };
    
    const updatePointerUpData = (pointer: Pointer) => { pointer.down = false; };

    // Event Handlers
    const handleMouseDown = (e: MouseEvent) => {
        let posX = scaleByPixelRatio(e.offsetX);
        let posY = scaleByPixelRatio(e.offsetY);
        let pointer = pointers.current.find(p => p.id == -1);
        if (pointer == null) pointer = new Pointer(); // Should not happen if pointers.current is initialized
        updatePointerDownData(pointer!, -1, posX, posY);
    };
    const handleMouseMove = (e: MouseEvent) => {
        let pointer = pointers.current[0];
        if (!pointer || !pointer.down) return;
        let posX = scaleByPixelRatio(e.offsetX);
        let posY = scaleByPixelRatio(e.offsetY);
        updatePointerMoveData(pointer, posX, posY);
    };
    const handleMouseUp = () => {
        if(pointers.current[0]) updatePointerUpData(pointers.current[0]);
    };
    const handleTouchStart = (e: TouchEvent) => {
        e.preventDefault();
        const touches = e.targetTouches;
        while (touches.length >= pointers.current.length) pointers.current.push(new Pointer());
        for (let i = 0; i < touches.length; i++) {
            let posX = scaleByPixelRatio(touches[i].pageX);
            let posY = scaleByPixelRatio(touches[i].pageY);
            updatePointerDownData(pointers.current[i + 1], touches[i].identifier, posX, posY);
        }
    };
    const handleTouchMove = (e: TouchEvent) => {
        e.preventDefault();
        const touches = e.targetTouches;
        for (let i = 0; i < touches.length; i++) {
            let pointer = pointers.current[i + 1];
            if (!pointer || !pointer.down) continue;
            let posX = scaleByPixelRatio(touches[i].pageX);
            let posY = scaleByPixelRatio(touches[i].pageY);
            updatePointerMoveData(pointer, posX, posY);
        }
    };
    const handleTouchEnd = (e: TouchEvent) => {
        const touches = e.changedTouches;
        for (let i = 0; i < touches.length; i++) {
            let pointer = pointers.current.find(p => p.id == touches[i].identifier);
            if (pointer == null) continue;
            updatePointerUpData(pointer);
        }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
        if (e.code === "KeyP") setConfig(prev => ({...prev, PAUSED: !prev.PAUSED}));
        if (e.key === " ") splatStack.current.push(parseInt((Math.random() * 20).toString()) + 5);
    };
    
    canvas.addEventListener("mousedown", handleMouseDown);
    canvas.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    canvas.addEventListener("touchstart", handleTouchStart, { passive: false });
    canvas.addEventListener("touchmove", handleTouchMove, { passive: false });
    window.addEventListener("touchend", handleTouchEnd);
    window.addEventListener("keydown", handleKeyDown);

    animationFrameId.current = requestAnimationFrame(mainUpdate);

    // Cleanup
    return () => {
      if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
      canvas.removeEventListener("mousedown", handleMouseDown);
      canvas.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      canvas.removeEventListener("touchstart", handleTouchStart);
      canvas.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
      window.removeEventListener("keydown", handleKeyDown);

      // TODO: Properly clean up WebGL resources (FBOs, textures, programs, shaders, buffers)
      // This is crucial to prevent memory leaks if the component unmounts and remounts.
      // For example: glRef.current?.deleteProgram(programRef.current); glRef.current?.deleteTexture(textureRef.current); etc.
      // For now, just stopping the animation loop. A full cleanup would be extensive.
      const currentGl = glRef.current;
      if(currentGl) {
        // Example of deleting some resources, needs to be comprehensive
        [
            dye.current?.read.texture, dye.current?.write.texture,
            velocity.current?.read.texture, velocity.current?.write.texture,
            divergenceFBO.current?.texture, curlFBO.current?.texture,
            pressureFBO.current?.read.texture, pressureFBO.current?.write.texture,
            bloomFBO.current?.texture, sunraysFBO.current?.texture, sunraysTempFBO.current?.texture,
            ditheringTexture.current?.texture,
            ...bloomFramebuffers.current.map(fbo => fbo.texture)
        ].forEach(tex => tex && currentGl.deleteTexture(tex));

        [
            dye.current?.read.fbo, dye.current?.write.fbo,
            velocity.current?.read.fbo, velocity.current?.write.fbo,
            divergenceFBO.current?.fbo, curlFBO.current?.fbo,
            pressureFBO.current?.read.fbo, pressureFBO.current?.write.fbo,
            bloomFBO.current?.fbo, sunraysFBO.current?.fbo, sunraysTempFBO.current?.fbo,
             ...bloomFramebuffers.current.map(fbo => fbo.fbo)
        ].forEach(fbo => fbo && currentGl.deleteFramebuffer(fbo));

        [
            blurProgram.current?.program, copyProgram.current?.program, clearProgram.current?.program,
            colorProgram.current?.program, checkerboardProgram.current?.program, bloomPrefilterProgram.current?.program,
            bloomBlurProgram.current?.program, bloomFinalProgram.current?.program, sunraysMaskProgram.current?.program,
            sunraysProgram.current?.program, splatProgram.current?.program, advectionProgram.current?.program,
            divergenceProgram.current?.program, curlProgram.current?.program, vorticityProgram.current?.program,
            pressureProgram.current?.program, gradienSubtractProgram.current?.program,
            displayMaterial.current?.activeProgram,
            ...(displayMaterial.current ? Object.values(displayMaterial.current.programs) : [])
        ].forEach(prog => prog && currentGl.deleteProgram(prog));

        // Shaders are attached to programs, deleting programs should be enough.
        // If shaders were kept separately, they'd need deletion too.
        // Buffers (vertex/element) also need deletion.
      }
    };
  }, [getConfig]); // Add getConfig to dependency array
  
  // Function to parse rgb string (can be outside useEffect if pure)
  function parseRgb(rgbString: string): { r: number, g: number, b: number } | null {
      const match = rgbString.match(/^rgb\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)$/i);
      if (match) {
          return {
              r: parseInt(match[1], 10),
              g: parseInt(match[2], 10),
              b: parseInt(match[3], 10)
          };
      }
      return null;
  }


  return <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} />;
};

export default FluidSimulation;

