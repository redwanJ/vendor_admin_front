import { test, expect } from '@playwright/test';
import { mockAuthSuccess, expectToast } from './utils';

test.describe('Staff listing and invite', () => {
  test.beforeEach(async ({ page, baseURL }) => {
    await mockAuthSuccess(page);
    await page.route('**/vendor/users**', (route) =>
      route.fulfill({
        status: 200,
        json: {
          items: [
            {
              id: 'user-1',
              fullName: 'John Team',
              email: 'john@example.com',
              status: 'Active',
              roles: ['VendorStaff'],
              lastLoginAt: null,
            },
          ],
          page: 1,
          pageSize: 20,
          totalCount: 1,
          totalPages: 1,
        },
      })
    );
    await page.route('**/roles?**', (route) =>
      route.fulfill({ status: 200, json: [
        { id: 'r1', name: 'VendorOwner', description: 'Owner' },
        { id: 'r2', name: 'VendorStaff', description: 'Staff' },
      ] })
    );
    await page.goto(`${baseURL}/login`);
    await page.getByLabel('Email').fill('vendor@example.com');
    await page.getByLabel('Password').fill('Password123');
    await page.getByRole('button', { name: 'Log In' }).click();
    await expect(page).toHaveURL(/\/en\/dashboard$/);
  });

  test('Loads staff and invites a new member', async ({ page, baseURL }) => {
    await page.goto(`${baseURL}/dashboard/staff`);
    await expect(page.getByRole('heading', { name: 'Staff Management' })).toBeVisible();
    await expect(page.getByText('John Team')).toBeVisible();

    await page.route('**/vendor/users/invite', (route) =>
      route.fulfill({ status: 200, json: { userId: 'user-2' } })
    );

    await page.getByRole('button', { name: 'Invite Staff' }).click();
    await page.getByLabel('Full Name').fill('Jane New');
    await page.getByLabel('Email').fill('jane@example.com');

    // Role select may be a custom select; attempt to pick the placeholder and choose option by text
    await page.getByText('Select a role').click();
    await page.getByRole('option', { name: 'VendorStaff' }).click();

    // Try common submit button labels
    await page.getByRole('button', { name: 'Invite Staff Member' }).click();
    await expectToast(page, 'Staff invitation sent successfully');
  });
});
