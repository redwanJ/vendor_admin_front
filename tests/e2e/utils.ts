import { Page, expect } from '@playwright/test';

export async function mockAuthSuccess(page: Page) {
  await page.route('**/auth/login', async (route) => {
    const req = await route.request().postDataJSON();
    if (!req?.email || !req?.password) {
      return route.fulfill({ status: 400, json: { message: 'Invalid credentials' } });
    }
    return route.fulfill({
      status: 200,
      json: {
        accessToken: 'test-access-token',
        refreshToken: 'test-refresh-token',
        expiresIn: 3600,
        tokenType: 'Bearer',
      },
    });
  });

  await page.route('**/auth/me', async (route) => {
    return route.fulfill({
      status: 200,
      json: {
        id: 'user-1',
        email: 'vendor@example.com',
        fullName: 'Vendor User',
        roles: ['VendorOwner'],
      },
    });
  });

  // Ensure any refresh attempts succeed so axios interceptor does not bounce to /login
  await page.route('**/auth/refresh', async (route) => {
    return route.fulfill({ status: 200, json: { accessToken: 'refreshed-token' } });
  });

  // Provide safe defaults to avoid 401s from background requests during initial navigation
  await page.route('**/lookups/**', async (route) => {
    return route.fulfill({ status: 200, json: [] });
  });
  await page.route('**/vendor/**', async (route) => {
    const url = route.request().url();
    if (url.includes('/vendor/services')) {
      return route.fulfill({ status: 200, json: { items: [], page: 1, pageSize: 20, totalCount: 0, totalPages: 1 } });
    }
    if (url.includes('/vendor/customers')) {
      return route.fulfill({ status: 200, json: { items: [], page: 1, pageSize: 20, totalCount: 0, totalPages: 1 } });
    }
    if (url.includes('/vendor/users')) {
      return route.fulfill({ status: 200, json: { items: [], page: 1, pageSize: 20, totalCount: 0, totalPages: 1 } });
    }
    if (url.includes('/vendor/api-keys')) {
      return route.fulfill({ status: 200, json: { items: [], page: 1, pageSize: 20, totalCount: 0, totalPages: 1 } });
    }
    return route.fulfill({ status: 200, json: {} });
  });
}

export async function mockRegisterSuccess(page: Page) {
  await page.route('**/auth/register/vendor', async (route) => {
    const body = await route.request().postDataJSON();
    if (!body?.email) {
      return route.fulfill({ status: 400, json: { message: 'Email is required' } });
    }
    return route.fulfill({
      status: 200,
      json: {
        userId: 'user-1',
        tenantId: 'tenant-1',
        email: body.email,
        businessName: body.businessName || 'Test Biz',
        message: 'Registered',
      },
    });
  });
}

export async function expectToast(page: Page, text: string) {
  // Prefer exact match within toast content and pick the first match to avoid strict-mode conflicts
  await expect(page.getByText(text, { exact: true }).first()).toBeVisible();
}

export async function loginViaUI(page: Page, baseURL?: string) {
  await mockAuthSuccess(page);
  await page.goto(`${baseURL || ''}/login`);
  await page.getByLabel('Email', { exact: true }).fill('vendor@example.com');
  await page.getByLabel('Password', { exact: true }).fill('Password123');
  await page.getByRole('button', { name: 'Log In' }).click();
  await expectToast(page, 'You have been logged in successfully.');
  // Try to wait for SPA redirect, then fall back to manual navigation
  try {
    await expect(page).toHaveURL(/\/en\/dashboard$/);
  } catch {
    const stillOnLogin = await page.url().endsWith('/en/login');
    const token = await page.evaluate(() => localStorage.getItem('accessToken'));
    if (stillOnLogin && token) {
      await page.goto(`${baseURL || ''}/dashboard`);
      await expect(page).toHaveURL(/\/en\/dashboard$/);
    } else {
      throw new Error('Login did not navigate and token missing');
    }
  }
}

