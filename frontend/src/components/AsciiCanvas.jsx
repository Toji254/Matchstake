import { useEffect, useRef } from 'react';

const BALL_CHARS =
  " .-':,;=!~+*?crsLtIJ7CSoa2E5wP6bUAKXHmd8RDBg0MNWQ%&@#";
const FIELD_CHARS = '  ..::--==++**##@@'.split('');

const hash = (x, y) => {
  const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453123;
  return s - Math.floor(s);
};

const smooth = (t) => t * t * (3 - 2 * t);

const noise2D = (x, y) => {
  const ix = Math.floor(x);
  const iy = Math.floor(y);
  const fx = x - ix;
  const fy = y - iy;

  const a = hash(ix, iy);
  const b = hash(ix + 1, iy);
  const c = hash(ix, iy + 1);
  const d = hash(ix + 1, iy + 1);

  const ux = smooth(fx);
  const uy = smooth(fy);

  return (
    a * (1 - ux) * (1 - uy) +
    b * ux * (1 - uy) +
    c * (1 - ux) * uy +
    d * ux * uy
  );
};

const clamp = (value, min, max) =>
  Math.max(min, Math.min(max, value));

function getFootballPanelIntensity(px, py, pz) {
  const phi = (1 + Math.sqrt(5)) / 2;
  const invMag = 1 / Math.sqrt(1 + phi * phi);

  const pentagons = [
    [0, 1, phi], [0, 1, -phi], [0, -1, phi], [0, -1, -phi],
    [1, phi, 0], [1, -phi, 0], [-1, phi, 0], [-1, -phi, 0],
    [phi, 0, 1], [phi, 0, -1], [-phi, 0, 1], [-phi, 0, -1],
  ];

  let minDist = Infinity;
  for (const p of pentagons) {
    const cx = p[0] * invMag;
    const cy = p[1] * invMag;
    const cz = p[2] * invMag;
    const dist = Math.acos(clamp(px * cx + py * cy + pz * cz, -1, 1));
    if (dist < minDist) minDist = dist;
  }

  const seamWidth = 0.18;
  if (minDist < seamWidth) {
    return 0.15 + (minDist / seamWidth) * 0.1;
  } else {
    const hexDist = minDist - seamWidth;
    const hexEdge = 0.35;
    if (hexDist < hexEdge * 0.5) {
      return 0.55 + (hexDist / (hexEdge * 0.5)) * 0.15;
    }
    return 0.7;
  }
}

