class ShadowHuntGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.player = { x: 400, y: 300, size: 20, speed: 5 };
        this.sanity = 100;
        this.flashlightOn = false;
        this.shadows = [];
        this.keys = {};
        
        this.init();
    }

    init() {
        // إعداد التحكم
        document.addEventListener('keydown', (e) => this.keys[e.key] = true);
        document.addEventListener('keyup', (e) => this.keys[e.key] = false);
        
        // إعداد الضوء
        document.addEventListener('click', () => this.toggleFlashlight());
        
        // بدء اللعبة
        this.gameLoop();
        this.spawnShadows();
    }

    toggleFlashlight() {
        this.flashlightOn = !this.flashlightOn;
        document.getElementById('flashlight-indicator').style.opacity = 
            this.flashlightOn ? '1' : '0.5';
    }

    updatePlayer() {
        if (this.keys['ArrowUp'] || this.keys['w']) this.player.y -= this.player.speed;
        if (this.keys['ArrowDown'] || this.keys['s']) this.player.y += this.player.speed;
        if (this.keys['ArrowLeft'] || this.keys['a']) this.player.x -= this.player.speed;
        if (this.keys['ArrowRight'] || this.keys['d']) this.player.x += this.player.speed;

        // حدود اللعبة
        this.player.x = Math.max(0, Math.min(this.canvas.width, this.player.x));
        this.player.y = Math.max(0, Math.min(this.canvas.height, this.player.y));
    }

    updateSanity() {
        if (!this.flashlightOn) {
            this.sanity -= 0.1;
        }
        
        this.sanity = Math.max(0, Math.min(100, this.sanity));
        document.getElementById('sanity-level').style.width = this.sanity + '%';
        
        if (this.sanity <= 0) {
            this.gameOver();
        }
    }

    spawnShadows() {
        setInterval(() => {
            if (this.shadows.length < 5) {
                this.shadows.push({
                    x: Math.random() * this.canvas.width,
                    y: Math.random() * this.canvas.height,
                    size: 30,
                    speed: 2
                });
            }
        }, 3000);
    }

    updateShadows() {
        this.shadows.forEach(shadow => {
            // تتبع اللاعب
            const dx = this.player.x - shadow.x;
            const dy = this.player.y - shadow.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance > 0) {
                shadow.x += (dx / distance) * shadow.speed;
                shadow.y += (dy / distance) * shadow.speed;
            }

            // الاصطدام
            if (distance < this.player.size + shadow.size && !this.flashlightOn) {
                this.sanity -= 10;
            }
        });
    }

    draw() {
        // مسح الشاشة
        this.ctx.fillStyle = '#111';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // رسم الظلال
        this.ctx.fillStyle = '#000';
        this.shadows.forEach(shadow => {
            this.ctx.beginPath();
            this.ctx.arc(shadow.x, shadow.y, shadow.size, 0, Math.PI * 2);
            this.ctx.fill();
        });

        // رسم اللاعب
        this.ctx.fillStyle = this.flashlightOn ? '#FFD700' : '#FFF';
        this.ctx.beginPath();
        this.ctx.arc(this.player.x, this.player.y, this.player.size, 0, Math.PI * 2);
        this.ctx.fill();

        // تأثير الضوء
        if (this.flashlightOn) {
            const gradient = this.ctx.createRadialGradient(
                this.player.x, this.player.y, 0,
                this.player.x, this.player.y, 200
            );
            gradient.addColorStop(0, 'rgba(255, 215, 0, 0.3)');
            gradient.addColorStop(1, 'rgba(255, 215, 0, 0)');
            
            this.ctx.fillStyle = gradient;
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        }
    }

    gameOver() {
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.ctx.fillStyle = '#8B0000';
        this.ctx.font = '48px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('لقد فقدت عقلك!', this.canvas.width/2, this.canvas.height/2);
    }

    gameLoop() {
        this.updatePlayer();
        this.updateSanity();
        this.updateShadows();
        this.draw();
        
        requestAnimationFrame(() => this.gameLoop());
    }
}

// بدء اللعبة عندما تحمل الصفحة
window.addEventListener('load', () => {
    new ShadowHuntGame();
});
