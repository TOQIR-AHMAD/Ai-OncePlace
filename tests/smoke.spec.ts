import { test, expect, type Page } from '@playwright/test';

// Toasts live inside the app-wide "Notifications" region. Scoping to it avoids
// matching Next.js's own hidden route-announcer element (also role="alert").
function toasts(page: Page) {
  return page.getByRole('region', { name: 'Notifications' }).getByRole('alert');
}

// Navigate home and wait until the client has hydrated (the counter animating to
// "40+" proves JS ran and the global error listener is attached) before acting.
async function gotoHydratedHome(page: Page) {
  await page.goto('/');
  await expect(page.getByText(/40\+ AI tools and counting/)).toBeVisible();
}

test('home renders the animated hero with no uncaught JS errors', async ({ page }) => {
  const jsErrors: string[] = [];
  page.on('pageerror', (e) => jsErrors.push(e.message));

  await page.goto('/');

  await expect(page.getByRole('heading', { level: 1 })).toContainText('Discover the best');
  await expect(page.getByRole('region', { name: 'Notifications' })).toBeAttached();
  // The animated counter eventually reaches the real tool count.
  await expect(page.getByText(/40\+ AI tools and counting/)).toBeVisible();

  expect(jsErrors, `uncaught JS errors:\n${jsErrors.join('\n')}`).toHaveLength(0);
});

test('an uncaught error surfaces a professional "Something went wrong" toast', async ({
  page,
}) => {
  await gotoHydratedHome(page);
  await page.evaluate(() => {
    window.dispatchEvent(
      new ErrorEvent('error', { message: 'boom', error: new Error('boom') }),
    );
  });

  const toast = toasts(page);
  await expect(toast).toBeVisible();
  await expect(toast).toContainText('Something went wrong');

  // It can be dismissed.
  await page.getByRole('button', { name: 'Dismiss notification' }).click();
  await expect(toast).toHaveCount(0);
});

test('an unhandled promise rejection also surfaces a toast', async ({ page }) => {
  await gotoHydratedHome(page);
  await page.evaluate(() => {
    const p = Promise.reject(new Error('async boom'));
    p.catch(() => {}); // keep it from becoming a real console error
    window.dispatchEvent(
      new PromiseRejectionEvent('unhandledrejection', {
        promise: p,
        reason: new Error('async boom'),
      }),
    );
  });
  await expect(toasts(page)).toContainText('Something went wrong');
});

test('tools page search filters the grid', async ({ page }) => {
  await page.goto('/tools/');
  await page.getByLabel('Search tools').fill('image');
  await expect(page.getByRole('link', { name: /Midjourney/ })).toBeVisible();
  // A non-image tool should be filtered out.
  await expect(page.getByRole('link', { name: /^ChatGPT/ })).toHaveCount(0);
});

test('tool detail page exposes JSON-LD SoftwareApplication and a sponsored link', async ({
  page,
}) => {
  await page.goto('/tool/chatgpt/');
  const ld = await page.locator('script[type="application/ld+json"]').first().textContent();
  expect(ld).toContain('SoftwareApplication');

  const visit = page.getByRole('link', { name: /Visit ChatGPT/ });
  await expect(visit).toBeVisible();
  await expect(visit).toHaveAttribute('rel', /sponsored nofollow/);
});

test('unknown route renders the styled 404 page', async ({ page }) => {
  await page.goto('/this-page-does-not-exist/');
  await expect(page.getByText('Page not found')).toBeVisible();
});

test('theme toggle switches between dark and light', async ({ page }) => {
  await page.goto('/');
  const html = page.locator('html');
  await expect(html).toHaveClass(/dark/);
  await page.getByRole('button', { name: /Switch to (light|dark) mode/ }).click();
  await expect(html).toHaveClass(/light/);
});
