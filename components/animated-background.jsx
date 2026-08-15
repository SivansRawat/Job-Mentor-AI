"use client";

import React, { useEffect, useRef, useState } from "react";

// WebGL GLSL Shaders for continuous atmospheric light bands
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

// Smooth sine wave synthesis for flowing atmospheric bands
float band(vec2 uv, float freq, float speed, float scale, float phase) {
  float wave = sin(uv.x * freq + u_time * speed + phase) * scale;
  float dist = abs(uv.y - 0.5 - wave);
  return smoothstep(0.6, 0.0, dist);
}

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution.xy;
  
  // Base dark atmosphere tones
  vec3 bgBase = vec3(0.03, 0.05, 0.09); // #080c17 deep navy
  vec3 color1 = vec3(0.08, 0.12, 0.28); // #141f47 deep indigo
  vec3 color2 = vec3(0.18, 0.14, 0.38); // #2e2461 deep violet
  vec3 color3 = vec3(0.12, 0.28, 0.52); // #1f4784 rich blue
  vec3 color4 = vec3(0.24, 0.38, 0.72); // #3d61b7 soft sky accent

  // Continuous flowing light bands moving at different speeds & directions
  float b1 = sin(uv.x * 2.5 + u_time * 0.15) * 0.3 + sin(uv.y * 1.8 - u_time * 0.12) * 0.3 + 0.5;
  float b2 = sin(uv.x * 1.7 - u_time * 0.18 + 2.1) * 0.35 + sin(uv.y * 2.2 + u_time * 0.14 + 1.2) * 0.35 + 0.5;
  float b3 = sin((uv.x + uv.y) * 2.0 + u_time * 0.09 + 4.2) * 0.4 + 0.5;

  // Composite smooth gradients
  vec3 finalColor = bgBase;
  finalColor = mix(finalColor, color1, clamp(b1 * 0.6, 0.0, 1.0));
  finalColor = mix(finalColor, color2, clamp(b2 * 0.5, 0.0, 1.0));
  finalColor = mix(finalColor, color3, clamp(b3 * 0.4, 0.0, 1.0));
  
  // Subtle glowing focal band across screen
  float focal = smoothstep(0.8, 0.0, length(uv - vec2(0.5 + sin(u_time * 0.08) * 0.2, 0.4 + cos(u_time * 0.1) * 0.2)));
  finalColor = mix(finalColor, color4, focal * 0.25);

  gl_FragColor = vec4(finalColor, 1.0);
}
`;

export default function AnimatedBackground() {
  const canvasRef = useRef(null);
  const [webglSupported, setWebglSupported] = useState(true);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Check prefers-reduced-motion
    const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    let isReducedMotion = reducedMotionQuery.matches;

    const handleMotionPreferenceChange = (e) => {
      isReducedMotion = e.matches;
    };
    reducedMotionQuery.addEventListener("change", handleMotionPreferenceChange);

    // Initialize WebGL Context
    let gl = canvas.getContext("webgl", { alpha: false, antialias: false, powerPreference: "low-power" });
    if (!gl) {
      gl = canvas.getContext("experimental-webgl", { alpha: false, antialias: false });
    }

    if (!gl) {
      setWebglSupported(false);
      return;
    }

    // Helper: Compile Shader
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

    // Quad geometry (Full screen)
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

    // Resize handler
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

    // Render loop
    let animationFrameId;
    let startTime = performance.now();

    function render(now) {
      if (document.hidden) {
        // Pause when tab is out of focus
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

    // Cleanup resources on unmount
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
          className="w-full h-full block"
          aria-hidden="true"
        />
      ) : (
        /* CSS Gradient Fallback */
        <div className="w-full h-full bg-[#080c17] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-950/40 via-background to-background" />
      )}

      {/* Dark Readability Vignette Overlay */}
      <div className="absolute inset-0 bg-background/50 backdrop-blur-[1px] pointer-events-none" />
    </div>
  );
}
