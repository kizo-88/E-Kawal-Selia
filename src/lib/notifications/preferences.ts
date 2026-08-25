/**
 * Channel-resolution logic for the notification bus — pure.
 *
 * GP-16 requires per-user AND per-role control. The rule we implement:
 *
 *   - A user may opt out at the user level. If the user preference is disabled,
 *     the channel is off regardless of roles.
 *   - If the user has not set a preference, the default is ON.
 *   - Role preferences narrow further: if any role preference rows exist and
 *     ALL of them are disabled, the channel is off. A single enabled role
 *     preference keeps it on.
 *
 * This is the whole decision, isolated so it can be tested without a database.
 * In-app is always mandatory and never passes through here.
 */

import type { NotificationChannel } from "./types";

export interface ChannelInput {
  channel: NotificationChannel;
  userEnabled?: boolean | null;
  roleEnabled: Array<boolean | null>;
}

export function channelEnabled(input: ChannelInput): boolean {
  const userOk = input.userEnabled ?? true;
  if (!userOk) return false;
  if (input.roleEnabled.length > 0) {
    return input.roleEnabled.some((e) => e !== false);
  }
  return true;
}
