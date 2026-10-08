import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  fetchUnreadNotificationCount,
  fetchMessageThreads,
} from "@/lib/board-api";
import { useRealtimeEvent } from "@/lib/realtime-api";
import {
  navBadges as mockBadges,
  type NavBadgeCounts,
} from "@/data/boardMockData";

// Live sidebar/header badge counts. Only "notifications" and
// "messages" are backed by the real, functional features built this
// round — the others (boardPacks, resolutions, eSigning) stay on
// their existing mock values, since those features weren't part of
// this request. A 45–60s poll is the fallback; the realtime socket
// (see src/lib/realtime.ts) invalidates both queries the moment a
// notification or message actually arrives, so badges update live
// without waiting on the poll.
export function useBoardBadges(): NavBadgeCounts {
  const queryClient = useQueryClient();

  const { data: unread } = useQuery({
    queryKey: ["board-unread-count"],
    queryFn: fetchUnreadNotificationCount,
    refetchInterval: 60_000,
  });

  const { data: threads } = useQuery({
    queryKey: ["board-message-threads"],
    queryFn: fetchMessageThreads,
    refetchInterval: 60_000,
  });

  useRealtimeEvent("notification:new", () => {
    queryClient.invalidateQueries({ queryKey: ["board-unread-count"] });
  });
  useRealtimeEvent("message:new", () => {
    queryClient.invalidateQueries({ queryKey: ["board-message-threads"] });
  });

  const unreadMessages = (threads ?? []).reduce(
    (sum, t) => sum + t.unreadCount,
    0,
  );

  return {
    ...mockBadges,
    notifications: unread?.count ?? 0,
    messages: unreadMessages,
  };
}
