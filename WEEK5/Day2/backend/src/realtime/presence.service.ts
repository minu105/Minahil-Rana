import { Injectable } from '@nestjs/common';

@Injectable()
export class PresenceService {
  private userSockets = new Map<string, Set<string>>();
  add(userId: string, socketId: string) {
    if (!this.userSockets.has(userId)) this.userSockets.set(userId, new Set());
    this.userSockets.get(userId)!.add(socketId);
  }
  remove(userId: string, socketId: string) {
    const set = this.userSockets.get(userId);
    if (!set) return;
    set.delete(socketId);
    if (set.size === 0) this.userSockets.delete(userId);
  }
  getUserSockets(userId: string) { return this.userSockets.get(userId); }
}
