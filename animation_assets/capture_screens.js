const puppeteer = require('puppeteer');
const path = require('path');

(async () => {
  try {
    console.log('Launching headless browser...');
    // Setting up the browser. --no-sandbox is often required in shared environments
    const browser = await puppeteer.launch({ 
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    
    // Set to high resolution mobile viewport
    await page.setViewport({ width: 390, height: 844, isMobile: true });
    
    const assetsDir = 'c:/Users/HP/Downloads/pasiveco-main/animation_assets';
    
    // Using port 3001 as specified in package.json
    console.log('Navigating to http://127.0.0.1:3001 (Homepage)...');
    await page.goto('http://127.0.0.1:3001', { waitUntil: 'load', timeout: 60000 });
    // Wait for the hydration and font loading
    await new Promise(r => setTimeout(r, 5000));
    
    await page.screenshot({ path: path.join(assetsDir, 'live_app_home_screenshot.png') });
    console.log('✅ Saved live_app_home_screenshot.png');

    console.log('Navigating to http://127.0.0.1:3001/dashboard...');
    await page.goto('http://127.0.0.1:3001/dashboard', { waitUntil: 'load', timeout: 60000 });
    // Wait for data fetching to settle
    await new Promise(r => setTimeout(r, 5000));
    
    await page.screenshot({ path: path.join(assetsDir, 'live_app_dashboard_screenshot.png') });
    console.log('✅ Saved live_app_dashboard_screenshot.png');

    await browser.close();
    console.log('All exact app screenshots captured to the animation folder!');
  } catch (err) {
    console.error('Error capturing screenshots:', err);
    process.exit(1);
  }
})();
