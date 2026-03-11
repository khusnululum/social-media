"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

export default function FollowersModal({ open, onClose, users }: any) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent
        aria-describedby={undefined}
        className="bg-black text-white border-neutral-900"
      >
        <DialogHeader>
          <DialogTitle>Followers</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {users.map((user: any) => (
            <div key={user.id} className="flex items-center gap-3">
              <Avatar>
                <AvatarImage src={user.avatarUrl} className="object-cover" />
                <AvatarFallback>{user.name?.charAt(0)}</AvatarFallback>
              </Avatar>

              <div>
                <p className="font-semibold">{user.name}</p>
                <p className="text-sm text-neutral-400">@{user.username}</p>
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
