import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getUser: vi.fn(),
  revalidatePath: vi.fn(),
  getUserTimezone: vi.fn(),
  getUserDateRanges: vi.fn(),
  prisma: {
    notification: { count: vi.fn(), update: vi.fn(), updateMany: vi.fn(), delete: vi.fn(), findMany: vi.fn(), findFirst: vi.fn(), create: vi.fn() },
    user: { findUnique: vi.fn(), update: vi.fn() },
    todo: { findMany: vi.fn() },
    menstrualReminder: { findMany: vi.fn() },
    menstrualProfile: { findUnique: vi.fn() },
    menstrualCycle: { findMany: vi.fn() },
    menstrualDailyLog: { findUnique: vi.fn() },
  },
}));

vi.mock("@/lib/prisma", () => ({ prisma: mocks.prisma }));
vi.mock("@/lib/server/get-user", () => ({ getUser: mocks.getUser }));
vi.mock("@/lib/server/date-utils", () => ({ getUserTimezone: mocks.getUserTimezone, getUserDateRanges: mocks.getUserDateRanges }));
vi.mock("next/cache", () => ({ revalidatePath: mocks.revalidatePath }));

import { getUnreadNotificationCount, markAllAsRead, markAsRead, registerFCMToken } from "./notification-actions";

const user = { id: "65e000000000000000000099", timezone: "Asia/Calcutta" };
const notificationId = "65e000000000000000000001";

describe("notification server actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    mocks.getUser.mockResolvedValue(user);
  });

  it("counts unread notifications only for the current user", async () => {
    mocks.prisma.notification.count.mockResolvedValue(4);

    await expect(getUnreadNotificationCount()).resolves.toBe(4);
    expect(mocks.prisma.notification.count).toHaveBeenCalledWith({ where: { userId: user.id, read: false } });
  });

  it("marks only the current user's unread notifications as read", async () => {
    mocks.prisma.notification.updateMany.mockResolvedValue({ count: 3 });

    await expect(markAllAsRead()).resolves.toEqual({ success: true });
    expect(mocks.prisma.notification.updateMany).toHaveBeenCalledWith({
      where: { userId: user.id, read: false },
      data: { read: true },
    });
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/", "layout");
  });

  it("updates a single notification with both notification and owner ids", async () => {
    mocks.prisma.notification.update.mockResolvedValue({ id: notificationId });

    await expect(markAsRead(notificationId)).resolves.toEqual({ success: true });
    expect(mocks.prisma.notification.update).toHaveBeenCalledWith({
      where: { id: notificationId, userId: user.id },
      data: { read: true },
    });
  });

  it("does not add an FCM token already stored for the user", async () => {
    mocks.prisma.user.findUnique.mockResolvedValue({ fcmTokens: ["known-token"] });

    await expect(registerFCMToken("known-token")).resolves.toEqual({ success: true });
    expect(mocks.prisma.user.update).not.toHaveBeenCalled();
  });

  it("adds a new FCM token to the authenticated user's tokens", async () => {
    mocks.prisma.user.findUnique.mockResolvedValue({ fcmTokens: [] });
    mocks.prisma.user.update.mockResolvedValue({ id: user.id });

    await expect(registerFCMToken("new-token")).resolves.toEqual({ success: true });
    expect(mocks.prisma.user.update).toHaveBeenCalledWith({
      where: { id: user.id },
      data: { fcmTokens: { push: "new-token" } },
    });
  });
});
