// EDIT THIS FILE TO COMPLETE ASSIGNMENT QUESTION 1
const { chromium } = require("playwright");

async function sortHackerNewsArticles() {
  // launch browser
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  let dateMap = new Map();

  // go to Hacker News
  await page.goto("https://news.ycombinator.com/newest");

  // wait for element with class 'rank' to be visible
  const rankElement = await page.waitForSelector('.rank');

  // get the text content
  let rank = await rankElement.textContent();
  rank = parseInt(rank.substring(0, rank.length - 1));

  // // print the rank
  // console.log('Rank value:', rank);

  // wait for element with class 'age' to be visible
  const dateElement = await page.waitForSelector('.age');

  //grab the title attribute with the date
  const date = await dateElement.getAttribute('title');

  // // print the date
  // console.log('Date value:', date);

  dateMap.set(rank,date);


  //print key-value pair
  console.log('Rank ' + dateMap.keys().next().value + ': ', dateMap.get(dateMap.keys().next().value));

  // close browser
  await browser.close();

}

(async () => {
  await sortHackerNewsArticles();
})();
