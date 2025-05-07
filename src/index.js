/**
 * Represents the Chromium browser automation and testing framework.
 * Provides methods and properties to interact with Chromium-based browsers.
 * Typically used for launching, managing, and automating browser instances.
 *
 * Modified template provided by [QA Wolf]{@link https://www.task-wolf.com/apply-qae}
 * @author Ari Kai Wynder
 *
 */

const { chromium } = require("playwright");
const { expect } = require("playwright/test");

/**
 * Verifies if the first 100 articles on the Hacker News "newest" page are sorted from newest to oldest.
 * The function navigates through pages, retrieves article ranks and timestamps, and performs validation.
 * If the articles are not sorted correctly, an error message with detailed information is logged.
 *
 * @return {Promise<void>} A Promise that resolves when the process is complete or an error is logged if any issues occur.
 */
async function sortHackerNewsArticles() {

  // launch browser and set up preparation for page
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

  // set up map of key-value pairs to
  // hold 'rank' and 'age' -> title values.
  let dateMap = new Map();

  // prep try block to catch errors
  try {

    // site to go to
    let href = "https://news.ycombinator.com/newest";


    // fill 'rank -> timestamp' map
    while (dateMap.size < 100) {

      // go to hacker news (iterating pages)
      await  page.goto(href);

      // Wait for the content to be available
      await page.waitForSelector('.rank');
      await page.waitForSelector('.age');
      await page.waitForSelector('.morelink');


      // get required elements in page
      let rankElements = await page.locator('.rank').all();
      let ageElements = await page.locator('.age').all();


      // check if we're on the last page
      // to then only grab the first 10
      // for 100 map entries total
      if (href.includes("n=91")) {
        rankElements = rankElements.slice(0, 10);
        ageElements = ageElements.slice(0, 10);

      }

      // get final values and add to 'dateMap'
      for (const [index, rankElement] of rankElements.entries()) {
        let rank = await rankElement.textContent();
        rank = parseInt(rank.substring(0, rank.length - 1));

        // find age elements in page and pull out
        // the date formatted as 'yyyy-MM-ddThh:mm:ss'
        let ageElement = ageElements[index];
        let age = await ageElement.getAttribute('title');
        let ageLength = age.indexOf(" ");


        // parse date to get timestamps for easy comparison
        let timestamp = Date.parse(age.substring(0, ageLength));

        // final add to map
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


      // expect the current timestamp to be
      // older (less) than previous timestamp
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

    // Catch any possible errors to
    // display a human-readable message
    console.error('[ERROR] ', error.message);


  } finally {

    // close out chromium
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

// main call
(async () => {
  await sortHackerNewsArticles();
})();
