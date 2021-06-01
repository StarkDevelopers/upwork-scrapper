const functions = require('firebase-functions');
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const randomUseragent = require('random-useragent');
require('dotenv').config();

puppeteer.use(StealthPlugin());

const runtimeOpts = {
  timeoutSeconds: 540,
  memory: '1GB',
};

exports.upworkJobScanScheduler = functions.runWith(runtimeOpts).pubsub.schedule('0 0 * * *')
  .timeZone('Asia/Kolkata')
  .onRun(async () => {
    functions.logger.info('Scheduler Running...');

    await startTracking();

    return null;
  });

const UPWORK_USERNAME = process.env.UPWORK_USERNAME;
const UPWORK_PASSWORD = process.env.UPWORK_PASSWORD;
const JOBPOST_URLS = JSON.parse(process.env.JOBPOST_URLS);

const puppeteerArgs = [
  '--no-sandbox',
  '--disable-setuid-sandbox',
  '--disable-infobars',
  '--window-position=0,0',
  '--ignore-certifcate-errors',
  '--ignore-certifcate-errors-spki-list',
];

const JOB_POST_STATUS = {
  JOB_DOES_NOT_EXIST: 1,
  NO_OPEN_JOBS: 2,
  OPEN_JOBS_AVAILABLE: 3,
};

// const functions = {
//   logger: {
//     info: console.log
//   }
// };

async function startTracking() {
  const jobPostUrls = JOBPOST_URLS;
  const newOpenJobs = [];

  let browser = null;
  try {
    browser = await puppeteer.launch({
      headless: true,
      defaultViewport: {
        height: 1080 + Math.floor(Math.random() * 100),
        width: 1920 + Math.floor(Math.random() * 100),
      },
      args: puppeteerArgs,
    });
    const page = await browser.newPage();
    await page.setUserAgent(randomUseragent.getRandom());

    await page.waitForTimeout(5000);

    const isLoginSuccessful = await login(page);

    if (!isLoginSuccessful) {
      throw new Error('Failed to login');
    }

    await page.waitForTimeout(5000);

    for (const jobPostUrl of jobPostUrls) {
      functions.logger.info('Scanning job post:', jobPostUrl);
      await goto(page, jobPostUrl);

      await page.waitForTimeout(5000);

      const jobStatus = await page.evaluate((JOB_POST_STATUS) => {
        // Check if job post is not available anymore.
        const errorImage = document.querySelector('div.error-image');
        const errorMessage = document.querySelector('h1.text-muted');
        if (errorImage || errorMessage) {
          return JOB_POST_STATUS.JOB_DOES_NOT_EXIST;
        }

        // Check if current client has other jobs open
        const otherJobs = document.querySelector('.other-jobs');
        if (!otherJobs) {
          return JOB_POST_STATUS.NO_OPEN_JOBS;
        }

        return JOB_POST_STATUS.OPEN_JOBS_AVAILABLE;
      }, JOB_POST_STATUS);

      if (jobStatus === JOB_POST_STATUS.JOB_DOES_NOT_EXIST) {
        functions.logger.info('Job post not found');
        continue;
      }
      if (jobStatus === JOB_POST_STATUS.NO_OPEN_JOBS) {
        functions.logger.info('No open jobs for this client');
        continue;
      }

      // By default Upwork shows 5 open jobs, rest are wrapped. Unwrap all open jobs.
      await unwrapAllOpenJobUrl(page);

      const openJobUrls = await page.evaluate(() => {
        const openJobs = document.querySelectorAll('.other-jobs ul#otherOpenJobs a');

        // Get link of Open jobs.
        return [...openJobs].map((openJob) => openJob.getAttribute('href'));
      });

      functions.logger.info('Open Job Urls:', openJobUrls);

      for (const openJobUrl of openJobUrls) {
        const newPage = page;
        try {
          await newPage.waitForTimeout(3000);
          // newPage = await browser.newPage();

          functions.logger.info('Checking open job post:', openJobUrl);
          await goto(newPage, `https://www.upwork.com${openJobUrl}`);

          const url = await newPage.url();
          const title = await newPage.title();
          functions.logger.info('On page...', url, title);

          const postedOn = await newPage.evaluate(() => {
            const postedOnContent = document.querySelector('#posted-on .text-muted.up-popper-trigger .inline');

            if (!postedOnContent) {
              return null;
            }

            return postedOnContent.innerHTML;
          });

          if (postedOn.includes('second') || postedOn.includes('minute') || postedOn.includes('hour')) {
            newOpenJobs.push(openJobUrl);
          }
        } catch (error) {
          functions.logger.info('Error checking open job post => ', error);
        }
      }
    }

    functions.logger.info(`Open Jobs (${newOpenJobs.length}):`, newOpenJobs);
    functions.logger.info('Scheduler Completed Job...');
  } catch (error) {
    functions.logger.info('Error => ', error);
  } finally {
    if (browser) await browser.close();
  }
}

async function login(page) {
  await goto(page, 'https://www.upwork.com/ab/account-security/login', 20000);

  await page.waitForTimeout(3000);

  const url = await page.url();
  const title = await page.title();
  functions.logger.info('On page...', url, title);

  await page.type('#login_username', UPWORK_USERNAME);
  await page.click('#login_password_continue');

  await page.waitForTimeout(3000);
  await page.waitFor('#login_control_continue');

  const url1 = await page.url();
  const title1 = await page.title();
  functions.logger.info('On page...', url1, title1);

  await page.type('#login_password', UPWORK_PASSWORD);
  await page.click('#login_control_continue');

  functions.logger.info('Logging in...');
  await page.waitForTimeout(10000);

  const currentUrl = await page.url();

  functions.logger.info('Url after Login:', currentUrl);

  if (currentUrl.includes('ab/create-profile')) {
    return true;
  }

  return false;
}

async function unwrapAllOpenJobUrl(page) {
  let shouldUnwrap = true;
  while (shouldUnwrap) {
    try {
      await page.click('.other-jobs .up-card-footer a.js-show-more');

      await page.waitForTimeout(2000);
    } catch (_) {
      shouldUnwrap = false;
    }
  }
}

async function goto(page, url, timeout = 10000) {
  try {
    await page.goto(url, {waitUntil: 'networkidle2', timeout});
  } catch (error) {
    if (error.message !== `Navigation timeout of ${timeout} ms exceeded`) {
      throw error;
    }
  }
}

startTracking();
