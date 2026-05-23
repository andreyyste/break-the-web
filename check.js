const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    
    page.on('console', msg => {
        console.log(`PAGE LOG [${msg.type()}]:`, msg.text());
        if (msg.type() === 'error') {
            console.log('Error details:', msg.args().map(a => a.toString()));
        }
    });
    
    page.on('pageerror', err => {
        console.log('PAGE ERROR:', err.message);
    });
    
    await page.goto('http://localhost:8080/');
    console.log('Page loaded. Clicking #game-box...');
    await page.click('#game-box');
    
    console.log('Waiting 5 seconds for Phaser to start...');
    await new Promise(r => setTimeout(r, 5000));
    
    const canvasExists = await page.evaluate(() => {
        const c = document.querySelector('canvas');
        return c ? { width: c.width, height: c.height, display: c.style.display } : null;
    });
    console.log('Canvas element:', canvasExists);
    
    await browser.close();
})();
