import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

(async () => {
  // Create a dummy pdf for uploading
  const dummyPdfPath = path.join(__dirname, 'dummy.pdf');
  fs.writeFileSync(dummyPdfPath, 'dummy pdf content');

  // Launch the browser
  const browser = await chromium.launch({
    headless: false,
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    slowMo: 600, // Natural clicking speed
  });
  
  // Create context with large window so nothing is cut off
  const context = await browser.newContext({
    viewport: null, // this along with args: ['--start-maximized'] makes it full screen, but let's set a fixed large one
  });
  const page = await context.newPage();
  await page.setViewportSize({ width: 1440, height: 900 });

  // Helper functions
  const pause = (ms) => page.waitForTimeout(ms);
  const scrollDown = async (amount = 400) => {
    await page.mouse.wheel(0, amount);
    await pause(1000);
  };
  const scrollUp = async (amount = 400) => {
    await page.mouse.wheel(0, -amount);
    await pause(1000);
  };

  console.log("🎬 ACTION! Start recording your screen now.");
  console.log("The script will automatically navigate through the app. Just read your script!");

  // --- SCENE 1: Landing Page ---
  console.log("📍 Navigating to Landing Page...");
  await page.goto('http://localhost:3000/');
  await pause(3000);
  await scrollDown(400); 

  // --- SCENE 2: Onboarding Wizard ---
  console.log("📍 Navigating to Onboarding...");
  await page.goto('http://localhost:3000/onboarding');
  await pause(2000);
  // Just showing it briefly, skip to dashboard
  await page.goto('http://localhost:3000/dashboard');

  // --- SCENE 3: Dashboard ---
  console.log("📍 Navigating to Dashboard...");
  await pause(3000);
  await scrollDown(300);
  await pause(2000);

  // --- SCENE 4: My To-Dos ---
  console.log("📍 Navigating to Actions...");
  // Click in sidebar
  await page.click('a[href="/actions"]');
  await pause(2000);
  await scrollDown(200);

  console.log("   - Ticking off a task to show the new Progress Track...");
  // Click the first unfinished checkbox
  await page.click('button[role="checkbox"][aria-checked="false"]', { strict: false });
  await pause(3000);

  // --- SCENE 5: Profile ---
  console.log("📍 Navigating to Profile...");
  // Profile button is at the bottom of the sidebar
  await page.click('a[href="/profile"]');
  await pause(2000);
  await scrollDown(300);

  // --- SCENE 6: Ask Borderless (AI Chat & Tool Calling) ---
  console.log("📍 Opening AI Chat...");
  await scrollUp(500); // Back to top
  await page.click('button:has-text("Ask Borderless")');
  await pause(1500);
  
  console.log("   - Typing message...");
  const chatInput = 'input[placeholder="Ask about your cross-border situation…"]';
  await page.fill(chatInput, "I just moved my residence to Germany.");
  await pause(500);
  await page.keyboard.press('Enter');
  
  console.log("   - Waiting for AI response...");
  await pause(5000); 

  // Close chat for next scenes using Escape
  await page.keyboard.press('Escape');
  await pause(1000);

  // --- SCENE 7: Form Assistant ---
  console.log("📍 Navigating to Form Assistant...");
  await page.click('a[href="/forms"]');
  await pause(2000);

  // Uploading a file
  console.log("   - Uploading a form...");
  await page.setInputFiles('input[type="file"]', dummyPdfPath);
  
  console.log("   - Waiting for Form Assistant processing...");
  await pause(4000); // Wait for the loading animation and result
  await scrollDown(400);
  
  // Click Download Pre-filled Form
  await page.click('button:has-text("Download Pre-filled Form")');
  await pause(2000);

  // --- SCENE 8: Simulator ---
  console.log("📍 Navigating to Simulator...");
  await page.click('a[href="/simulator"]');
  await pause(2000);
  await scrollDown(300);
  
  // Click "Graduating"
  await page.click('text="Graduating"');
  await pause(2000);
  await page.click('button:has-text("Preview Plan")');
  await pause(3000);
  await scrollDown(300);

  // --- SCENE 9: Saved Plans ---
  console.log("📍 Navigating to Saved Plans...");
  await page.click('a[href="/simulations"]');
  await pause(3000);

  // --- SCENE 10: Benefits & Tips ---
  console.log("📍 Navigating to Benefits & Tips...");
  await page.click('a[href="/opportunities"]');
  await pause(2000);
  await scrollDown(500);
  await pause(1000);

  // --- SCENE 11: Community ---
  console.log("📍 Navigating to Community...");
  await page.click('a[href="/community"]');
  await pause(2000);
  await scrollDown(400);

  console.log("✅ Cut! Demo finished! You can stop recording.");
  await pause(3000);
  await browser.close();
  
  // cleanup
  fs.unlinkSync(dummyPdfPath);
})();
