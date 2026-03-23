const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

(async () => {
  const browser = await puppeteer.launch({
    headless: "new"
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1200, height: 630 });

  const logoSvg = fs.readFileSync(path.join(__dirname, 'public/images/logo.svg'), 'utf8');

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body {
            margin: 0;
            padding: 0;
            width: 1200px;
            height: 630px;
            background-color: #0c0c0c; /* dark background */
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .logo-container {
            width: 400px;
            height: auto;
          }
        </style>
      </head>
      <body>
        <div class="logo-container">
          ${logoSvg}
        </div>
      </body>
    </html>
  `;

  await page.setContent(html);
  
  const outputPath = path.join(__dirname, 'public/images/thumbnail.jpg');
  await page.screenshot({ path: outputPath, type: 'jpeg', quality: 90 });

  await browser.close();
  console.log('Thumbnail created!');
})();
