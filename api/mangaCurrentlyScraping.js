const CHROMIUM = require('@sparticuz/chromium-min');
const PUPPETEER = require('puppeteer-core');


async function getBrowser() {
  return PUPPETEER.launch({
    args: [...CHROMIUM.args, '--hide-scrollbars', '--disable-web-security'],
    defaultViewport: CHROMIUM.defaultViewport,
    executablePath: await CHROMIUM.executablePath(
      'https://github.com/Sparticuz/chromium/releases/download/v122.0.0/chromium-v122.0.0-pack.tar'
    ),
    headless: CHROMIUM.headless,
    ignoreHTTPSErrors: true,
  });
}


module.exports = async (req, res) => {
    try {
      const browser = await getBrowser();
      /*
      const browser = await puppeteer.launch({
        executablePath: require('puppeteer').executablePath(),
      }); */
      
      const page = await browser.newPage();
      await page.goto('https://myanimelist.net/mangalist/hunchojhuncho99?status=1');
  
      // Wait for the list to load
      //await page.waitForSelector('.poster-container', { timeout: 10000 });
      await page.waitForSelector('.list-table');
  
      // Scraping logic to get movie titles and image URLs
      const mangaData = await page.evaluate(() => {
        
          const mangaElements = document.querySelectorAll('.list-item');
          const manga = [];
          mangaElements.forEach(element => {
              const titleElement = element.querySelector('.link.sort');
              const title = titleElement ? titleElement.getAttribute('href') : '';
  
  
              const imageElement = element.querySelector('img');
              const imageUrl = imageElement ? imageElement.getAttribute('src') : '';
  
      
  
              manga.push({ title, imageUrl });
  
  
          });
  
    
      
          return manga;
      });
  
      await browser.close();
  
      res.json(mangaData);
    } catch (error) {
      console.error('Error scraping:', error);
      res.status(500).json({ error: 'Failed to scrape data' });
    }
}
