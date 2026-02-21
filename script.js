const form = document.getElementById('cvForm');
const fileInput = document.getElementById('cvFile');
const emailInput = document.getElementById('email');
const fileNameDisplay = document.getElementById('fileName');
const dropText = document.getElementById('dropText');
const statusMessage = document.getElementById('statusMessage');
const submitBtn = document.getElementById('submitBtn');
const gravityCanvas = document.getElementById('gravityBg');
const dropArea = document.getElementById('dropArea');

// Sizin webhook ünvanınız
const webhookUrl = 'https://n8n.datatek.tech/webhook-test/b7db9dbc-15b6-4137-8d3a-cff2d108cb8a';
const fallbackWebhookUrl = webhookUrl.includes('/webhook-test/')
    ? webhookUrl.replace('/webhook-test/', '/webhook/')
    : null;

function initGravityBackground() {
    if (!gravityCanvas) {
        return;
    }

    const ctx = gravityCanvas.getContext('2d');
    if (!ctx) {
        return;
    }

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
        return;
    }

    const particles = [];
    const primaryColor = getComputedStyle(document.documentElement)
        .getPropertyValue('--primary-color')
        .trim() || '#4F46E5';
    const gravity = 0.04;
    const particleCount = Math.max(30, Math.min(100, Math.floor(window.innerWidth / 16)));
    let width = 0;
    let height = 0;
    let rafId;

    function resizeCanvas() {
        width = window.innerWidth;
        height = window.innerHeight;
        gravityCanvas.width = width;
        gravityCanvas.height = height;
    }

    function createParticle() {
        return {
            x: Math.random() * width,
            y: Math.random() * height,
            vx: (Math.random() - 0.5) * 0.4,
            vy: Math.random() * 0.8,
            radius: 1.2 + Math.random() * 2.6,
            alpha: 0.15 + Math.random() * 0.35
        };
    }

    function drawParticle(particle) {
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        ctx.fillStyle = primaryColor;
        ctx.globalAlpha = particle.alpha;
        ctx.fill();
        ctx.globalAlpha = 1;
    }

    function updateParticle(particle) {
        particle.vy += gravity;
        particle.y += particle.vy;
        particle.x += particle.vx;

        if (particle.y - particle.radius > height) {
            particle.y = -particle.radius;
            particle.x = Math.random() * width;
            particle.vy = Math.random() * 0.8;
        }

        if (particle.x < -particle.radius) {
            particle.x = width + particle.radius;
        }

        if (particle.x > width + particle.radius) {
            particle.x = -particle.radius;
        }
    }

    function animate() {
        ctx.clearRect(0, 0, width, height);

        for (let i = 0; i < particles.length; i++) {
            const particle = particles[i];
            updateParticle(particle);
            drawParticle(particle);
        }

        rafId = window.requestAnimationFrame(animate);
    }

    resizeCanvas();

    for (let i = 0; i < particleCount; i++) {
        particles.push(createParticle());
    }

    animate();
    window.addEventListener('resize', resizeCanvas);

    window.addEventListener('beforeunload', function() {
        if (rafId) {
            window.cancelAnimationFrame(rafId);
        }
    });
}

initGravityBackground();

// Fayl seçildikdə adını göstərmək
fileInput.addEventListener('change', function() {
    if (this.files && this.files.length > 0) {
        fileNameDisplay.textContent = this.files[0].name;
        dropText.style.display = 'none';
    } else {
        fileNameDisplay.textContent = '';
        dropText.style.display = 'block';
    }
});

// Mesajları göstərmək üçün köməkçi funksiya
function showMessage(msg, type) {
    statusMessage.textContent = msg;
    statusMessage.className = 'message ' + type;
}

// Form göndərilərkən baş verəcək hadisələr
form.addEventListener('submit', async function(e) {
    e.preventDefault(); // Səhifənin yenilənməsinin qarşısını alırıq
    statusMessage.style.display = 'none';

    const file = fileInput.files[0];
    const email = emailInput.value;

    // 1. E-poçt yoxlanışı
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        showMessage('Zəhmət olmasa, düzgün e-poçt ünvanı daxil edin.', 'error');
        return;
    }

    // 2. Faylın mövcudluq yoxlanışı
    if (!file) {
        showMessage('Zəhmət olmasa, CV faylını yükləyin.', 'error');
        return;
    }

    // 3. Fayl formatının yoxlanılması (yalnız PDF və ya DOCX)
    const validExtensions = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    const fileName = file.name.toLowerCase();
    const isValidExtension = validExtensions.includes(file.type) || fileName.endsWith('.pdf') || fileName.endsWith('.docx');

    if (!isValidExtension) {
        showMessage('Xəta: Fayl göndərilmədi. Yalnız PDF və DOCX formatları qəbul edilir!', 'error');
        return;
    }

    // Məlumatları FormData obyektinə yığırıq (fayl göndərmək üçün lazımdır)
    const formData = new FormData();
    formData.append('cv', file);
    formData.append('email', email);

    // Məlumatın Webhook-a göndərilməsi
    try {
        submitBtn.textContent = 'Göndərilir...';
        submitBtn.disabled = true;

        let response = await fetch(webhookUrl, {
            method: 'POST',
            body: formData,
            mode: 'no-cors',
        });
        let requestSucceeded = response.ok || response.type === 'opaque';

        // n8n-də webhook-test yalnız "Listen for test event" aktiv olduqda işləyir.
        // Aktiv deyilsə, production endpoint-ə avtomatik fallback edirik.
        if (!requestSucceeded && fallbackWebhookUrl && (response.status === 404 || response.status === 410)) {
            response = await fetch(fallbackWebhookUrl, {
                method: 'POST',
                body: formData,
                mode: 'no-cors',
            });
            requestSucceeded = response.ok || response.type === 'opaque';
        }

        if (requestSucceeded) {
            // Formu deaktiv et və uğur göstər
            dropArea.classList.add('success');
            dropArea.innerHTML = `
                <div class="success-icon">
                    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                    </svg>
                    <span>CV uğurla yükləndi</span>
                </div>
            `;
            emailInput.disabled = true;
            submitBtn.style.display = 'none';
            statusMessage.style.display = 'none';
        } else {
            showMessage(`Xəta baş verdi: CV göndərilə bilmədi (Server xətası: ${response.status}).`, 'error');
        }
    } catch (error) {
        console.error('Fetch xətası:', error);
        showMessage('Xəta baş verdi: CV göndərilə bilmədi. İnternet bağlantınızı və ya CORS ayarlarını yoxlayın.', 'error');
    } finally {
        submitBtn.textContent = 'CV-ni Göndər';
        submitBtn.disabled = false;
    }
});