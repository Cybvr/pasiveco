const puppeteer = require('puppeteer');
const path = require('path');

(async () => {
  try {
    console.log('Launching browser to composite final mockups...');
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();
    
    // Set to phone mockup size
    await page.setViewport({ width: 340, height: 680 });
    
    const assetsDir = 'C:/Users/HP/Downloads/pasiveco-main/animation_assets';
    const templatePath = 'file:///' + path.join(assetsDir, 'mockup_template.html').replace(/\\/g, '/');
    
    // Generate Home Mockup
    console.log('Generating Home Mockup...');
    await page.goto(templatePath, { waitUntil: 'networkidle0' });
    await page.evaluate(() => {
      document.getElementById('screenshotImg').src = 'live_app_home_screenshot.png';
    });
    // Extra wait for SVG and PNG to render
    await new Promise(r => setTimeout(r, 2000));
    await page.screenshot({ path: path.join(assetsDir, 'final_mobile_home_mockup.png'), omitBackground: true });
    
    // Generate Dashboard Mockup
    console.log('Generating Dashboard Mockup...');
    await page.evaluate(() => {
      document.getElementById('screenshotImg').src = 'live_app_dashboard_screenshot.png';
    });
    await new Promise(r => setTimeout(r, 2000));
    await page.screenshot({ path: path.join(assetsDir, 'final_mobile_dashboard_mockup.png'), omitBackground: true });
    
    await browser.close();
    console.log('✅ Success! Final mockups generated: final_mobile_home_mockup.png and final_mobile_dashboard_mockup.png');
  } catch (err) {
    console.error('Error generating mockups:', err);
    process.exit(1);
  }
})();
