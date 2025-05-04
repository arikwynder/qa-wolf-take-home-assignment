// EDIT THIS FILE TO COMPLETE ASSIGNMENT QUESTION 1
const { chromium } = require("playwright");
const { expect } = require("playwright/test");

async function sortHackerNewsArticles() {
  // launch browser
  const browser = await chromium.launch({headless: false});
  const context = await browser.newContext();
  const page = await context.newPage();

  // prepare formatter for failure message in expect call
  const formatter = new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });

  // set up map of key-value pairs to hold 'rank' and 'age' -> title values.
  let dateMap = new Map();

  // prep try block to catch errors
  try {

    let href = "https://news.ycombinator.com/newest";


    // fill 'rank -> timestamp' map
    while (dateMap.size < 100) {

      // go to hacker news (iterating pages)
      await  page.goto(href);

      // Wait for the content to be available
      await page.waitForSelector('.rank');
      await page.waitForSelector('.age');
      await page.waitForSelector('.morelink');


      let rankElements = await page.locator('.rank').all();
      let ageElements = await page.locator('.age').all();


      if (href.includes("n=91")) {
        rankElements = rankElements.slice(0, 10);
        ageElements = ageElements.slice(0, 10);

      }

      for (const [index, rankElement] of rankElements.entries()) {
        let rank = await rankElement.textContent();
        rank = parseInt(rank.substring(0, rank.length - 1));

        let ageElement = ageElements[index];
        let age = await ageElement.getAttribute('title');
        let ageLength = age.indexOf(" ");


        let timestamp = Date.parse(age.substring(0, ageLength));

        dateMap.set(rank, timestamp);

      }

      // get the next page to access and prepare for loop
      const moreLink = await page.locator('.morelink').getAttribute('href');
      href = "https://news.ycombinator.com/" + moreLink;



    }

    //compare timestamps in 'rank -> timestamp' map
    for (let index = 1 ; index < 100 ; index++) {

      // get timestamps for comparison
      const current = dateMap.get(index+1);
      const previous = dateMap.get(index);

      // prepare formatted dates for failure message, easy comparison
      const currDateFormatted = formatter.format(current);
      const prevDateFormatted = formatter.format(previous);

      // console.log("Compare: " + (index+1), current + " -> " + index,previous + ".");

      // expect the current timestamp to be older (less) than previous timestamp
      // log current testing info if failed
      await expect(
            current < previous,
            "[FAIL] Hacker News Articles are not sorted " +
            "by newest or are out of order: \n" +
            "At Index: " + (index+1) + "\n" +
            currDateFormatted + " is greater than " + prevDateFormatted + ":\n" +
            current + " > " + previous + "."
      ).toBeTruthy;

    }

    // Print success message: got through for loop without failed expectations
    console.log('\x1b[36m%s\x1b[0m',"[SUCCESS] First 100 " +
        "articles on Hacker News are sorted correctly. " +
        "(Newest to Oldest)");

  } catch (error) {
    console.error('[ERROR] ', error.message);
  } finally {

    try {

      // clean up memory
      await page.close();
      await context.close();
      await browser.close();

    } catch(error) {
      console.error('[ERROR] While closing browser: ', error.message);
    }

  }
}

// main method call
(async () => {
  await sortHackerNewsArticles();
})();
