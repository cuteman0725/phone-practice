// Verify steps 9-14 scroll behavior
const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  await page.setViewport({ width: 360, height: 640 });
  await page.goto(`file://${__dirname}/index.html#F`);
  await new Promise(r => setTimeout(r, 500));
  
  const checkScroll = async (stepName) => {
    await new Promise(r => setTimeout(r, 300));
    return await page.evaluate(() => {
      const inputBox = document.querySelector('.input-box-text.scrolled-bottom');
      if (!inputBox) return null;
      
      const lines = inputBox.innerHTML.split('<br>').map(l => 
        l.replace(/<[^>]+>/g, '').trim()
      ).filter(Boolean);
      
      return {
        lastLine: lines[lines.length - 1] || '',
        totalLines: lines.length,
        scrollTop: inputBox.scrollTop,
        scrollHeight: inputBox.scrollHeight,
        clientHeight: inputBox.clientHeight,
        isAtBottom: Math.abs(inputBox.scrollTop + inputBox.clientHeight - inputBox.scrollHeight) <= 2
      };
    });
  };
  
  // Navigate to each step and check
  const steps = [
    'home', 'lineHome', 'lineChat', 'groupChat', 'lineLongPress', 
    'groupChatCopied', 'groupChatKeyboard', 'androidPaste', 
    'groupChatPasted', 'groupChatNewline', 'groupChatNum',
    'groupChatZhuyin1', 'groupChatZhuyin2', 'groupChatComplete'
  ];
  
  for (let i = 0; i < steps.length; i++) {
    const clicked = await page.evaluate(() => {
      const target = document.querySelector('[data-t]');
      if (target) { target.click(); return true; }
      return false;
    });
    if (!clicked) break;
    
    if (i >= 7) {  // Steps 8-14 (0-indexed)
      const result = await checkScroll(steps[i]);
      const status = result ? (result.isAtBottom ? '✓' : '✗') : '—';
      const lastLine = result ? result.lastLine.substring(0, 40) : 'no input';
      console.log(`Step ${i+1} (${steps[i]}): ${status} "${lastLine}"`);
      
      if (result && i === 8) {
        await page.screenshot({ path: '/workspace/test-f-step9-360x640.png' });
      } else if (result && i === 13) {
        await page.screenshot({ path: '/workspace/test-f-step14-360x640.png' });
      }
    }
  }
  
  await browser.close();
  console.log('\n✓ Verification complete');
})();
