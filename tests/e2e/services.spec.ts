import { test, expect } from '@playwright/test';
import { mockAuthSuccess, loginViaUI, expectToast, selectServiceTypeFirst, selectCategoryFirstNonNone, selectUnitFirst, assertSelectShowsOptionSelected, selectOptionByLabel, assertLabeledSelectChecked, selectNthOptionByLabel } from './utils';

test.describe('Services listing', () => {
  test.beforeEach(async ({ page, baseURL }) => {
    await loginViaUI(page, `${baseURL}`);
  });

  test('Loads services and shows table rows', async ({ page, baseURL }) => {
    await page.route('**/lookups/service-types**', (route) =>
      route.fulfill({ status: 200, json: [{ id: 'st-1', name: 'Venue' }] })
    );
    await page.route('**/lookups/categories**', (route) =>
      route.fulfill({ status: 200, json: [{ id: 'cat-1', name: 'Weddings' }] })
    );
    await page.route('**/vendor/services**', (route) =>
      route.fulfill({
        status: 200,
        json: {
          items: [
            {
              id: 'svc-1',
              name: 'Grand Ballroom',
              shortDescription: 'Beautiful venue',
              serviceType: { id: 'st-1', name: 'Venue' },
              category: { id: 'cat-1', name: 'Weddings' },
              basePrice: 2000,
              currency: 'USD',
              pricingModel: 'PerEvent',
              status: 'Active',
              isFeatured: true,
              updatedAt: new Date().toISOString(),
              imageUrl: null,
            },
          ],
          page: 1,
          pageSize: 20,
          totalCount: 1,
          totalPages: 1,
        },
      })
    );

    await page.goto(`${baseURL}/dashboard/services`);

    await expect(page.getByRole('heading', { name: 'Services' })).toBeVisible();
    await expect(page.getByText('Grand Ballroom', { exact: true })).toBeVisible();
    await expect(page.getByRole('cell', { name: 'Venue', exact: true })).toBeVisible();
    await expect(page.getByRole('cell', { name: 'Weddings', exact: true })).toBeVisible();

    await expect(page.getByRole('button', { name: 'Add Service' })).toBeVisible();
  });

  test('Create Standard service', async ({ page, baseURL }) => {
    test.setTimeout(90000);
    // Lookups
    await page.route('**/lookups/service-types**', (route) =>
      route.fulfill({ status: 200, json: [{ id: 'st-1', name: 'Venue' }] })
    );
    await page.route('**/lookups/categories**', (route) =>
      route.fulfill({ status: 200, json: [{ id: 'cat-1', name: 'Weddings' }] })
    );
    // Create endpoint
    await page.route('**/vendor/services', (route) => {
      if (route.request().method().toUpperCase() === 'POST') {
        return route.fulfill({ status: 200, json: { id: 'svc-new' } });
      }
      return route.continue();
    });

    await page.goto(`${baseURL}/dashboard/services/new`);

    // Ensure Basic tab is active
    await page.getByRole('tab', { name: 'Basic Info' }).click();

    // Basic Info - use placeholders/select visible text
    // Prefer label-scoped selection to avoid ambiguous triggers
    await selectOptionByLabel(page, 'Service Type', undefined);

    // Category: select 2nd option explicitly
    await selectNthOptionByLabel(page, 'Category', 1);

    await selectOptionByLabel(page, 'Service Kind', 'Standard Service');

    const nameInput = page.getByPlaceholder('e.g., Grand Ballroom Venue');
    await nameInput.click();
    await nameInput.fill('Test Standard Service');
    await expect(nameInput).toHaveValue('Test Standard Service');

    // Optionally short description to ensure typing works
    await page.getByPlaceholder('Brief summary (max 500 characters)').fill('Short summary');

    // Pricing
    await page.getByRole('tab', { name: 'Pricing' }).click();
    const basePrice = page.getByPlaceholder('Enter base price');
    await expect(basePrice).toBeVisible();
    await basePrice.click();
    await basePrice.fill('1500');
    await expect(basePrice).toHaveValue('1500');
    // Currency and Pricing Model have defaults; leave as-is to reduce flakiness

    // Visit other tabs briefly to ensure navigation works
    await page.getByRole('tab', { name: 'Images' }).click();
    await page.getByRole('tab', { name: 'Capacity & Timing' }).click();
    await page.getByRole('tab', { name: 'SEO' }).click();
    // Return to Pricing to submit
    await page.getByRole('tab', { name: 'Pricing' }).click();

    // Submit
    await page.getByRole('button', { name: 'Create' }).click();
    await expectToast(page, 'Service created successfully');
    await expect(page).toHaveURL(/\/en\/dashboard\/services$/);
  });

  test('Create Rental service', async ({ page, baseURL }) => {
    test.setTimeout(90000);
    await page.route('**/lookups/service-types**', (route) =>
      route.fulfill({ status: 200, json: [{ id: 'st-1', name: 'Venue' }] })
    );
    await page.route('**/lookups/categories**', (route) =>
      route.fulfill({ status: 200, json: [{ id: 'cat-1', name: 'Weddings' }] })
    );
    await page.route('**/vendor/services', (route) => {
      if (route.request().method().toUpperCase() === 'POST') {
        return route.fulfill({ status: 200, json: { id: 'svc-rental' } });
      }
      return route.continue();
    });

    await page.goto(`${baseURL}/dashboard/services/new`);

    await page.getByRole('tab', { name: 'Basic Info' }).click();
    await selectOptionByLabel(page, 'Service Type', undefined);

    // Category: select 2nd option explicitly
    await selectNthOptionByLabel(page, 'Category', 1);

    await selectOptionByLabel(page, 'Service Kind', 'Rental Service');

    const rentalName = page.getByPlaceholder('e.g., Grand Ballroom Venue');
    await rentalName.click();
    await rentalName.fill('Test Rental Service');
    await expect(rentalName).toHaveValue('Test Rental Service');

    // Pricing
    await page.getByRole('tab', { name: 'Pricing' }).click();
    const basePrice2 = page.getByPlaceholder('Enter base price');
    await expect(basePrice2).toBeVisible();
    await basePrice2.fill('250');
    // Change pricing model to Per Hour using labeled select
    await selectOptionByLabel(page, 'Pricing Model', 'Per Hour');

    // Rental tab
    await page.getByRole('tab', { name: 'Rental Configuration' }).click();
    // Fill rental fields via placeholders
    const invQty = page.getByPlaceholder('10');
    await invQty.click();
    await invQty.fill('10');
    await expect(invQty).toHaveValue('10');
    await selectOptionByLabel(page, 'Rental Period Unit', undefined);
    const minPeriod = page.getByPlaceholder('1').first();
    await minPeriod.click();
    await minPeriod.fill('1');
    await expect(minPeriod).toHaveValue('1');

    // Navigate other tabs
    await page.getByRole('tab', { name: 'Images' }).click();
    await page.getByRole('tab', { name: 'Capacity & Timing' }).click();
    await page.getByRole('tab', { name: 'SEO' }).click();
    await page.getByRole('tab', { name: 'Rental Configuration' }).click();

    await page.getByRole('button', { name: 'Create' }).click();
    await expectToast(page, 'Service created successfully');
    await expect(page).toHaveURL(/\/en\/dashboard\/services$/);
  });

  test('Update service', async ({ page, baseURL }) => {
    // Mock fetch by id and categories
    await page.route('**/vendor/services/svc-1', (route) => {
      if (route.request().method().toUpperCase() === 'GET') {
        return route.fulfill({ status: 200, json: {
          id: 'svc-1',
          name: 'Grand Ballroom',
          shortDescription: 'Beautiful venue',
          serviceType: { id: 'st-1', name: 'Venue' },
          category: { id: 'cat-1', name: 'Weddings' },
          basePrice: 2000,
          currency: 'USD',
          pricingModel: 'FixedPrice',
          status: 'Active',
          isFeatured: false,
          updatedAt: new Date().toISOString(),
          kind: 'Standard',
        } });
      }
      if (route.request().method().toUpperCase() === 'PUT') {
        return route.fulfill({ status: 200, json: { success: true } });
      }
      return route.continue();
    });
    await page.route('**/lookups/categories**', (route) =>
      route.fulfill({ status: 200, json: [{ id: 'cat-1', name: 'Weddings' }] })
    );

    await page.goto(`${baseURL}/dashboard/services/svc-1/edit`);

    // Pricing tab: update base price
    await page.getByRole('tab', { name: 'Pricing' }).click();
    const basePrice3 = page.getByPlaceholder('Enter base price');
    await expect(basePrice3).toBeVisible();
    await basePrice3.fill('2100');

    await page.getByRole('button', { name: 'Save' }).click();
    await expectToast(page, 'Service updated successfully and sent for admin review');
    await expect(page).toHaveURL(/\/en\/dashboard\/services\/svc-1$/);
  });
});
