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

module.exports = {
  unwrapAllOpenJobUrl,
  goto
};
