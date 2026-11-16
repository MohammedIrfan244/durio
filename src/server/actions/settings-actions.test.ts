import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getUserId: vi.fn(),
  revalidatePath: vi.fn(),
  prisma: { user: { findUnique: vi.fn(), update: vi.fn() } },
}));

vi.mock("@/lib/prisma", () => ({ prisma: mocks.prisma }));
vi.mock("@/lib/server/get-user", () => ({ getUserId: mocks.getUserId }));
vi.mock("next/cache", () => ({ revalidatePath: mocks.revalidatePath }));

import { getUserSettings, updateUserSettings } from "./settings-actions";

const userId = "65e000000000000000000099";

describe("settings server actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    mocks.getUserId.mockResolvedValue(userId);
  });

  it("returns safe defaults when no authenticated user's settings exist", async () => {
    mocks.prisma.user.findUnique.mockResolvedValue(null);

    await expect(getUserSettings()).resolves.toEqual({ fancyMode: true, disabledModules: [] });
  });

  it("updates only supplied settings for the authenticated user", async () => {
    const settings = { fancyMode: false, disabledModules: ["calendar"] };
    mocks.prisma.user.update.mockResolvedValue(settings);

    await expect(updateUserSettings(settings)).resolves.toEqual({ success: true, settings });
    expect(mocks.prisma.user.update).toHaveBeenCalledWith({
      where: { id: userId },
      data: settings,
      select: { fancyMode: true, disabledModules: true },
    });
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/", "layout");
  });

  it("does not write settings when the request is unauthenticated", async () => {
    mocks.getUserId.mockResolvedValue(null);

    await expect(updateUserSettings({ fancyMode: false })).resolves.toEqual({ success: false, error: "Failed to update settings" });
    expect(mocks.prisma.user.update).not.toHaveBeenCalled();
  });
});
