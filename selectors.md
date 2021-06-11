<!-- Login URL -->
https://www.upwork.com/ab/account-security/login

<!-- Username / Email Field -->
#login_username

<!-- Username / Email Submit Button -->
#login_password_continue

<!-- Password Field -->
#login_password

<!-- Password Submit Button -->
#login_control_continue

<!-- Freelancer Work History -->
.work-history

<!-- Completed -->
#completed

<!-- In Progress -->
#in_progress

<!-- Job on Freelancer Profile -->
#completed > div > div h4 > a
#in_progress > div > div h4 > a

<!-- Next Page of Jobs -->
#completed > .text-right > nav > .up-pagination > .pagination-link
#completed > .text-right > nav > .up-pagination > .pagination-link > button[disabled=disabled]
#completed > .text-right > nav > .up-pagination > .pagination-link .next-icon

<!-- Get Link to Job Post -->
.up-modal-body a => Anchor tags with text "View entire job post" => Take the href

<!-- Close modal -->
.up-modal-footer button
await page.keyboard.press('Escape');

<!-- Check for Job Post no longer available -->
div.error-image - IMAGE
h1.text-muted - This job post is no longer available

<!-- No Job Openings -->
.other-jobs - missing

<!-- Job Openings -->
.other-jobs ul#otherOpenJobs a

<!-- More Job Openings -->
.up-card-footer a.js-show-more

<!-- New jobs are at the end of the list -->

<!-- Job Posted On details -->
#posted-on .text-muted.up-popper-trigger .inline