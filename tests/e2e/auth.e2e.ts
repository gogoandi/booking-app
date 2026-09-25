import { expect, test } from '@playwright/test';

const email = 'guest@example.com';
const password = 'Abcdef1!';
const authResponse = {
  kind: 'identitytoolkit#VerifyPasswordResponse',
  email,
  localId: 'e2e-user',
  idToken: 'e2e-test-token',
  refreshToken: 'e2e-refresh-token',
  expiresIn: '3600',
};

test.beforeEach(async ({ page }) => {
  // Fail closed: unmatched authentication requests must never reach real Firebase.
  await page.route('https://identitytoolkit.googleapis.com/**', (route) => route.abort());
});

test('login, dashboard, refresh, logout, and denied dashboard access', async ({ page }) => {
  let loginRequests = 0;
  await page.route('**/v1/accounts:signInWithPassword?*', async (route) => {
    loginRequests++;
    expect(route.request().method()).toBe('POST');
    expect(route.request().postDataJSON()).toEqual({ email, password, returnSecureToken: true });
    await route.fulfill({ json: authResponse });
  });

  await page.goto('/dashboard');
  await expect(page).toHaveURL(/\/login$/);
  await page.getByLabel('Email Address', { exact: true }).fill(email);
  await page.getByLabel('Password', { exact: true }).fill(password);
  await page.getByRole('button', { name: 'Sign In' }).click();

  await expect(page).toHaveURL(/\/dashboard$/);
  await expect(page.getByRole('link', { name: 'Dashboard', exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Logout' })).toBeVisible();

  await page.reload();

  await expect(page).toHaveURL(/\/dashboard$/);
  await expect(page.getByRole('button', { name: 'Logout' })).toBeVisible();
  expect(loginRequests).toBe(1);

  await page.getByRole('button', { name: 'Logout' }).click();
  await expect(page).toHaveURL(/\/login$/);

  await page.goto('/dashboard');
  await expect(page).toHaveURL(/\/login$/);
  await expect(page.getByRole('heading', { name: 'Sign in to your account' })).toBeVisible();
  expect(loginRequests).toBe(1);
});

test('shows a failed login and allows a successful retry', async ({ page }) => {
  let attempts = 0;
  await page.route('**/v1/accounts:signInWithPassword?*', async (route) => {
    attempts++;
    if (attempts === 1) {
      await route.fulfill({
        status: 400,
        json: { error: { message: 'INVALID_LOGIN_CREDENTIALS' } },
      });
    } else {
      await route.fulfill({ json: authResponse });
    }
  });

  await page.goto('/login');
  await page.getByLabel('Email Address', { exact: true }).fill(email);
  await page.getByLabel('Password', { exact: true }).fill(password);
  await page.getByRole('button', { name: 'Sign In' }).click();

  await expect(page.getByRole('alert')).toContainText('Incorrect email or password');
  await expect(page.locator('app-loading-spinner')).toHaveCount(0);
  await expect(page.getByLabel('Email Address', { exact: true })).toHaveValue(email);

  await page.getByRole('button', { name: 'Sign In' }).click();

  await expect(page).toHaveURL(/\/dashboard$/);
  expect(attempts).toBe(2);
});

test('registers a user and restores the new session on a dashboard visit', async ({ page }) => {
  let signupRequests = 0;
  await page.route('**/v1/accounts:signUp?*', async (route) => {
    signupRequests++;
    expect(route.request().postDataJSON()).toEqual({ email, password, returnSecureToken: true });
    await route.fulfill({
      json: { ...authResponse, kind: 'identitytoolkit#SignupNewUserResponse' },
    });
  });

  await page.goto('/register');
  await page.getByLabel('Full Name', { exact: true }).fill('Test Guest');
  await page.getByLabel('Email Address', { exact: true }).fill(email);
  await page.getByLabel('Password', { exact: true }).fill(password);
  await page.getByLabel('Confirm Password', { exact: true }).fill(password);
  await page.getByRole('button', { name: 'Create Account' }).click();

  await expect(page.getByLabel('Full Name', { exact: true })).toHaveValue('');
  await expect(page.locator('app-loading-spinner')).toHaveCount(0);
  expect(signupRequests).toBe(1);

  // Signup currently stays on the registration page; visit the protected route explicitly.
  await page.goto('/dashboard');

  await expect(page).toHaveURL(/\/dashboard$/);
  await expect(page.getByRole('button', { name: 'Logout' })).toBeVisible();
});
