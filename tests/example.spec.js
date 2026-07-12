// @ts-check
const { test, expect } = require('@playwright/test');
const path = require('path');
const { pathToFileURL } = require('url');

const workspaceRoot = path.resolve(__dirname, '..');
const frontendRoot = path.join(workspaceRoot, 'frontend');

const indexUrl = pathToFileURL(path.join(frontendRoot, 'index.html')).href;
const timeSelectionUrl = pathToFileURL(path.join(frontendRoot, 'time-selection.html')).href;
const pricingUrl = pathToFileURL(path.join(frontendRoot, 'pricing.html')).href;

const topic = 'Productivity Basics';

const mockSupabaseModule = `
const mockUser = { id: 'test-user', email: 'tester@example.com' };

function readPlan() {
  try {
    return globalThis.localStorage.getItem('lockedin_active_plan') || 'free';
  } catch (_error) {
    return 'free';
  }
}

function writePlan(plan) {
  try {
    globalThis.localStorage.setItem('lockedin_active_plan', String(plan || 'free'));
  } catch (_error) {
    // ignore
  }
}

function usersTableClient() {
  return {
    select() {
      return {
        eq() {
          return {
            async maybeSingle() {
              return {
                data: {
                  id: mockUser.id,
                  email: mockUser.email,
                  plan: readPlan(),
                },
                error: null,
              };
            },
          };
        },
      };
    },
    update(values) {
      return {
        async eq() {
          if (values && values.plan) {
            writePlan(values.plan);
          }
          return { data: null, error: null };
        },
      };
    },
    insert() {
      return Promise.resolve({ data: [], error: null });
    },
  };
}

export function createClient() {
  const session = { user: mockUser };

  return {
    auth: {
      getSession: async () => ({ data: { session }, error: null }),
      getUser: async () => ({ data: { user: mockUser }, error: null }),
      signUp: async () => ({ data: { user: mockUser }, error: null }),
      signInWithPassword: async () => ({ data: { user: mockUser }, error: null }),
      signOut: async () => ({ error: null }),
      updateUser: async () => ({ data: { user: mockUser }, error: null }),
      onAuthStateChange(callback) {
        queueMicrotask(() => callback('SIGNED_IN', session));
        return { data: { subscription: { unsubscribe() {} } } };
      },
    },
    from(table) {
      if (table === 'users') {
        return usersTableClient();
      }

      return usersTableClient();
    },
  };
}

export default { createClient };
`;

const mockRazorpayScript = `
window.Razorpay = class MockRazorpay {
  constructor(options) {
    this.options = options;
  }

  on() {}

  open() {
    setTimeout(() => {
      if (typeof this.options.handler === 'function') {
        this.options.handler({
          razorpay_payment_id: 'pay_test_123',
          razorpay_order_id: this.options.order_id || 'order_test_123',
          razorpay_signature: 'sig_test_123',
        });
      }
    }, 0);
  }
};
`;

const mockJspdfScript = `
window.jspdf = {
  jsPDF: class MockJsPDF {
    constructor() {
      this.internal = {
        pageSize: {
          getWidth: () => 595.28,
          getHeight: () => 841.89,
        },
      };
    }

    setFont() {}
    setFontSize() {}
    splitTextToSize(text) {
      return String(text).split('\n');
    }
    text() {}
    addPage() {}
    save(filename) {
      window.__savedPdfName = filename;
    }
  },
};
`;

async function installMocks(page) {
  await page.addInitScript(() => {
    try {
      window.currentUser = { id: 'test-user', email: 'tester@example.com' };
      if (!window.localStorage.getItem('lockedin_active_plan')) {
        window.localStorage.setItem('lockedin_active_plan', 'free');
      }
    } catch (_error) {
      // ignore
    }
  });

  await page.route('https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/javascript',
      body: mockSupabaseModule,
    });
  });

  await page.route('https://checkout.razorpay.com/v1/checkout.js', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/javascript',
      body: mockRazorpayScript,
    });
  });

  await page.route('https://cdn.jsdelivr.net/npm/jspdf@2.5.1/dist/jspdf.umd.min.js', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/javascript',
      body: mockJspdfScript,
    });
  });

  const json = (route, body) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(body),
    });
  };

  await page.route('**/sync-user', async (route) => {
    json(route, { success: true });
  });

  await page.route('**/create-order', async (route) => {
    json(route, {
      order_id: 'order_test_123',
      amount: 59900,
      currency: 'INR',
    });
  });

  await page.route('**/verify-payment', async (route) => {
    json(route, {
      verified: true,
      success: true,
      updated_plan: 'elite',
      elapsed_ms: 12,
    });
  });

  await page.route('**/generate', async (route) => {
    json(route, {
      content: `# Session Notes\n\n## Core Strategy\n- Focus on one task at a time.\n- Build momentum with short wins.\n\n## Practice Drill\n- Summarize the idea in one sentence.\n- Write one action item for today.`,
    });
  });

  await page.route('**/generate-knowledge-pack', async (route) => {
    json(route, {
      notes: `# Productivity Basics\n\n## Key Takeaways\n- Reduce task switching.\n- Keep the next action visible.\n- Review the session before starting again.\n`,
    });
  });
}

test('Curious Horizons flow upgrades to Elite, unlocks premium personas, and downloads notes', async ({ page }) => {
  test.setTimeout(120000);

  await installMocks(page);

  page.on('dialog', async (dialog) => {
    await dialog.accept();
  });

  await page.goto(indexUrl);
  await expect(page.locator('#topicInput')).toBeVisible();

  await page.locator('#topicInput').fill(topic);
  await page.locator('#goBtn').click();
  await expect(page).toHaveURL(/time-selection\.html/);

  const premiumPersona = page.getByRole('radio', { name: /technical deep dive/i });
  await expect(premiumPersona).toHaveClass(/is-locked/);
  await expect(premiumPersona.locator('.lock-icon')).toBeVisible();

  await page.goto(pricingUrl);
  await expect(page.getByRole('button', { name: /upgrade to elite/i })).toBeVisible();
  await page.getByRole('button', { name: /upgrade to elite/i }).click();

  await expect(page).toHaveURL(/index\.html/);

  await page.locator('#topicInput').fill(topic);
  await page.locator('#goBtn').click();
  await expect(page).toHaveURL(/time-selection\.html/);

  await expect(page.getByRole('radio', { name: /technical deep dive/i })).not.toHaveClass(/is-locked/);
  await expect(page.getByRole('radio', { name: /technical deep dive/i }).locator('.lock-icon')).toHaveClass(/hidden/);
  await expect(page.locator('#timeValue')).toHaveText('60');

  await page.getByRole('button', { name: /start session/i }).click();
  await expect(page).toHaveURL(/session\.html/);

  await expect(page.getByRole('heading', { name: /core strategy/i })).toBeVisible();
  await expect(page.locator('#topicDisplay')).toHaveText(topic);

  await page.getByRole('button', { name: /exit/i }).click();
  await expect(page.getByRole('heading', { name: /session complete/i })).toBeVisible();

  await page.getByRole('button', { name: /generate notes/i }).click();
  await expect(page).toHaveURL(/knowledge-pack\.html/);
  await expect(page.getByRole('button', { name: /^download$/i })).toBeVisible();

  await page.getByRole('radio', { name: /markdown/i }).click();

  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: /^download$/i }).click();
  const download = await downloadPromise;

  expect(download.suggestedFilename()).toMatch(/-notes\.md$/);
});
