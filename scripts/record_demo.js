import { test, chromium } from '@playwright/test';

/**
 * MatchStake — Hackathon Demo Recording Script
 * 
 * This script automates the MatchStake UI while you record your voiceover.
 * It is synchronized with the DemoTour built into the app.
 */

(async () => {
  // Launch browser in non-headless mode for recording
  const browser = await chromium.launch({ 
    headless: false,
    args: ['--start-maximized']
  });
  
  const context = await browser.newContext({
    viewport: null, // Allow window to be maximized
  });
  
  const page = await context.newPage();

  console.log('--- STARTING MATCHSTAKE DEMO ---');
  console.log('Tip: Use a screen recorder like Loom or OBS.');
  console.log('Wait for the page to load, then start your recording.');

  // 1. OPEN APP WITH DEMO TOUR ENABLED
  await page.goto('http://localhost:3000/?demo=true');
  
  // Wait for the DemoTour overlay to appear
  await page.waitForSelector('h3:has-text("MATCHSTAKE")', { timeout: 10000 });

  // The tour is mostly automated via the frontend React component.
  // We will just wait and monitor progress.
  
  const steps = [
    "Landing Page / Intro",
    "How It Works",
    "Host Stadiums",
    "Match Schedule",
    "Agent Ops (OnchainOS/ExchangeOS)",
    "Create Room",
    "AI Co-Pilot",
    "Room Config",
    "Room Detail",
    "Prediction + Staking",
    "Dynamic NFT Collection",
    "Leaderboard",
    "Squad Arena",
    "Social Share Card",
    "Submission Proof Room",
    "OKX DEX Swap",
    "Summary"
  ];

  for (let i = 0; i < steps.length; i++) {
    console.log(`Step ${i + 1}: ${steps[i]}`);
    
    // We wait for the "Next" step to be triggered by the frontend
    // or we can manually click "NEXT" if we want to speed it up.
    // For recording, we let the frontend's built-in timers handle it.
    
    // Wait for the duration of the step (plus a small buffer)
    // You can adjust these delays if you need more time to speak.
    await page.waitForTimeout(5000); 
    
    if (i === 4) { // Agent Ops
      await page.waitForTimeout(3000); // Give extra time for technical explanation
    }
    
    if (i === 6) { // AI Co-Pilot
      await page.waitForTimeout(5000); // Wait for the AI body to expand
    }

    if (i === 9) { // Prediction + Staking
      await page.waitForTimeout(3000); // Wait for the "Minting" animation
    }
  }

  console.log('--- DEMO COMPLETE ---');
  // Keep browser open for a bit
  await page.waitForTimeout(10000);
  await browser.close();
})();
