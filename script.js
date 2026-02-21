const form = document.getElementById('cvForm');
const fileInput = document.getElementById('cvFile');
const emailInput = document.getElementById('email');
const fileNameDisplay = document.getElementById('fileName');
const dropText = document.getElementById('dropText');
const statusMessage = document.getElementById('statusMessage');
const submitBtn = document.getElementById('submitBtn');

// Sizin webhook ünvanınız
const webhookUrl = 'https://n8n.datatek.tech/webhook-test/b7db9dbc-15b6-4137-8d3a-cff2d108cb8a';

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

        const response = await fetch(webhookUrl, {
            method: 'POST',
            body: formData,
        });

        if (response.ok) {
            showMessage('CV uğurla göndərildi! (Successful)', 'success');
            form.reset();
            fileNameDisplay.textContent = '';
            dropText.style.display = 'block';
        } else {
            showMessage('Xəta baş verdi: CV göndərilə bilmədi (Server xətası).', 'error');
        }
    } catch (error) {
        console.error('Fetch xətası:', error);
        showMessage('Xəta baş verdi: CV göndərilə bilmədi. İnternet bağlantınızı və ya CORS ayarlarını yoxlayın.', 'error');
    } finally {
        submitBtn.textContent = 'CV-ni Göndər';
        submitBtn.disabled = false;
    }
});