// EDIT THIS FILE TO COMPLETE ASSIGNMENT QUESTION 1
const { chromium } = require("playwright");

async function sortHackerNewsArticles() {
  // launch browser
  const browser = await chromium.launch({headless: false});
  const context = await browser.newContext();

  // set up map of key-value pairs to hold 'rank' and 'age' -> title values.
  let dateMap = new Map();

  let pages;

  // TO DO:
  // refactor code to go to each page one after the other, grabbing the whole
  // link from the more href. The while loop should check for equal or more
  // than 100 entries in the map. If more than 100, slice the map down to
  // 100 entries. Then continue comparison.

  const hackNewsUrls = [
    { url: "https://news.ycombinator.com/newest", name: '1st page' },
    { url: "https://news.ycombinator.com/newest?n=31", name: '2nd page' },
    { url: "https://news.ycombinator.com/newest?n=61", name: '3rd page' },
    { url: "https://news.ycombinator.com/newest?n=91", name: '4th page' }
  ]


  try {

    // generate array of pages to load links concurrently
    pages = await Promise.all(
        hackNewsUrls.map(() => context.newPage())
    );



    for (const [index, page] of pages.entries()) {


      await  page.goto(hackNewsUrls[index].url);

      // Wait for the content to be available
      await page.waitForSelector('.rank');
      await page.waitForSelector('.age');


      let rankElements = await page.locator('.rank').all();
      let ageElements = await page.locator('.age').all();


      if (hackNewsUrls[index].name === "4th page") {
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


    }

    //compare timestamps
    for (let index = 1 ; index < 100 ; index++) {

      const current = dateMap.get(index+1);
      const previous = dateMap.get(index);

      console.log("Compare: " + (index+1), current + " -> " + index,previous + ".");

      if (current > previous) {

        const formatter = new Intl.DateTimeFormat('en-US', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false
        });

        const currDateFormatted = formatter.format(current);
        const prevDateFormatted = formatter.format(previous);

        throw new Error("Hacker News Articles are not sorted by newest or are out of order: \n" +
            "At Index: " + (index+1) + "\n" +
            currDateFormatted + " is greater than " + prevDateFormatted + ":\n" +
            current + " > " + previous + ".");
      }


    }

    console.log("First 100 articles on Hacker News " +
        "are sorted correctly. (Newest to Oldest)")

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
