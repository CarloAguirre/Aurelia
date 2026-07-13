import type { MarkAllNotificationsReadResponse, NotificationResponse } from '@aurelia/contracts';
import { httpGet, httpPatch } from './http-client';

export function getNotifications(unreadOnly = false): Promise<NotificationResponse[]> {
  const query = unreadOnly ? '?unreadOnly=true' : '';
  return httpGet<NotificationResponse[]>(`/notifications${query}`);
}

export function markNotificationRead(notificationId: string): Promise<NotificationResponse> {
  return httpPatch<null, NotificationResponse>(`/notifications/${encodeURIComponent(notificationId)}/read`, null);
}

export function dismissInspectionNotificationThread(notificationId: string): Promise<MarkAllNotificationsReadResponse> {
  return httpPatch<null, MarkAllNotificationsReadResponse>(`/notifications/${encodeURIComponent(notificationId)}/inspection-thread/dismiss`, null);
}