export default function AsciiCanvas() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let cols = 0;
    let rows = 0;
    let time = 0;
    let rafId = 0;
    const mouse = { x: -1000, y: -1000 };

    const resize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      width = parent.offsetWidth;
      height = parent.offsetHeight;

      const dpr = window.devicePixelRatio || 1;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);

      cols = width < 768 ? 90 : 128;
      const cellW = width / cols;
      const cellH = cellW * 1.18;
      if (width === 0 || cellH === 0) {
        rows = 0;
      } else {
        rows = Math.ceil(height / cellH);
      }
    };

    const onMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    };

    const draw = () => {
      ctx.fillStyle = '#0A0A0A';
      ctx.fillRect(0, 0, width, height);

      time += 0.012;

      const cellW = width / cols;
      const cellH = cellW * 1.18;

      const ballX = width * 0.5;
      const ballY = height * 0.5;
      const ballRadius = Math.min(width, height) * 0.24;

      ctx.font = `${cellH * 0.84}px "Fragment Mono", "IBM Plex Mono", monospace`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      let lx = 1.0;
      let ly = 0.15;
      let lz = -0.6;
      const lLen = Math.hypot(lx, ly, lz);
      lx /= lLen;
      ly /= lLen;
      lz /= lLen;

      const rotY = time * 0.4;
      const rotX = Math.sin(time * 0.15) * 0.2;

      for (let r = 0; r < rows; r++) {
        const rowY = r * cellH + cellH / 2;
        const laneNorm = rowY / height;
        const laneSpeed = 1.75;

        for (let c = 0; c < cols; c++) {
          const x = c * cellW + cellW / 2;
          const y = rowY;

          const dxBall = x - ballX;
          const dyBall = y - ballY;
          const distBall = Math.hypot(dxBall, dyBall);
          const normBall = distBall / ballRadius;
          const angleBall = Math.atan2(dyBall, dxBall);

          const mouseDistance = Math.hypot(x - mouse.x, y - mouse.y);
          const mouseField = Math.exp(-mouseDistance * 0.0038);

          let char = '';
          let opacity = 0;
          let drawX = x;
          let drawY = y;

          if (normBall < 1.0) {
            const localX = dxBall / ballRadius;
            const localY = -(y - ballY) / ballRadius;
            const localR2 = localX * localX + localY * localY;
            const z = Math.sqrt(Math.max(0, 1.0 - localR2));

            const cosRY = Math.cos(rotY);
            const sinRY = Math.sin(rotY);
            const px0 = localX * cosRY - z * sinRY;
            const pz0 = localX * sinRY + z * cosRY;
            const py0 = localY;

            const cosRX = Math.cos(rotX);
            const sinRX = Math.sin(rotX);
            const px = px0;
            const py = py0 * cosRX - pz0 * sinRX;
            const pz = py0 * sinRX + pz0 * cosRX;

            const normLen = Math.hypot(px, py, pz) || 1;
            const nx = px / normLen;
            const ny = py / normLen;
            const nz = pz / normLen;

            let diffuse = nx * lx + ny * ly + nz * lz;
            diffuse = Math.max(0, diffuse);

            const panelIntensity = getFootballPanelIntensity(nx, ny, nz);
            const surfaceDetail = noise2D(nx * 15 + 10, ny * 15 + 5) * 0.08;

            const ambient = 0.02;
            let intensity = ambient + diffuse * (panelIntensity + surfaceDetail) * 1.4;

            const specularPower = 20;
            const halfX = lx;
            const halfY = ly;
            const halfZ = lz;
            const halfLen = Math.hypot(halfX, halfY, halfZ) || 1;
            const dotNH = nx * (halfX / halfLen) + ny * (halfY / halfLen) + nz * (halfZ / halfLen);
            const specular = Math.pow(Math.max(0, dotNH), specularPower) * 0.3;
            intensity += specular;

            intensity = clamp(intensity, 0, 1);

            const ballIdx = clamp(
              Math.floor(intensity * (BALL_CHARS.length - 1)),
              0,
              BALL_CHARS.length - 1
            );

            char = BALL_CHARS[ballIdx];
            opacity = clamp(0.2 + intensity * 0.82, 0.2, 1);

            const edgeBend = Math.exp(-Math.abs(normBall - 1.0) * 8) * 4;
            drawX += -Math.sin(angleBall) * edgeBend;
            drawY += Math.cos(angleBall) * edgeBend * 0.4;

            drawX += Math.sin(time * 3.6 + r * 0.32 + c * 0.11) * mouseField * 16;
            drawY += Math.cos(time * 2.8 + c * 0.24) * mouseField * 5;
          } else {
            const sampleX =
              c * 0.085 -
              time * (1.8 + laneSpeed * 1.6) +
              Math.sin(time * 4.2 + r * 0.28 + c * 0.08) * mouseField * 1.8;
            const sampleY =
              r * 0.11 +
              Math.sin(c * 0.025 + time * 1.2) * 0.6 +
              Math.cos(time * 3.4 + c * 0.2) * mouseField * 1.1;

            const flowA = noise2D(sampleX, sampleY);
            const flowB = noise2D(sampleX * 1.7 + 20, sampleY * 0.8 - 14);
            const wave =
              Math.sin(sampleX * 1.9 + laneNorm * 14) * 0.5 +
              Math.cos(sampleY * 2.4 - time * 2.1) * 0.5;

            let density = flowA * 0.42 + flowB * 0.28 + (wave * 0.5 + 0.5) * 0.3;

            const orbitBand = Math.exp(-Math.pow((normBall - 1.12) * 5.5, 2));
            density += orbitBand * 0.16;

            if (density > 0.38) {
              const fieldIdx = clamp(
                Math.floor(density * (FIELD_CHARS.length - 1)),
                0,
                FIELD_CHARS.length - 1
              );
              char = FIELD_CHARS[fieldIdx];
              opacity = 0.035 + density * 0.24;

              drawX += (laneSpeed * 8 + flowB * 16) % (cellW * 3);
              drawY += Math.sin(sampleX * 2.2 + time + laneNorm * 8) * 1.8;

              const swirl = orbitBand * 10;
              drawX += -Math.sin(angleBall) * swirl;
              drawY += Math.cos(angleBall) * swirl * 0.6;

              drawX += Math.sin(time * 4.8 + r * 0.35 + c * 0.1) * mouseField * 18;
              drawY += Math.cos(time * 3.2 + c * 0.25) * mouseField * 6;
              density += mouseField * 0.24;
            }
          }

          if (!char || opacity <= 0.02) continue;

          ctx.fillStyle = `rgba(232, 230, 224, ${opacity})`;
          ctx.fillText(char, drawX, drawY);
        }
      }

      rafId = requestAnimationFrame(draw);
    };

    document.fonts.ready.then(() => {
      resize();
      draw();
    });

    window.addEventListener('resize', resize);
    window.addEventListener('mousemove', onMouseMove);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMouseMove);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        display: 'block',
      }}
    />
  );
}
