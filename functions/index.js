// const functions = require('firebase-functions');
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const randomUseragent = require('random-useragent');
require('dotenv').config();

const checkFreelancersProfile = require('./freelancer');
const checkJobPosts = require('./jobPost');
const { goto } = require('./utils');

puppeteer.use(StealthPlugin());

// const runtimeOpts = {
//   timeoutSeconds: 540,
//   memory: '1GB',
// };

// exports.upworkJobScanScheduler = functions.runWith(runtimeOpts).pubsub.schedule('0 0 * * *')
//   .timeZone('Asia/Kolkata')
//   .onRun(async () => {
//     console.log('Scheduler Running...');

//     await startTracking();

//     return null;
//   });

const UPWORK_USERNAME = process.env.UPWORK_USERNAME;
const UPWORK_PASSWORD = process.env.UPWORK_PASSWORD;

const puppeteerArgs = [
  '--no-sandbox',
  '--disable-setuid-sandbox',
  '--disable-infobars',
  '--window-position=0,0',
  '--ignore-certifcate-errors',
  '--ignore-certifcate-errors-spki-list',
];

const newOpenJobs = [];

async function waitForIt() {
  return new Promise(resolve => {
    setTimeout(resolve, 10000);
  });
}

async function startTracking() {
  let browser = null;
  let page = null;
  let isLoginSuccessful = false;

  try {
    do {

      if (browser) {
        await browser.close();
        
        await waitForIt();
      }

      browser = await puppeteer.launch({
        headless: false,
        defaultViewport: {
          height: 1080 + Math.floor(Math.random() * 100),
          width: 1920 + Math.floor(Math.random() * 100),
        },
        args: puppeteerArgs,
      });

      page = await browser.newPage();
      await page.setUserAgent(randomUseragent.getRandom());

      await page.waitForTimeout(3000);

      isLoginSuccessful = await login(page);

    } while (!isLoginSuccessful);

    if (!isLoginSuccessful) {
      throw new Error('Failed to login');
    }

    await page.waitForTimeout(4000);

    const jobPostUrls = await checkFreelancersProfile(page);

    await checkJobPosts(browser, page, jobPostUrls, newOpenJobs);

    console.log(`Open Jobs (${newOpenJobs.length}):`, newOpenJobs);
    console.log('Scheduler Completed Job...');
  } catch (error) {
    console.log('Error => ', error);
  } finally {
    if (browser) await browser.close();
  }
}

async function login(page) {
  try {
    await goto(page, 'https://www.upwork.com/ab/account-security/login', 20000);
  
    await page.waitForTimeout(3000);
  
    const url = await page.url();
    const title = await page.title();
    console.log('On page...', url, title);
  
    await page.type('#login_username', UPWORK_USERNAME);
    await page.click('#login_password_continue');
  
    await page.waitForTimeout(3000);
    await page.waitFor('#login_control_continue');
  
    const url1 = await page.url();
    const title1 = await page.title();
    console.log('On page...', url1, title1);
  
    await page.type('#login_password', UPWORK_PASSWORD);
    await page.click('#login_control_continue');
  
    console.log('Logging in...');
    await page.waitForTimeout(10000);
  
    const currentUrl = await page.url();
  
    console.log('Url after Login:', currentUrl);
  
    if (currentUrl.includes('ab/create-profile')) {
      return true;
    }
  
    return false;
  } catch (err) {
    console.log(`Failed to login: ${err.message}`);
    return false;
  }
}

startTracking();
