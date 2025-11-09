import { test, expect } from '@playwright/test';
import { mockAuthSuccess } from './utils';

test.describe('API Keys listing', () => {
  test.beforeEach(async ({ page, baseURL }) => {
    await mockAuthSuccess(page);
    await page.goto(`${baseURL}/login`);
    await page.getByLabel('Email').fill('vendor@example.com');
    await page.getByLabel('Password').fill('Password123');
    await page.getByRole('button', { name: 'Log In' }).click();
    await expect(page).toHaveURL(/\/en\/dashboard$/);
  });

  test('Loads API keys and shows table rows', async ({ page, baseURL }) => {
    await page.route('**/vendor/api-keys**', (route) =>
      route.fulfill({
        status: 200,
        json: {
          items: [
            {
              id: 'key-1',
              name: 'Server Key',
              status: 'Active',
              tier: 'Standard',
              environment: 'Production',
              lastUsedAt: null,
              createdAt: new Date().toISOString(),
            },
          ],
          page: 1,
          pageSize: 20,
          totalCount: 1,
          totalPages: 1,
        },
      })
    );

    await page.goto(`${baseURL}/dashboard/api-keys`);
    await expect(page.getByRole('heading', { name: 'API Keys' })).toBeVisible();
    await expect(page.getByText('Server Key')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Create API Key' })).toBeVisible();
  });
});

