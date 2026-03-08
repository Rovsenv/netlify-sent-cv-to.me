const form = document.getElementById('cvForm');
const fileInput = document.getElementById('cvFile');
const emailInput = document.getElementById('email');
const fileNameDisplay = document.getElementById('fileName');
const dropText = document.getElementById('dropText');
const statusMessage = document.getElementById('statusMessage');
const submitBtn = document.getElementById('submitBtn');
const gravityCanvas = document.getElementById('gravityBg');
const dropArea = document.getElementById('dropArea');
const themeToggle = document.getElementById('themeToggle');
const langToggle = document.getElementById('langToggle');

// Tərcümələr
const translations = {
    az: {
        title: 'Karyera Dəstəyi Agenti',
        subtitle: 'CV-nizi yükləyin və uyğun vakansiyalar əldə edin',
        emailLabel: 'E-poçt ünvanınız',
        emailPlaceholder: 'nümunə@mail.com',
        fileLabel: 'CV Faylı (PDF və ya DOCX)',
        dropText: 'Faylı bura sürükləyin və ya seçmək üçün klikləyin',
        submitBtn: 'CV-ni Göndər',
        submitLoading: 'Göndərilir...',
        successMsg: 'CV uğurla yükləndi',
        errorEmail: 'Zəhmət olmasa, düzgün e-poçt ünvanı daxil edin.',
        errorFile: 'Zəhmət olmasa, CV faylını yükləyin.',
        errorFormat: 'Yalnız PDF və DOCX formatları qəbul edilir!',
        errorServer: 'Xəta baş verdi: CV göndərilə bilmədi',
        errorDailyLimit: 'Gündəlik limit: Bu cihazdan gün ərzində yalnız 10 CV yükləyə bilərsiniz. Sabah yenidən cəhd edin.',
        pageTitle: 'CV Yükləmə Portalı',
        chatbotTitle: 'Karyera Köməkçisi',
        chatbotWelcome: 'Salam! Mən sizin karyera köməkçinizəm. CV və iş axtarmağınız barədə suallarınızı soruşa bilərsiniz.',
        chatInputPlaceholder: 'Sualınızı yazın...',
        chatError: 'Xəta baş verdi. Zəhmət olmasa, yenidən cəhd edin.'
    },
    en: {
        title: 'Career Support Agent',
        subtitle: 'Upload your CV and get matched vacancies',
        emailLabel: 'Your email address',
        emailPlaceholder: 'example@mail.com',
        fileLabel: 'CV File (PDF or DOCX)',
        dropText: 'Drag file here or click to select',
        submitBtn: 'Submit CV',
        submitLoading: 'Submitting...',
        successMsg: 'CV uploaded successfully',
        errorEmail: 'Please enter a valid email address.',
        errorFile: 'Please upload your CV file.',
        errorFormat: 'Only PDF and DOCX formats are accepted!',
        errorServer: 'Error: Could not submit CV',
        errorDailyLimit: 'Daily limit: You can only upload 10 CVs per day from this device. Please try again tomorrow.',
        pageTitle: 'CV Upload Portal',
        chatbotTitle: 'Career Assistant',
        chatbotWelcome: 'Hello! I am your career assistant. Feel free to ask questions about your CV and job search.',
        chatInputPlaceholder: 'Type your question...',
        chatError: 'An error occurred. Please try again.'
    }
};

let currentLang = 'az';

function initLang() {
    const savedLang = localStorage.getItem('lang');
    if (savedLang && translations[savedLang]) {
        currentLang = savedLang;
    }
    applyTranslations();
    updateLangButton();
}

function toggleLang() {
    currentLang = currentLang === 'az' ? 'en' : 'az';
    localStorage.setItem('lang', currentLang);
    applyTranslations();
    updateLangButton();
}

function updateLangButton() {
    const langText = langToggle?.querySelector('.lang-text');
    if (langText) {
        langText.textContent = currentLang === 'az' ? 'EN' : 'AZ';
    }
}

function applyTranslations() {
    const t = translations[currentLang];
    
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (t[key]) {
            el.textContent = t[key];
        }
    });
    
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
        const key = el.getAttribute('data-i18n-placeholder');
        if (t[key]) {
            el.placeholder = t[key];
        }
    });
    
    document.title = t.pageTitle;
    document.documentElement.lang = currentLang;
    
    // Əgər gündəlik limit mesajı göstərilibsə, onu da yenilə
    if (statusMessage && statusMessage.classList.contains('error') && hasReachedDailyLimit()) {
        statusMessage.textContent = t.errorDailyLimit;
    }
}

function getTranslation(key) {
    return translations[currentLang][key] || key;
}

