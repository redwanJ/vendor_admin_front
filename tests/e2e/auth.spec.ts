import { test, expect } from '@playwright/test';
import { mockAuthSuccess, mockRegisterSuccess, expectToast, loginViaUI } from './utils';

test.describe('Authentication', () => {
  test('Vendor registration success redirects to login with toast', async ({ page, baseURL }) => {
    await mockRegisterSuccess(page);

    await page.goto(`${baseURL}/register`);

    await page.getByLabel('Email').fill('newvendor@example.com');
    await page.getByLabel('Full Name').fill('New Vendor');
    await page.getByLabel('Business Name').fill('My Biz');
    await page.getByLabel('Business Slug').fill('my-biz');
    await page.getByLabel('Phone Number').fill('+1 555 111 2222');
    await page.getByLabel('Address').fill('123 Test St');
    await page.getByLabel('Password', { exact: true }).fill('Password123');
    await page.getByLabel('Confirm Password', { exact: true }).fill('Password123');

    await page.getByRole('button', { name: 'Create Account' }).click();

    await expectToast(page, 'Your account has been created successfully.');
    await expect(page).toHaveURL(/\/en\/login$/);
  });

  test('Login success stores token and lands on dashboard', async ({ page, baseURL }) => {
    await loginViaUI(page, `${baseURL}`);
    const token = await page.evaluate(() => localStorage.getItem('accessToken'));
    expect(token).toBeTruthy();
  });
});
