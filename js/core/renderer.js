function drawRoundedRect(ctx, x, y, width, height, radius, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + width, y, x + width, y + height, radius);
  ctx.arcTo(x + width, y + height, x, y + height, radius);
  ctx.arcTo(x, y + height, x, y, radius);
  ctx.arcTo(x, y, x + width, y, radius);
  ctx.closePath();
  ctx.fill();
}

export class Renderer {
  constructor(canvas, level) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.level = level;
    this.parallax = { near: 0, mid: 0, far: 0 };
  }

  setLevel(level) {
    this.level = level;
  }

  render(state) {
    const { ctx, canvas } = this;
    const { player, obstacles, coins, powerups, distance } = state;
    const groundY = state.groundY;

    this.parallax.far = (distance * 0.08) % canvas.width;
    this.parallax.mid = (distance * 0.16) % canvas.width;
    this.parallax.near = (distance * 0.3) % canvas.width;

    // Sky
    ctx.fillStyle = this.level.backdrop.sky;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Far city blocks
    ctx.fillStyle = this.level.backdrop.city;
    for (let i = -1; i <= 8; i += 1) {
      const x = i * 150 - this.parallax.far;
      ctx.fillRect(x, 170, 100, 120 + (i % 3) * 20);
    }

    // Mid hills
    ctx.fillStyle = this.level.backdrop.hill;
    for (let i = -1; i <= 7; i += 1) {
      const x = i * 180 - this.parallax.mid;
      ctx.beginPath();
      ctx.arc(x + 90, groundY + 32, 100, Math.PI, 2 * Math.PI);
      ctx.fill();
    }

    // Ground
    ctx.fillStyle = this.level.backdrop.ground;
    ctx.fillRect(0, groundY, canvas.width, canvas.height - groundY);

    ctx.strokeStyle = "rgba(255,255,255,0.3)";
    ctx.lineWidth = 2;
    for (let x = -40; x < canvas.width + 60; x += 80) {
      const pathX = x - (this.parallax.near % 80);
      ctx.beginPath();
      ctx.moveTo(pathX, groundY + 16);
      ctx.lineTo(pathX + 40, groundY + 16);
      ctx.stroke();
    }

    // Coins
    coins.forEach((coin) => {
      ctx.fillStyle = "#ffd447";
      ctx.beginPath();
      ctx.arc(coin.x + coin.radius, coin.y + coin.radius, coin.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#ad7c00";
      ctx.fillRect(coin.x + coin.radius - 4, coin.y + coin.radius - 8, 8, 16);
    });

    // Powerups
    powerups.forEach((powerup) => {
      drawRoundedRect(ctx, powerup.x, powerup.y, powerup.width, powerup.height, 8, powerup.color);
      ctx.fillStyle = "#14223f";
      ctx.font = "bold 12px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(powerup.label[0], powerup.x + powerup.width / 2, powerup.y + powerup.height / 1.5);
    });

    // Obstacles
    obstacles.forEach((obstacle) => {
      ctx.fillStyle = obstacle.color;
      if (obstacle.type === "cone") {
        ctx.beginPath();
        ctx.moveTo(obstacle.x, obstacle.y + obstacle.height);
        ctx.lineTo(obstacle.x + obstacle.width / 2, obstacle.y);
        ctx.lineTo(obstacle.x + obstacle.width, obstacle.y + obstacle.height);
        ctx.closePath();
        ctx.fill();
      } else if (obstacle.type === "drone") {
        drawRoundedRect(ctx, obstacle.x, obstacle.y, obstacle.width, obstacle.height, 8, obstacle.color);
        ctx.fillStyle = "#8dd3ff";
        ctx.fillRect(obstacle.x + 8, obstacle.y - 6, obstacle.width - 16, 4);
      } else if (obstacle.type === "ramp") {
        ctx.beginPath();
        ctx.moveTo(obstacle.x, obstacle.y + obstacle.height);
        ctx.lineTo(obstacle.x + obstacle.width, obstacle.y + obstacle.height);
        ctx.lineTo(obstacle.x + obstacle.width, obstacle.y);
        ctx.closePath();
        ctx.fill();
      } else {
        drawRoundedRect(ctx, obstacle.x, obstacle.y, obstacle.width, obstacle.height, 6, obstacle.color);
      }
    });

    // Player (original code-based art)
    const bob = Math.sin(state.animationClock * 14) * (player.isGrounded() ? 3 : 1);
    const px = player.x;
    const py = player.y + bob;

    drawRoundedRect(ctx, px + 10, py + 18, 36, player.height - 18, 12, player.character.color);
    drawRoundedRect(ctx, px + 18, py + 2, 20, 20, 10, "#ffd9b3");

    ctx.fillStyle = player.character.accent;
    ctx.fillRect(px + 8, py + 40, 40, 8);

    ctx.fillStyle = "#111";
    ctx.beginPath();
    ctx.arc(px + 25, py + 12, 2, 0, Math.PI * 2);
    ctx.arc(px + 32, py + 12, 2, 0, Math.PI * 2);
    ctx.fill();

    if (player.character.id === "liam") {
      ctx.strokeStyle = "#80ffdb";
      ctx.beginPath();
      ctx.moveTo(px + 18, py + 28);
      ctx.lineTo(px + 40, py + 28);
      ctx.stroke();
    }

    if (player.character.id === "addy") {
      ctx.fillStyle = "#ff99c8";
      ctx.fillRect(px + 4, py + 14, 6, 6);
      ctx.fillRect(px + 46, py + 14, 6, 6);
    }

    if (player.kickTimer > 0) {
      ctx.strokeStyle = "#ffe48a";
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(px + player.width + 8, py + player.height - 24, 18, -0.7, 0.7);
      ctx.stroke();
    }

    if (player.shieldTimer > 0) {
      ctx.strokeStyle = "rgba(140, 224, 255, 0.85)";
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(px + player.width / 2, py + player.height / 2, 44, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Progress bar
    const progress = Math.min(1, state.distance / this.level.length);
    ctx.fillStyle = "rgba(16,20,34,0.6)";
    ctx.fillRect(20, 14, canvas.width - 40, 14);
    ctx.fillStyle = "#6ef3b5";
    ctx.fillRect(20, 14, (canvas.width - 40) * progress, 14);
  }
}
