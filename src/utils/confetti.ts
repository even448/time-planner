// 五彩纸屑特效工具
export interface ConfettiOptions {
  particleCount?: number;
  spread?: number;
  startVelocity?: number;
  decay?: number;
  scalar?: number;
  ticks?: number;
  origin?: { x: number; y: number };
  colors?: string[];
  shapes?: ('square' | 'circle')[];
  gravity?: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  rotation: number;
  rotationSpeed: number;
  size: number;
  color: string;
  shape: 'square' | 'circle';
  opacity: number;
  life: number;
  decay: number;
  gravity: number;
}

class ConfettiManager {
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private particles: Particle[] = [];
  private animationId: number | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.canvas = document.createElement('canvas');
      this.canvas.style.position = 'fixed';
      this.canvas.style.top = '0';
      this.canvas.style.left = '0';
      this.canvas.style.width = '100%';
      this.canvas.style.height = '100%';
      this.canvas.style.pointerEvents = 'none';
      this.canvas.style.zIndex = '9999';
      this.ctx = this.canvas.getContext('2d');
      this.resizeCanvas();
      window.addEventListener('resize', () => this.resizeCanvas());
    }
  }

  private resizeCanvas() {
    if (this.canvas) {
      this.canvas.width = window.innerWidth;
      this.canvas.height = window.innerHeight;
    }
  }

  private createParticle(options: ConfettiOptions): Particle {
    const angle = Math.random() * Math.PI * 2;
    const velocity = (options.startVelocity || 25) * (0.5 + Math.random() * 0.5);
    const spread = (options.spread || 360) * (Math.PI / 180);
    
    const vx = Math.cos(angle) * velocity * Math.sin(spread / 2);
    const vy = Math.sin(angle) * velocity * Math.sin(spread / 2) - (options.startVelocity || 25);

    const colors = options.colors || ['#ff6b6b', '#4ecdc4', '#45b7d1', '#f7dc6f', '#bb8fce', '#ff6b9d'];
    const shapes = options.shapes || ['square', 'circle'];

    return {
      x: (options.origin?.x || 0.5) * window.innerWidth,
      y: (options.origin?.y || 0.5) * window.innerHeight,
      vx,
      vy,
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.2,
      size: (options.scalar || 1) * (5 + Math.random() * 5),
      color: colors[Math.floor(Math.random() * colors.length)],
      shape: shapes[Math.floor(Math.random() * shapes.length)],
      opacity: 1,
      life: options.ticks || 200,
      decay: options.decay || 0.9,
      gravity: options.gravity || 0.5,
    };
  }

  public confetti(options: ConfettiOptions = {}) {
    const particleCount = options.particleCount || 50;

    if (!this.canvas?.parentElement) {
      document.body.appendChild(this.canvas!);
    }

    for (let i = 0; i < particleCount; i++) {
      this.particles.push(this.createParticle(options));
    }

    if (!this.animationId) {
      this.animate();
    }
  }

  private animate = () => {
    if (!this.ctx || !this.canvas) return;

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    this.particles = this.particles.filter((particle) => {
      particle.x += particle.vx;
      particle.y += particle.vy;
      particle.vy += particle.gravity;
      particle.vx *= particle.decay;
      particle.vy *= particle.decay;
      particle.rotation += particle.rotationSpeed;
      particle.life--;
      particle.opacity = Math.max(0, particle.life / 100);

      if (particle.life <= 0 || particle.y > this.canvas!.height) {
        return false;
      }

      this.ctx!.save();
      this.ctx!.translate(particle.x, particle.y);
      this.ctx!.rotate(particle.rotation);
      this.ctx!.globalAlpha = particle.opacity;
      this.ctx!.fillStyle = particle.color;

      if (particle.shape === 'circle') {
        this.ctx!.beginPath();
        this.ctx!.arc(0, 0, particle.size / 2, 0, Math.PI * 2);
        this.ctx!.fill();
      } else {
        this.ctx!.fillRect(-particle.size / 2, -particle.size / 2, particle.size, particle.size);
      }

      this.ctx!.restore();

      return true;
    });

    if (this.particles.length > 0) {
      this.animationId = requestAnimationFrame(this.animate);
    } else {
      this.animationId = null;
      if (this.canvas?.parentElement) {
        document.body.removeChild(this.canvas);
      }
    }
  };
}

// 单例模式
const confettiManager = new ConfettiManager();

export const confetti = (options?: ConfettiOptions) => {
  confettiManager.confetti(options);
};

export default confetti;