initLang();

if (langToggle) {
    langToggle.addEventListener('click', toggleLang);
}

// Tema dəyişdirmə funksiyası
function initTheme() {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme) {
        document.documentElement.setAttribute('data-theme', savedTheme);
    } else if (prefersDark) {
        document.documentElement.setAttribute('data-theme', 'dark');
    }
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
}

initTheme();

if (themeToggle) {
    themeToggle.addEventListener('click', toggleTheme);
}

// Gündəlik yükləmə limiti yoxlaması
const DAILY_LIMIT_KEY = 'cv_upload_data';
const MAX_DAILY_UPLOADS = 10;

function getTodayDateString() {
    return new Date().toISOString().split('T')[0]; // YYYY-MM-DD
}

function getUploadData() {
    const data = localStorage.getItem(DAILY_LIMIT_KEY);
    if (data) {
        try {
            return JSON.parse(data);
        } catch (e) {
            return { date: '', count: 0 };
        }
    }
    return { date: '', count: 0 };
}

function hasReachedDailyLimit() {
    const data = getUploadData();
    const today = getTodayDateString();
    return data.date === today && data.count >= MAX_DAILY_UPLOADS;
}

function markUploadedToday() {
    const data = getUploadData();
    const today = getTodayDateString();
    if (data.date === today) {
        data.count += 1;
    } else {
        data.date = today;
        data.count = 1;
    }
    localStorage.setItem(DAILY_LIMIT_KEY, JSON.stringify(data));
}

function disableFormForToday() {
    // Formu deaktiv et
    fileInput.disabled = true;
    emailInput.disabled = true;
    submitBtn.disabled = true;
    dropArea.style.opacity = '0.5';
    dropArea.style.pointerEvents = 'none';
    
    // Mesaj göstər
    showMessage(getTranslation('errorDailyLimit'), 'error');
    statusMessage.style.display = 'block';
}

// Səhifə yükləndikdə limit yoxla
function checkDailyLimitOnLoad() {
    if (hasReachedDailyLimit()) {
        disableFormForToday();
    }
}

// Sizin webhook ünvanınız
const webhookUrl = 'https://n8n.datatek.tech/webhook/b7db9dbc-15b6-4137-8d3a-cff2d108cb8a';
const fallbackWebhookUrl = webhookUrl.includes('/webhook/')
    ? webhookUrl.replace('/webhook/', '/webhook/')
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

// Gündəlik limit yoxla
checkDailyLimitOnLoad();

// Fayl seçildikdə adını göstərmək və formatı yoxlamaq
fileInput.addEventListener('change', function() {
    if (this.files && this.files.length > 0) {
        const file = this.files[0];
        const fileName = file.name.toLowerCase();
        const validTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
        const isValid = validTypes.includes(file.type) || fileName.endsWith('.pdf') || fileName.endsWith('.docx');

        if (!isValid) {
            // Yanlış format - faylı avtomatik sil
            this.value = '';
            fileNameDisplay.textContent = '';
            dropText.style.display = 'block';
            showMessage(getTranslation('errorFormat'), 'error');
            return;
        }

        // Düzgün format
        fileNameDisplay.textContent = file.name;
        dropText.style.display = 'none';
        statusMessage.className = 'message';
        statusMessage.style.display = 'none';
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

    // 0. Gündəlik limit yoxlaması
    if (hasReachedDailyLimit()) {
        showMessage(getTranslation('errorDailyLimit'), 'error');
        disableFormForToday();
        return;
    }

    const file = fileInput.files[0];
    const email = emailInput.value;

    // 1. E-poçt yoxlanışı
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        showMessage(getTranslation('errorEmail'), 'error');
        return;
    }

    // 2. Faylın mövcudluq yoxlanışı
    if (!file) {
        showMessage(getTranslation('errorFile'), 'error');
        return;
    }

    // 3. Fayl formatının yoxlanılması (yalnız PDF və ya DOCX)
    const validExtensions = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    const fileName = file.name.toLowerCase();
    const isValidExtension = validExtensions.includes(file.type) || fileName.endsWith('.pdf') || fileName.endsWith('.docx');

    if (!isValidExtension) {
        showMessage(getTranslation('errorFormat'), 'error');
        return;
    }

    // Məlumatları FormData obyektinə yığırıq (fayl göndərmək üçün lazımdır)
    const formData = new FormData();
    formData.append('cv', file);
    formData.append('email', email);

    // Məlumatın Webhook-a göndərilməsi
    try {
        submitBtn.textContent = getTranslation('submitLoading');
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
            // Gündəlik limiti qeyd et
            markUploadedToday();
            
            // Formu deaktiv et və uğur göstər
            dropArea.classList.add('success');
            dropArea.innerHTML = `
                <div class="success-icon">
                    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                    </svg>
                    <span>${getTranslation('successMsg')}</span>
                </div>
            `;
            emailInput.disabled = true;
            submitBtn.style.display = 'none';
            statusMessage.style.display = 'none';
        } else {
            showMessage(`${getTranslation('errorServer')} (${response.status})`, 'error');
        }
    } catch (error) {
        console.error('Fetch xətası:', error);
        showMessage(getTranslation('errorServer'), 'error');
    } finally {
        submitBtn.textContent = getTranslation('submitBtn');
        submitBtn.disabled = false;
    }
});

