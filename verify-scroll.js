// Verify actual input box rendering and scroll position
const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  await page.setViewport({ width: 360, height: 640 });
  await page.goto(`file://${__dirname}/index.html#F`);
  await new Promise(r => setTimeout(r, 500));
  
  // Click through to step 8 (groupChatPasted)
  for (let i = 0; i < 10; i++) {
    const clicked = await page.evaluate(() => {
      const target = document.querySelector('[data-t]');
      if (target) {
        target.click();
        return true;
      }
      return false;
    });
    if (!clicked) {
      console.log(`Failed to find target at iteration ${i}`);
      break;
    }
    await new Promise(r => setTimeout(r, 500));
  }
  
  const result = await page.evaluate(() => {
    const inputBox = document.querySelector('.input-box-text.scrolled-bottom');
    if (!inputBox) {
      const screen = document.querySelector('.scr');
      const screenClass = screen ? screen.className : 'no screen';
      const anyInputBox = document.querySelector('.input-box-text');
      return { 
        error: 'No input box with scrolled-bottom', 
        screenClass,
        hasAnyInputBox: !!anyInputBox,
        stepIdx: window.__lpp ? window.__lpp.S.idx : -1
      };
    }
    
    // Get raw HTML
    const html = inputBox.innerHTML;
    
    // Get visible text lines
    const textLines = [];
    const walker = document.createTreeWalker(inputBox, NodeFilter.SHOW_TEXT);
    let node;
    while (node = walker.nextNode()) {
      const text = node.textContent.trim();
      if (text && text !== '|') textLines.push(text);
    }
    
    // Check scroll position
    const scrollTop = inputBox.scrollTop;
    const scrollHeight = inputBox.scrollHeight;
    const clientHeight = inputBox.clientHeight;
    const isAtBottom = Math.abs(scrollTop + clientHeight - scrollHeight) <= 2;
    
    // Get computed style
    const style = window.getComputedStyle(inputBox);
    
    return {
      html: html.substring(0, 500),
      textLines: textLines.slice(-5),
      scrollTop,
      scrollHeight,
      clientHeight,
      maxHeight: style.maxHeight,
      lineHeight: style.lineHeight,
      padding: style.padding,
      isAtBottom,
      distanceFromBottom: scrollHeight - scrollTop - clientHeight
    };
  });
  
  console.log('Step 10 (groupChatPasted) - 360x640:');
  console.log(JSON.stringify(result, null, 2));
  
  await page.screenshot({ path: '/tmp/verify-step9.png' });
  await browser.close();
})();
