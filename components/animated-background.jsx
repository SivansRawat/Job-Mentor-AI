"use client";

import React, { useEffect, useRef, useState } from "react";

// WebGL GLSL Shaders for continuous Lumina vertical silk light curtain rays
const VS_SOURCE = `
attribute vec2 a_position;
varying vec2 v_uv;
void main() {
  v_uv = (a_position + 1.0) * 0.5;
  gl_Position = vec4(a_position, 0.0, 1.0);
}
`;

const FS_SOURCE = `
precision highp float;
uniform vec2 u_resolution;
uniform float u_time;
varying vec2 v_uv;

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution.xy;
  
  // Lumina deep obsidian navy base
  vec3 bgBase = vec3(0.012, 0.022, 0.055);
  
  // Vibrant Lumina sapphire & cyan palette
  vec3 deepBlue   = vec3(0.03, 0.12, 0.38);
  vec3 midBlue    = vec3(0.08, 0.32, 0.78);
  vec3 brightBlue = vec3(0.22, 0.58, 0.98);
  vec3 cyanGlow   = vec3(0.45, 0.78, 1.00);

  float lightAcc = 0.0;
  float coreAcc = 0.0;

  // 18 vertical light columns running top-to-bottom across screen
  for (int i = 0; i < 18; i++) {
    float fi = float(i);
    float speed = 0.14 + sin(fi * 2.3) * 0.04;
    
    // Position of column across screen width
    float xPos = (fi + 0.5) / 18.0 + sin(u_time * speed * 0.6 + fi * 1.5) * 0.05;
    
    // Vertical silk wave displacement (smooth flowing curtain movement)
    float wave = sin(uv.y * 3.2 + u_time * 0.35 + fi * 0.9) * 0.032
               + cos(uv.y * 5.8 - u_time * 0.22 + fi * 1.4) * 0.016;
               
    float dist = abs((uv.x + wave) - xPos);
    
    // Column beam width
    float beamWidth = 0.038 + sin(fi * 1.7 + u_time * 0.2) * 0.012;
    
    // Beam intensity with smooth falloff
    float beam = smoothstep(beamWidth, 0.0, dist);
    
    // Vertical fade: bright in middle, soft at top/bottom edges
    float vertFade = pow(sin(uv.y * 3.14159), 0.65);
    
    // Pulse variation per beam
    float pulse = 0.5 + 0.5 * sin(u_time * 0.6 + fi * 2.7);
    
    lightAcc += beam * vertFade * (0.4 + 0.35 * pulse);
    
    // Glowing vertical core line in middle of beam
    float core = smoothstep(0.007, 0.0, dist) * vertFade;
    coreAcc += core * (0.45 + 0.45 * pulse);
  }

  // Composite colors
  vec3 color = bgBase;
  color += deepBlue * clamp(lightAcc * 0.85, 0.0, 1.0);
  color += midBlue * pow(clamp(lightAcc * 0.65, 0.0, 1.0), 1.4);
  color += brightBlue * pow(clamp(lightAcc * 0.45, 0.0, 1.0), 2.5);
  color += cyanGlow * coreAcc * 0.75;

  // Add subtle horizontal ambient light band across middle
  float centerGlow = smoothstep(0.7, 0.0, abs(uv.y - 0.45));
  color += brightBlue * centerGlow * lightAcc * 0.12;

  // Subtle corner vignette
  float vignette = sin(uv.x * 3.14159) * sin(uv.y * 3.14159);
  color *= (0.75 + 0.25 * pow(vignette, 0.3));

  gl_FragColor = vec4(color, 1.0);
}
`;

export default function AnimatedBackground() {
  const canvasRef = useRef(null);
  const [webglSupported, setWebglSupported] = useState(true);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    let isReducedMotion = reducedMotionQuery.matches;

    const handleMotionPreferenceChange = (e) => {
      isReducedMotion = e.matches;
    };
    reducedMotionQuery.addEventListener("change", handleMotionPreferenceChange);

    let gl = canvas.getContext("webgl", { alpha: false, antialias: true, powerPreference: "high-performance" });
    if (!gl) {
      gl = canvas.getContext("experimental-webgl", { alpha: false, antialias: true });
    }

    if (!gl) {
      setWebglSupported(false);
      return;
    }

    function createShader(gl, type, source) {
      const shader = gl.createShader(type);
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error("Shader compile error:", gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    }

    const vertShader = createShader(gl, gl.VERTEX_SHADER, VS_SOURCE);
    const fragShader = createShader(gl, gl.FRAGMENT_SHADER, FS_SOURCE);
    if (!vertShader || !fragShader) {
      setWebglSupported(false);
      return;
    }

    const program = gl.createProgram();
    gl.attachShader(program, vertShader);
    gl.attachShader(program, fragShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error("Program link error:", gl.getProgramInfoLog(program));
      setWebglSupported(false);
      return;
    }

    gl.useProgram(program);

    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      gl.STATIC_DRAW
    );

    const positionLocation = gl.getAttribLocation(program, "a_position");
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    const resolutionLocation = gl.getUniformLocation(program, "u_resolution");
    const timeLocation = gl.getUniformLocation(program, "u_time");

    let dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    function resize() {
      if (!canvas || !gl) return;
      const width = window.innerWidth;
      const height = window.innerHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform2f(resolutionLocation, canvas.width, canvas.height);
    }

    window.addEventListener("resize", resize);
    resize();

    let animationFrameId;
    let startTime = performance.now();

    function render(now) {
      if (document.hidden) {
        animationFrameId = requestAnimationFrame(render);
        return;
      }

      const elapsed = isReducedMotion ? 0 : (now - startTime) * 0.001;
      gl.uniform1f(timeLocation, elapsed);
      gl.drawArrays(gl.TRIANGLES, 0, 6);

      if (!isReducedMotion) {
        animationFrameId = requestAnimationFrame(render);
      }
    }

    animationFrameId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener("resize", resize);
      reducedMotionQuery.removeEventListener("change", handleMotionPreferenceChange);
      cancelAnimationFrame(animationFrameId);
      if (gl) {
        gl.deleteBuffer(positionBuffer);
        gl.deleteProgram(program);
        gl.deleteShader(vertShader);
        gl.deleteShader(fragShader);
      }
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[-10] pointer-events-none overflow-hidden select-none">
      {webglSupported ? (
        <canvas
          ref={canvasRef}
          className="w-full h-full block opacity-95"
          aria-hidden="true"
        />
      ) : (
        /* CSS Gradient Fallback */
        <div className="w-full h-full bg-[#050914] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-950/60 via-background to-background" />
      )}

      {/* Ultra-subtle Top & Bottom Vignette Overlay (no blur/dimming) */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60 pointer-events-none" />
    </div>
  );
}
