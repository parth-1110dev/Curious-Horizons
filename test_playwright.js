const express = require('express');
const { chromium } = require('playwright');
const path = require('path');

const app = express();
app.use(express.static(path.join(__dirname)));

const server = app.listen(5500, async () => {
  console.log('Server running on 5500');
  
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  page.on('console', msg => {
    console.log(`[BROWSER CONSOLE] ${msg.type()}: ${msg.text()}`);
  });
  
  page.on('pageerror', err => {
    console.log(`[BROWSER ERROR] ${err.message}`);
  });

  try {
    await page.goto('http://localhost:5500/frontend/session.html');
    
    // Simulate what time-selection.html does
    await page.evaluate(() => {
      window.localStorage.setItem('lockedin_selected_topic', 'Physics');
      window.localStorage.setItem('lockedin_selected_minutes', '10');
      // No plan limits
    });

    // Force an init
    await page.evaluate(() => {
      if (typeof window.initFromStorage === 'function') {
        window.initFromStorage();
      } else {
        console.log("initFromStorage not found on window");
      }
    });
    
    // Click the hidden start button or wait
    await page.waitForTimeout(4000);
  } catch (e) {
    console.error("Test failed", e);
  } finally {
    await browser.close();
    server.close();
  }
});
