const { goto } = require('./utils');

const FREELANCERS_URLS = JSON.parse(process.env.FREELANCERS_URLS);

async function checkFreelancersProfile(page) {
  const freelancerUrls = FREELANCERS_URLS;
  let allJobPostUrls = [];
  for (const freelancerUrl of freelancerUrls) {
    try {
      console.log('Scanning freelancer:', freelancerUrl);
      await goto(page, freelancerUrl);
  
      await page.waitForTimeout(4000);

      const { logs, jobPostUrls } = await page.evaluate(async () => {
        const logs = [];
        const jobPostUrls = [];

        const waitForIt = () => {
          return new Promise((resolve, reject) => {
            setTimeout(resolve, 2000);
          });
        };

        async function checkJobsOfFreelancer(isCompletedJobs) {
          try {
            const jobType = isCompletedJobs ? '#completed' : '#in_progress';
            const completedJobs = document.querySelector(`.work-history ${jobType}`);

            if (completedJobs) {
              let continueCompletedJobs = false;
              do {
                const jobs = completedJobs.querySelectorAll(`${jobType} > div > div`);

                logs.push(`${jobType}: ${jobs.length}`);

                for (const job of [...jobs]) {
                  const jobNode = job.querySelector('h4 > a');

                  if (!jobNode) {
                    continue;
                  }
                  jobNode.click();

                  await waitForIt();

                  const anchors = document.querySelectorAll('.up-modal-body a');

                  for (const anchor of anchors) {
                    if (anchor.innerHTML === 'View entire job post') {
                      jobPostUrls.push(anchor.getAttribute('href'));
                      break;
                    }
                  }

                  const closeButton = document.querySelector('.up-modal-footer button');

                  closeButton.click();
                }

                try {
                  const nextButtonContainer = document.querySelector(`${jobType} > .text-right > nav > .up-pagination`);

                  if (!nextButtonContainer) {
                    continueCompletedJobs = false;
                  } else {
                    const nextButtonDisabled = nextButtonContainer.querySelector('.pagination-link:last-child > button[disabled=disabled]');

                    if (nextButtonDisabled) {
                      continueCompletedJobs = false;
                    } else {
                      const nextButton = nextButtonContainer.querySelector('.pagination-link:last-child > button');

                      if (!nextButton) {
                        continueCompletedJobs = false;
                      } else {
                        nextButton.click();

                        await waitForIt();

                        continueCompletedJobs = true;
                      }
                    }
                  }
                } catch (err) {
                  continueCompletedJobs = false;
                  logs.push(`Error while checking next jobs: ${err.message} ${err.stack}`);
                }
              } while(continueCompletedJobs);

            } else {
              logs.push(`No ${jobType} Jobs`);
            }
          } catch (err) {
            logs.push(`Error while checking ${jobType} Jobs: ${err.message} ${err.stack}`);
          }
        }

        const workHistory = document.querySelector('.work-history');

        if (!workHistory) {
          logs.push('No Work History');
          return logs;
        }

        await checkJobsOfFreelancer(true);
        await checkJobsOfFreelancer(false);

        return { logs, jobPostUrls };
      });

      console.log(logs);
      console.log(jobPostUrls);
      allJobPostUrls = allJobPostUrls.concat(jobPostUrls);
    } catch (error) {
      console.log('Error in Scanning freelancer:', error);
    }
  }

  return allJobPostUrls;
}

module.exports = checkFreelancersProfile;
