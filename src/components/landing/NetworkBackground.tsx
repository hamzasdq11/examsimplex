import { useEffect, useRef } from "react";

interface Node {
  x: number;
  y: number;
  vx: number;
  vy: number;
}

const NetworkBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouse = useRef<{ x: number; y: number } | null>(null);
  const smoothMouse = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    const nodes: Node[] = [];
    const NODE_COUNT = 90;
    const CONNECTION_DIST = 160;
    const MOUSE_DIST = 220;
    const LERP = 0.08;

    const resize = () => {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio;
      canvas.height = canvas.offsetHeight * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };

    const init = () => {
      resize();
      const w = canvas.offsetWidth;
      const h = canvas.offsetHeight;
      nodes.length = 0;
      for (let i = 0; i < NODE_COUNT; i++) {
        nodes.push({
          x: Math.random() * w,
          y: Math.random() * h,
          vx: (Math.random() - 0.5) * 0.3,
          vy: (Math.random() - 0.5) * 0.3,
        });
      }
    };

    const onMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
      if (!smoothMouse.current) smoothMouse.current = { ...mouse.current };
    };

    const onMouseLeave = () => {
      mouse.current = null;
    };

    const draw = () => {
      const w = canvas.offsetWidth;
      const h = canvas.offsetHeight;
      ctx.clearRect(0, 0, w, h);

      // Smooth mouse interpolation
      if (mouse.current && smoothMouse.current) {
        smoothMouse.current.x += (mouse.current.x - smoothMouse.current.x) * LERP;
        smoothMouse.current.y += (mouse.current.y - smoothMouse.current.y) * LERP;
      } else if (!mouse.current) {
        smoothMouse.current = null;
      }

      // Update positions with gentle momentum
      for (const node of nodes) {
        node.x += node.vx;
        node.y += node.vy;
        if (node.x < 0) { node.x = 0; node.vx = Math.abs(node.vx); }
        if (node.x > w) { node.x = w; node.vx = -Math.abs(node.vx); }
        if (node.y < 0) { node.y = 0; node.vy = Math.abs(node.vy); }
        if (node.y > h) { node.y = h; node.vy = -Math.abs(node.vy); }
      }

      // Batch node-to-node lines
      ctx.lineWidth = 0.8;
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const distSq = dx * dx + dy * dy;
          if (distSq < CONNECTION_DIST * CONNECTION_DIST) {
            const dist = Math.sqrt(distSq);
            const opacity = 0.12 * (1 - dist / CONNECTION_DIST);
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.strokeStyle = `hsla(246, 100%, 61%, ${opacity})`;
            ctx.stroke();
          }
        }
      }

      // Draw lines from smoothed cursor to nearby nodes
      const m = smoothMouse.current;
      if (m) {
        ctx.lineWidth = 1.2;
        for (const node of nodes) {
          const dx = m.x - node.x;
          const dy = m.y - node.y;
          const distSq = dx * dx + dy * dy;
          if (distSq < MOUSE_DIST * MOUSE_DIST) {
            const dist = Math.sqrt(distSq);
            const opacity = 0.3 * (1 - dist / MOUSE_DIST);
            ctx.beginPath();
            ctx.moveTo(m.x, m.y);
            ctx.lineTo(node.x, node.y);
            ctx.strokeStyle = `hsla(246, 100%, 61%, ${opacity})`;
            ctx.stroke();
          }
        }
      }

      // Draw dots with glow
      for (const node of nodes) {
        ctx.beginPath();
        ctx.arc(node.x, node.y, 1.8, 0, Math.PI * 2);
        ctx.fillStyle = "hsla(246, 100%, 61%, 0.35)";
        ctx.fill();
      }

      animationId = requestAnimationFrame(draw);
    };

    init();
    draw();

    canvas.addEventListener("mousemove", onMouseMove);
    canvas.addEventListener("mouseleave", onMouseLeave);
    window.addEventListener("resize", init);
    return () => {
      canvas.removeEventListener("mousemove", onMouseMove);
      canvas.removeEventListener("mouseleave", onMouseLeave);
      window.removeEventListener("resize", init);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full z-0"
    />
  );
};

export default NetworkBackground;
