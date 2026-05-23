const gameBox = document.getElementById('game-box');
const letterM = document.getElementById('letter-m');
const playText = document.getElementById('play-text');

let isGameStarted = false;

gameBox.addEventListener('click', () => {
    if (isGameStarted) return;
    isGameStarted = true;

    // 1. Box membesar jadi arena (800x500px)
    gameBox.classList.add('expanded');

    // Ngescroll otomatis biar box-nya pas di tengah layar
    setTimeout(() => {
        gameBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 300);

    // 2. Teks memudar, M siap jatuh
    setTimeout(() => {
        playText.classList.add('fade-out-text');
        letterM.style.color = '#00ff00'; 
        letterM.classList.add('falling');
    }, 1200); 

    // 3. M mendarat, siap jadi uler
    setTimeout(() => {
        console.log("Mekanik game dimulai! Ular siap beraksi.");
        // Logika nyalain Phaser lu masuk di sini nanti
    }, 2800);
});