const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

async function generateOGImage() {
    // Find Chrome/Edge executable
    const possiblePaths = [
        'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
        'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
        'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
        'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
        process.env.CHROME_PATH
    ].filter(Boolean);

    let executablePath = null;
    for (const p of possiblePaths) {
        if (fs.existsSync(p)) {
            executablePath = p;
            break;
        }
    }

    if (!executablePath) {
        console.error('Chrome or Edge not found. Please install Chrome or set CHROME_PATH environment variable.');
        process.exit(1);
    }

    console.log(`Using browser at: ${executablePath}`);

    const browser = await puppeteer.launch({
        executablePath,
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();

    // Set viewport to OG image dimensions
    await page.setViewport({
        width: 1200,
        height: 630,
        deviceScaleFactor: 2 // Higher quality
    });

    // Load the HTML template
    const templatePath = path.join(__dirname, '..', 'public', 'og-image-template.html');
    await page.goto(`file://${templatePath}`, { waitUntil: 'networkidle0' });

    // Wait for any animations/fonts to load
    await page.evaluate(() => new Promise(resolve => setTimeout(resolve, 500)));

    // Take screenshot
    const outputPath = path.join(__dirname, '..', 'public', 'og-image.png');
    await page.screenshot({
        path: outputPath,
        type: 'png',
        clip: {
            x: 0,
            y: 0,
            width: 1200,
            height: 630
        }
    });

    console.log(`OG image generated: ${outputPath}`);

    await browser.close();
}

generateOGImage().catch(console.error);
