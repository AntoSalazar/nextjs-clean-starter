'use client';

import { UserMenu } from './UserMenu';

interface User {
  id: string;
  email: string;
  fullName: string | null;
  role: string;
}

interface HeaderProps {
  user: User;
}

export function Header({ user }: HeaderProps) {
  return (
    <header className="flex h-14 items-center justify-between border-b bg-card px-6">
      <div className="flex items-center gap-4">
        <h1 className="text-lg font-semibold">Dashboard</h1>
      </div>
      <UserMenu user={user} />
    </header>
  );
}