// ==================== CHATBOT ====================

const chatbotToggle = document.getElementById('chatbotToggle');
const chatbotWindow = document.getElementById('chatbotWindow');
const chatbotClose = document.getElementById('chatbotClose');
const chatMessages = document.getElementById('chatMessages');
const chatInput = document.getElementById('chatInput');
const chatSendBtn = document.getElementById('chatSendBtn');

const chatbotWebhookUrl = 'https://n8n.datatek.tech/webhook/dataanalyticschatbot';

let isChatbotOpen = false;
let isSendingMessage = false;

function toggleChatbot() {
    isChatbotOpen = !isChatbotOpen;
    chatbotToggle.classList.toggle('active', isChatbotOpen);
    chatbotWindow.classList.toggle('open', isChatbotOpen);
    
    if (isChatbotOpen) {
        chatInput.focus();
    }
}

function closeChatbot() {
    isChatbotOpen = false;
    chatbotToggle.classList.remove('active');
    chatbotWindow.classList.remove('open');
}

function addMessage(text, sender) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `chat-message ${sender}`;
    messageDiv.textContent = text;
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    return messageDiv;
}

function addTypingIndicator() {
    const typingDiv = document.createElement('div');
    typingDiv.className = 'chat-message bot typing';
    typingDiv.id = 'typingIndicator';
    typingDiv.innerHTML = '<span class="dot"></span><span class="dot"></span><span class="dot"></span>';
    chatMessages.appendChild(typingDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    return typingDiv;
}

function removeTypingIndicator() {
    const typingIndicator = document.getElementById('typingIndicator');
    if (typingIndicator) {
        typingIndicator.remove();
    }
}

async function sendChatMessage() {
    const message = chatInput.value.trim();
    
    if (!message || isSendingMessage) {
        return;
    }
    
    isSendingMessage = true;
    chatSendBtn.disabled = true;
    chatInput.disabled = true;
    
    // İstifadəçi mesajını göstər
    addMessage(message, 'user');
    chatInput.value = '';
    
    // Yazı indikatoru göstər
    addTypingIndicator();
    
    try {
        const response = await fetch(chatbotWebhookUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                message: message,
                lang: currentLang,
                timestamp: new Date().toISOString()
            }),
        });
        
        removeTypingIndicator();
        
        if (response.ok) {
            const data = await response.json();
            
            // Cavab formatını analiz et
            let botReply;
            if (Array.isArray(data) && data.length > 0) {
                // Format: [{"output": "..."}]
                botReply = data[0].output || data[0].reply || data[0].message || data[0].response || JSON.stringify(data[0]);
            } else if (typeof data === 'object') {
                // Format: {"output": "..."}
                botReply = data.output || data.reply || data.message || data.response || JSON.stringify(data);
            } else {
                botReply = String(data);
            }
            
            addMessage(botReply, 'bot');
        } else {
            addMessage(getTranslation('chatError'), 'bot');
        }
    } catch (error) {
        console.error('Chatbot xətası:', error);
        removeTypingIndicator();
        addMessage(getTranslation('chatError'), 'bot');
    } finally {
        isSendingMessage = false;
        chatSendBtn.disabled = false;
        chatInput.disabled = false;
        chatInput.focus();
    }
}

// Chatbot event listeners
if (chatbotToggle) {
    chatbotToggle.addEventListener('click', toggleChatbot);
}

if (chatbotClose) {
    chatbotClose.addEventListener('click', closeChatbot);
}

if (chatSendBtn) {
    chatSendBtn.addEventListener('click', sendChatMessage);
}

if (chatInput) {
    chatInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendChatMessage();
        }
    });
}

// Chatbot pəncərəsini kənardan tıklayanda bağla
document.addEventListener('click', function(e) {
    if (isChatbotOpen && 
        !chatbotWindow.contains(e.target) && 
        !chatbotToggle.contains(e.target)) {
        closeChatbot();
    }
});