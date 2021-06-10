const { unwrapAllOpenJobUrl, goto } = require('./utils');

const JOB_POST_STATUS = {
  JOB_DOES_NOT_EXIST: 1,
  NO_OPEN_JOBS: 2,
  OPEN_JOBS_AVAILABLE: 3,
};

async function checkJobPosts(browser, page, jobPostUrls, newOpenJobs) {
  for (const jobPostUrl of jobPostUrls) {
    console.log('Scanning job post:', jobPostUrl);
    await goto(page, `https://www.upwork.com${jobPostUrl}`);

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
      console.log('Job post not found');
      continue;
    }
    if (jobStatus === JOB_POST_STATUS.NO_OPEN_JOBS) {
      console.log('No open jobs for this client');
      continue;
    }

    // By default Upwork shows 5 open jobs, rest are wrapped. Unwrap all open jobs.
    await unwrapAllOpenJobUrl(page);

    const openJobUrls = await page.evaluate(() => {
      const openJobs = document.querySelectorAll('.other-jobs ul#otherOpenJobs a');

      // Get link of Open jobs.
      return [...openJobs].map((openJob) => openJob.getAttribute('href'));
    });

    console.log('Open Job Urls:', openJobUrls);

    await checkOpenJobs(browser, openJobUrls, newOpenJobs);
  }
}

async function checkOpenJobs(browser, openJobUrls, newOpenJobs) {
  for (const openJobUrl of openJobUrls) {
    let newPage;
    try {
      newPage = await browser.newPage();
      await newPage.waitForTimeout(2000);

      console.log('Checking open job post:', openJobUrl);
      await goto(newPage, `https://www.upwork.com${openJobUrl}`);

      const url = await newPage.url();
      const title = await newPage.title();
      console.log('On page...', url, title);

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
      console.log('Error checking open job post => ', error);
    } finally {
      if (newPage) await newPage.close();
    }
  }
}

module.exports = checkJobPosts;
