import { expect, test } from "@playwright/test";

test("reviewer smoke flow on deployed app", async ({ page }) => {
  await page.goto("/", { waitUntil: "domcontentloaded" });

  await expect(
    page.getByRole("heading", { level: 1, name: "Assets" }),
  ).toBeVisible();

  const threatFilterButton = page.getByRole("button", { name: "With threats" });
  await threatFilterButton.click();

  await expect.poll(() => new URL(page.url()).searchParams.get("threat")).toBe(
    "1",
  );

  const assetDetailLinks = page.getByRole("link", {
    name: /View details for/i,
  });
  await expect(assetDetailLinks.first()).toBeVisible();
  await assetDetailLinks.first().click();

  await expect(page).toHaveURL(/\/assets\/[^/?#]+/);
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

  const vulnerabilitiesTab = page.getByRole("tab", { name: /Vulnerabilities/i });
  await vulnerabilitiesTab.click();
  await expect.poll(() => new URL(page.url()).searchParams.get("tab")).toBe(
    "vulnerabilities",
  );

  const vulnerabilitiesPanel = page.getByRole("tabpanel", {
    name: /Vulnerabilities/i,
  });
  await vulnerabilitiesPanel.getByRole("button", { name: "HIGH" }).click();
  await expect.poll(() => new URL(page.url()).searchParams.get("severity")).toBe(
    "high",
  );

  const threatsTab = page.getByRole("tab", { name: /Threats/i });
  await threatsTab.click();
  await expect.poll(() => new URL(page.url()).searchParams.get("tab")).toBe(
    "threats",
  );

  const threatsPanel = page.getByRole("tabpanel", { name: /Threats/i });
  await threatsPanel.getByRole("button", { name: "HIGH" }).click();
  await expect.poll(() => new URL(page.url()).searchParams.get("riskLevel")).toBe(
    "high",
  );
});
