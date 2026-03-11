"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

export default function FollowingModal({
  open,
  onClose,
  users = [],
}: {
  open: boolean;
  onClose: () => void;
  users: any[];
}) {
  const getInitials = (name?: string) => {
    if (!name) return "";
    return name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent
        aria-describedby={undefined}
        className="bg-black text-white border-neutral-900"
      >
        <DialogHeader>
          <DialogTitle>Following</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 max-h-100 overflow-y-auto">
          {users.length === 0 ? (
            <p className="text-center text-neutral-400">No following yet</p>
          ) : (
            users.map((user: any) => (
              <div key={user.id} className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src={user.avatarUrl} className="object-cover" />
                  <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                </Avatar>

                <div>
                  <p className="font-semibold">{user.name}</p>
                  <p className="text-sm text-neutral-400">@{user.username}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
