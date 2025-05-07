# QA Wolf Job Application Assignment

#### Author: Ari Kai Wynder

A take-home assignment from [QA Wolf](https://www.qawolf.com)'s application
process for [Junior Software Engineer](https://www.task-wolf.com/apply-qae).

The assignment concerns creating a script using
[Node.js](https://nodejs.org/en) and the website
[Hacker News](https://news.ycombinator.com/).

---

### Details

The script verifies if the first 100 articles on the Hacker News "newest"
page are sorted from newest to oldest. The function navigates through the
first four pages, retrieves article ranks and timestamps, and performs validation.
If the articles are not sorted correctly, an error message with detailed information is logged.

---

### Usage

- Ensure Node.js is installed
- Open terminal, navigate to working directory
- To initialize Node.js and Playwright, run:
```
npm init -y
npm install playwright
npx playwright install
```
- To use script, run:
```
node src/index.js
```