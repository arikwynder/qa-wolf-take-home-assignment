// EDIT THIS FILE TO COMPLETE ASSIGNMENT QUESTION 1
const { chromium } = require("playwright");

async function sortHackerNewsArticles() {
  // launch browser
  const browser = await chromium.launch({headless: false});
  const context = await browser.newContext();

  // set up map of key-value pairs to hold 'rank' and 'age' -> title values.
  let dateMap = new Map();

  let pages;

  const hackNewsUrls = [
    { url: "https://news.ycombinator.com/newest", name: '1st page' },
    { url: "https://news.ycombinator.com/newest?n=31", name: '2nd page' },
    { url: "https://news.ycombinator.com/newest?n=61", name: '3rd page' },
    { url: "https://news.ycombinator.com/newest?n=91", name: '4th page' }
  ]


  try {

    // generate array of pages to load links concurrently
    pages = await Promise.all([
        hackNewsUrls.map(() => context.newPage())
    ]);

    // go to Hacker News
    await Promise.all(
        pages.map((page,index) =>
            page.goto(hackNewsUrls[index].url)
                .catch(error => {
                  console.error(`Failed to navigate to ${hackNewsUrls[index].name}
                    (${hackNewsUrls[index].url}):`, error.message);
                  throw error;
                })
        ));


    do {
      const rankElements = await page.locator('.rank').all();
      const ageElements = await page.locator('.age').all();


      for (const [index, rankElement] of rankElements.entries()) {
        let rank = await rankElement.textContent();
        rank = parseInt(rank.substring(0, rank.length - 1));

        let ageElement = ageElements[index];
        let age = await ageElement.getAttribute('title');
        let ageLength = age.indexOf(" ");
        let timestamp = Date.parse(age.substring(0, ageLength));

        dateMap.set(rank, timestamp);

      }

      const moreElement = await page.waitForSelector('.morelink');
      const moreHref = await moreElement.getAttribute('href');

      const moreLink = "https://news.ycombinator.com/" + moreHref;
      console.log(moreLink);

    } while (dateMap.size < 30);

  } catch (error) {
    console.error('Error occurred:', error.message);

  } finally {
    try {
      // close browser, cleans up top-down
      await browser.close();
    } catch(error) {
      console.error('Error while closing browser:', error.message);
    }
  }
}
(async () => {
  await sortHackerNewsArticles();
})();
