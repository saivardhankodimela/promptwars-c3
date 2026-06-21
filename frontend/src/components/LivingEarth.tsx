"use client";

import React, { useRef, useEffect } from "react";

interface LivingEarthProps {
  score: number; // 0 to 100
}

export const LivingEarth = ({ score }: LivingEarthProps) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    let time = 0;

    const resizeCanvas = () => {
      const rect = canvas.parentElement?.getBoundingClientRect();
      canvas.width = rect?.width || 500;
      canvas.height = rect?.height || 300;
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // Color helpers based on score
    const lerpColor = (c1: string, c2: string, amt: number) => {
      const parse = (c: string) => {
        if (c.startsWith("#")) {
          const r = parseInt(c.slice(1, 3), 16);
          const g = parseInt(c.slice(3, 5), 16);
          const b = parseInt(c.slice(5, 7), 16);
          return [r, g, b];
        }
        // Fallback for green / slate
        return [34, 197, 94];
      };

      const [r1, g1, b1] = parse(c1);
      const [r2, g2, b2] = parse(c2);

      const r = Math.round(r1 + (r2 - r1) * amt);
      const g = Math.round(g1 + (g2 - g1) * amt);
      const b = Math.round(b1 + (b2 - b1) * amt);

      return `rgb(${r}, ${g}, ${b})`;
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      time += 0.05;

      const norm = score / 100; // 0.0 to 1.0

      // 1. Draw Sky (clean blue-green vs polluted smog-grey)
      const skyTop = lerpColor("#1e293b", "#0f172a", norm); // Top remains dark
      const skyBottom = lerpColor("#4b5563", "#042f1a", norm); // Bottom transitions to deep forest-green gradient
      
      const skyGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      skyGradient.addColorStop(0, skyTop);
      skyGradient.addColorStop(0.7, skyBottom);
      ctx.fillStyle = skyGradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // 2. Draw Sun / Haze
      const sunX = canvas.width * 0.75;
      const sunY = canvas.height * 0.25;
      const sunRadius = 24 + 10 * norm;

      // Glow effect
      ctx.shadowBlur = norm * 40;
      ctx.shadowColor = lerpColor("#9ca3af", "#f59e0b", norm);
      
      ctx.beginPath();
      ctx.arc(sunX, sunY, sunRadius, 0, Math.PI * 2);
      ctx.fillStyle = lerpColor("#6b7280", "#fef08a", norm);
      ctx.fill();
      
      ctx.shadowBlur = 0; // Reset shadow

      // Draw Haze lines if score is low
      if (norm < 0.6) {
        ctx.fillStyle = "rgba(107, 114, 128, 0.25)";
        ctx.fillRect(0, sunY - 10, canvas.width, 25);
        ctx.fillRect(0, sunY + 30, canvas.width, 15);
      }

      // 3. Draw Mountains (Background)
      ctx.fillStyle = lerpColor("#1f2937", "#064e3b", norm);
      ctx.beginPath();
      ctx.moveTo(0, canvas.height * 0.65);
      ctx.quadraticCurveTo(canvas.width * 0.25, canvas.height * 0.5, canvas.width * 0.5, canvas.height * 0.65);
      ctx.quadraticCurveTo(canvas.width * 0.75, canvas.height * 0.45, canvas.width, canvas.height * 0.65);
      ctx.lineTo(canvas.width, canvas.height);
      ctx.lineTo(0, canvas.height);
      ctx.fill();

      // 4. Draw River/Stream
      const riverGradient = ctx.createLinearGradient(0, canvas.height * 0.7, 0, canvas.height);
      riverGradient.addColorStop(0, lerpColor("#4b5563", "#0ea5e9", norm));
      riverGradient.addColorStop(1, lerpColor("#374151", "#0284c7", norm));
      ctx.fillStyle = riverGradient;
      
      ctx.beginPath();
      ctx.moveTo(0, canvas.height * 0.75);
      // Sine wave animation on river surface
      const riverOffset = Math.sin(time) * 4;
      ctx.bezierCurveTo(
        canvas.width * 0.3, canvas.height * (0.7 + riverOffset/100), 
        canvas.width * 0.6, canvas.height * (0.85 + riverOffset/100), 
        canvas.width, canvas.height * 0.75
      );
      ctx.lineTo(canvas.width, canvas.height);
      ctx.lineTo(0, canvas.height);
      ctx.fill();

      // 5. Draw Trees
      const drawTree = (x: number, y: number, scale: number, isLeafy: boolean) => {
        // Trunk
        ctx.fillStyle = "#78350f";
        ctx.fillRect(x - 3 * scale, y - 25 * scale, 6 * scale, 25 * scale);

        if (isLeafy) {
          // Leaf clumps
          ctx.fillStyle = lerpColor("#374151", "#10b981", norm);
          
          ctx.beginPath();
          ctx.arc(x, y - 28 * scale, 12 * scale, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = lerpColor("#4b5563", "#059669", norm);
          ctx.beginPath();
          ctx.arc(x - 8 * scale, y - 22 * scale, 8 * scale, 0, Math.PI * 2);
          ctx.arc(x + 8 * scale, y - 22 * scale, 8 * scale, 0, Math.PI * 2);
          ctx.fill();
        } else {
          // Dry twigs
          ctx.strokeStyle = "#4b5563";
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(x, y - 20 * scale);
          ctx.lineTo(x - 8 * scale, y - 28 * scale);
          ctx.moveTo(x, y - 15 * scale);
          ctx.lineTo(x + 8 * scale, y - 22 * scale);
          ctx.stroke();
        }
      };

      // Determine tree count and health based on score
      const maxTrees = 7;
      const activeTrees = Math.max(1, Math.round(norm * maxTrees));
      const treePositions = [
        { x: canvas.width * 0.15, y: canvas.height * 0.78, scale: 1.2 },
        { x: canvas.width * 0.08, y: canvas.height * 0.82, scale: 1.0 },
        { x: canvas.width * 0.28, y: canvas.height * 0.74, scale: 0.95 },
        { x: canvas.width * 0.45, y: canvas.height * 0.88, scale: 1.3 },
        { x: canvas.width * 0.65, y: canvas.height * 0.81, scale: 1.1 },
        { x: canvas.width * 0.82, y: canvas.height * 0.78, scale: 1.05 },
        { x: canvas.width * 0.90, y: canvas.height * 0.84, scale: 1.25 }
      ];

      treePositions.forEach((pos, idx) => {
        const exist = idx < activeTrees;
        // High score trees are leafy, low score trees are dried twigs
        drawTree(pos.x, pos.y, pos.scale, exist && norm > 0.4);
      });

      // 6. Draw Wildlife (Bird flying in the sky if score is high)
      if (norm > 0.65) {
        ctx.fillStyle = "rgba(242, 247, 244, 0.6)";
        const birdX = (canvas.width * 0.2 + time * 15) % (canvas.width + 50) - 20;
        const birdY = canvas.height * 0.25 + Math.sin(time) * 10;
        
        ctx.beginPath();
        ctx.moveTo(birdX, birdY);
        ctx.lineTo(birdX - 8, birdY - 4);
        ctx.lineTo(birdX - 4, birdY);
        ctx.lineTo(birdX - 8, birdY + 4);
        ctx.fill();
      }

      // 7. Render particles
      if (norm > 0.7) {
        // Draw green floating leaf particles (clean environment)
        ctx.fillStyle = "rgba(34, 197, 94, 0.4)";
        for (let i = 0; i < 6; i++) {
          const px = (canvas.width * (i / 6) + time * 10) % canvas.width;
          const py = (canvas.height * 0.5 + Math.sin(time + i) * 30) % canvas.height;
          ctx.beginPath();
          ctx.ellipse(px, py, 3, 5, Math.PI / 4, 0, Math.PI * 2);
          ctx.fill();
        }
      } else if (norm < 0.4) {
        // Draw floating smog soot particles (dirty environment)
        ctx.fillStyle = "rgba(107, 114, 128, 0.35)";
        for (let i = 0; i < 10; i++) {
          const px = (canvas.width * (i / 10) + time * 8) % canvas.width;
          const py = (canvas.height * 0.3 + Math.cos(time + i) * 40) % canvas.height;
          ctx.beginPath();
          ctx.arc(px, py, 2, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      animationId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", resizeCanvas);
    };
  }, [score]);

  return (
    <div className="w-full h-full relative overflow-hidden rounded-2xl border border-card-border bg-[#080d0a]/60">
      <canvas
        ref={canvasRef}
        className="w-full h-full block"
        role="img"
        aria-label={`Living Earth canvas visualizer. Current environmental health score is ${score}/100. A high score shows leafy trees, clear blue skies, clean river water, and wildlife, while a low score simulates smog, withered branches, soot, and polluted grey water.`}
      >
        Visual representation of the Earth's environment. A higher sustainability score of {score}/100 renders a clean sky, leafy trees, clear river, and flying wildlife. A lower score renders smog, soot particles, dry branches, and polluted grey water.
      </canvas>
      <div className="absolute top-4 left-4 bg-background/80 backdrop-blur-sm px-3 py-1.5 rounded-full border border-card-border">
        <span className="text-xs font-bold text-foreground/80 flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse" />
          Living Earth: {score}/100
        </span>
      </div>
    </div>
  );
};