// Generic helper to open a shadcn/radix Select by visible trigger text and
// choose the first meaningful option. Excludes placeholder-like entries.
export async function selectFirstOptionByTriggerText(
  page: Page,
  triggerText: string,
  excludeTexts: Array<string | RegExp> = [/select/i, /all/i]
) {
  await page.getByText(triggerText, { exact: true }).first().click();
  const options = page.getByRole('option');
  await expect(options.first()).toBeVisible();
  const count = await options.count();
  for (let i = 0; i < count; i++) {
    const opt = options.nth(i);
    const text = (await opt.innerText()).trim();
    const isExcluded = excludeTexts.some((ex) =>
      typeof ex === 'string' ? text.toLowerCase().includes(ex.toLowerCase()) : ex.test(text)
    );
    if (!isExcluded && text.length > 0) {
      await opt.click();
      return text;
    }
  }
  throw new Error(`No selectable options found for trigger: ${triggerText}`);
}

export async function selectServiceTypeFirst(page: Page) {
  return selectFirstOptionByTriggerText(page, 'Select service type');
}

export async function selectCategoryFirstNonNone(page: Page) {
  // Skip "No category" and placeholders
  return selectFirstOptionByTriggerText(page, 'Select a category', [/no category/i, /__none__/i, /select/i]);
}

export async function selectUnitFirst(page: Page) {
  return selectFirstOptionByTriggerText(page, 'Select unit');
}

// Verify a Select currently has an option chosen by re-opening and checking data-state
export async function assertSelectShowsOptionSelected(
  page: Page,
  optionText: string
) {
  // Fallback global reopen by clicking the text (may be ambiguous)
  await page.getByText(optionText, { exact: true }).first().click();
  const selected = page.getByRole('option', { name: optionText, exact: true }).first();
  await expect(selected).toHaveAttribute('data-state', /checked/);
  await page.keyboard.press('Escape');
}

// Labeled Select helpers (more robust than trigger text when duplicates exist)
async function openSelectByLabel(page: Page, labelText: string) {
  const label = page.locator('label', { hasText: labelText }).first();
  await expect(label).toBeVisible();
  // Go to the form item wrapper (label's parent) then find the trigger button
  const wrapper = label.locator('xpath=..');
  const trigger = wrapper.locator('button').first();
  await trigger.click();
}

export async function selectOptionByLabel(page: Page, labelText: string, optionText?: string) {
  await openSelectByLabel(page, labelText);
  if (optionText) {
    await page.getByRole('option', { name: optionText, exact: true }).first().click();
    return optionText;
  } else {
    const options = page.getByRole('option');
    await expect(options.first()).toBeVisible();
    const count = await options.count();
    for (let i = 0; i < count; i++) {
      const opt = options.nth(i);
      const text = (await opt.innerText()).trim();
      if (!/select/i.test(text) && text.length > 0) {
        await opt.click();
        return text;
      }
    }
  }
}

export async function selectFirstOptionByLabelExcluding(
  page: Page,
  labelText: string,
  excludeTexts: Array<string | RegExp>
) {
  await openSelectByLabel(page, labelText);
  const options = page.getByRole('option');
  await expect(options.first()).toBeVisible();
  const count = await options.count();
  for (let i = 0; i < count; i++) {
    const opt = options.nth(i);
    const text = (await opt.innerText()).trim();
    const isExcluded = excludeTexts.some((ex) =>
      typeof ex === 'string' ? text.toLowerCase().includes(ex.toLowerCase()) : ex.test(text)
    );
    if (!isExcluded && text.length > 0) {
      await opt.click();
      return text;
    }
  }
  throw new Error(`No selectable options found for label: ${labelText}`);
}

export async function assertLabeledSelectChecked(page: Page, labelText: string, optionText: string) {
  await openSelectByLabel(page, labelText);
  const selected = page.getByRole('option', { name: optionText, exact: true }).first();
  await expect(selected).toHaveAttribute('data-state', /checked/);
  await page.keyboard.press('Escape');
}

// Select the Nth available option (0-based) for a labeled Select
export async function selectNthOptionByLabel(page: Page, labelText: string, index: number) {
  await openSelectByLabel(page, labelText);
  const options = page.getByRole('option');
  await expect(options.first()).toBeVisible();
  const count = await options.count();
  if (count <= index) throw new Error(`Select ${labelText}: not enough options (${count}) to pick index ${index}`);
  await options.nth(index).click();
}
