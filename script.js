document.addEventListener('DOMContentLoaded', () => {
  const mainContainer = document.getElementById('mainContainer');
  const urlForm = document.getElementById('urlForm');
  const urlInput = document.getElementById('urlInput');
  const errorMsg = document.getElementById('errorMsg');
  const qrcodeContainer = document.getElementById('qrcode');
  const qrCard = document.getElementById('qrCard');
  const logoContainer = document.getElementById('logoContainer');

  let qrInstance = null;

  // ==========================================
  // Interactive Mouse Cursor Gradient Effect
  // Matching URL2QR Logo Theme (Gold/Amber/Warm)
  // ==========================================
  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let currentX = mouseX;
  let currentY = mouseY;
  let isMoving = false;

  function updateMouseCoordinates(e) {
    mouseX = e.clientX;
    mouseY = e.clientY;
    if (!isMoving) {
      isMoving = true;
      requestAnimationFrame(animateGradient);
    }
  }

  // Handle touch events for mobile responsiveness
  function updateTouchCoordinates(e) {
    if (e.touches && e.touches.length > 0) {
      mouseX = e.touches[0].clientX;
      mouseY = e.touches[0].clientY;
      if (!isMoving) {
        isMoving = true;
        requestAnimationFrame(animateGradient);
      }
    }
  }

  function animateGradient() {
    // Smooth interpolation (lerp)
    currentX += (mouseX - currentX) * 0.08;
    currentY += (mouseY - currentY) * 0.08;

    const xPercent = (currentX / window.innerWidth) * 100;
    const yPercent = (currentY / window.innerHeight) * 100;

    // Shift color hue dynamically based on mouse position
    // Harmonized with Golden Yellow URL2QR logo (Hue 35 ~ 55, 18 ~ 32)
    const hue1 = 38 + (xPercent * 0.16); // 38 ~ 54 (Amber to Golden Yellow)
    const hue2 = 20 + (yPercent * 0.18); // 20 ~ 38 (Warm Coral to Amber)
    const hue3 = 45 + ((xPercent + yPercent) * 0.10); // 45 ~ 65 (Warm Yellow/Gold)

    document.documentElement.style.setProperty('--mouse-x', `${xPercent.toFixed(2)}%`);
    document.documentElement.style.setProperty('--mouse-y', `${yPercent.toFixed(2)}%`);
    document.documentElement.style.setProperty('--grad-hue1', hue1.toFixed(1));
    document.documentElement.style.setProperty('--grad-hue2', hue2.toFixed(1));
    document.documentElement.style.setProperty('--grad-hue3', hue3.toFixed(1));

    // Continue loop if still interpolating
    if (Math.abs(mouseX - currentX) > 0.1 || Math.abs(mouseY - currentY) > 0.1) {
      requestAnimationFrame(animateGradient);
    } else {
      isMoving = false;
    }
  }

  window.addEventListener('mousemove', updateMouseCoordinates, { passive: true });
  window.addEventListener('touchmove', updateTouchCoordinates, { passive: true });

  // ==========================================
  // Form Submit & QR Code Generation
  // ==========================================
  urlForm.addEventListener('submit', (e) => {
    e.preventDefault();
    generateQRCode();
  });

  function generateQRCode() {
    let rawUrl = urlInput.value.trim();

    if (!rawUrl) {
      showError('URL을 입력해주세요.');
      return;
    }

    // Auto-prepend https:// if missing protocol
    if (!/^https?:\/\//i.test(rawUrl)) {
      rawUrl = 'https://' + rawUrl;
      urlInput.value = rawUrl;
    }

    // Simple URL validation
    try {
      new URL(rawUrl);
    } catch (_) {
      showError('올바른 형식의 URL을 입력해주세요.');
      return;
    }

    hideError();

    // Clear previous QR code
    qrcodeContainer.innerHTML = '';

    // Create new QRCode instance (High contrast dark charcoal)
    qrInstance = new QRCode(qrcodeContainer, {
      text: rawUrl,
      width: 256,
      height: 256,
      colorDark: '#1c1917',
      colorLight: '#ffffff',
      correctLevel: QRCode.CorrectLevel.H
    });

    // Add state class to trigger layout transition (input moves to bottom, QR is centered)
    mainContainer.classList.add('has-qr');
  }

  function showError(msg) {
    errorMsg.textContent = msg;
    errorMsg.classList.add('visible');
    urlInput.focus();
  }

  function hideError() {
    errorMsg.classList.remove('visible');
  }

  // ==========================================
  // QR Code click handler -> Download as JPG
  // ==========================================
  qrCard.addEventListener('click', () => {
    downloadQRCodeAsJpg();
  });

  function downloadQRCodeAsJpg() {
    const canvas = qrcodeContainer.querySelector('canvas');
    const img = qrcodeContainer.querySelector('img');

    if (canvas) {
      // Export canvas directly to JPEG format with white background
      saveCanvasAsJpg(canvas);
    } else if (img && img.src) {
      // Convert img to canvas and export as JPG
      const tempImg = new Image();
      tempImg.crossOrigin = 'Anonymous';
      tempImg.onload = () => {
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = tempImg.width || 256;
        tempCanvas.height = tempImg.height || 256;
        const ctx = tempCanvas.getContext('2d');
        
        // Fill white background for JPEG
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
        ctx.drawImage(tempImg, 0, 0);

        saveCanvasAsJpg(tempCanvas);
      };
      tempImg.src = img.src;
    }
  }

  function saveCanvasAsJpg(sourceCanvas) {
    // Create export canvas with margin/padding for clean aesthetic
    const padding = 24;
    const exportCanvas = document.createElement('canvas');
    exportCanvas.width = sourceCanvas.width + padding * 2;
    exportCanvas.height = sourceCanvas.height + padding * 2;

    const ctx = exportCanvas.getContext('2d');
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, exportCanvas.width, exportCanvas.height);
    ctx.drawImage(sourceCanvas, padding, padding);

    // Get JPG data URL
    const jpgDataUrl = exportCanvas.toDataURL('image/jpeg', 0.95);

    // Trigger download
    const link = document.createElement('a');
    link.download = 'qrcode.jpg';
    link.href = jpgDataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // Reset on logo click
  logoContainer.addEventListener('click', () => {
    mainContainer.classList.remove('has-qr');
    urlInput.value = '';
    hideError();
    qrcodeContainer.innerHTML = '';
  });
});
