import { test, expect } from '@playwright/test';
import { mockAuthSuccess } from './utils';

test.describe('Customers listing', () => {
  test.beforeEach(async ({ page, baseURL }) => {
    await mockAuthSuccess(page);
    await page.goto(`${baseURL}/login`);
    await page.getByLabel('Email').fill('vendor@example.com');
    await page.getByLabel('Password').fill('Password123');
    await page.getByRole('button', { name: 'Log In' }).click();
    await expect(page).toHaveURL(/\/en\/dashboard$/);
  });

  test('Loads customers and shows table rows', async ({ page, baseURL }) => {
    await page.route('**/vendor/customers**', (route) =>
      route.fulfill({
        status: 200,
        json: {
          items: [
            {
              id: 'cust-1',
              fullName: 'Alice Smith',
              email: 'alice@example.com',
              phoneNumber: '+1 555 000 1111',
              customerType: 'Individual',
              status: 'Active',
              tags: ['VIP'],
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

    await page.goto(`${baseURL}/dashboard/customers`);

    await expect(page.getByRole('heading', { name: 'Customers' })).toBeVisible();
    await expect(page.getByText('Alice Smith')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Add Customer' })).toBeVisible();
  });
});

