import { cn } from "@/lib/utils";
import type { ProductId } from "@/lib/config/products";
import type { Notification, User } from "@/types/user";
import { GlobalSearch } from "./global-search";
import { NotificationCenter } from "./notification-center";
import { ProductSwitcher } from "./product-switcher";
import { UserMenu } from "./user-menu";

/** Shared header shell: left slot (logo/breadcrumbs), centre slot (nav), standard actions on the right. */
export function AppHeader({
  product,
  user,
  notifications,
  left,
  center,
  settingsHref,
  className,
}: {
  product: ProductId;
  user: User | null;
  notifications: Notification[];
  left: React.ReactNode;
  center?: React.ReactNode;
  settingsHref?: string;
  className?: string;
}) {
  return (
    <header className={cn("sticky top-0 z-40 border-b bg-background/85 backdrop-blur supports-backdrop-filter:bg-background/70 no-print", className)}>
      <div className="flex h-16 items-center gap-3 px-4 sm:px-6">
        <div className="flex min-w-0 items-center gap-3">{left}</div>
        <div className="flex flex-1 justify-center">{center}</div>
        <div className="flex items-center gap-1">
          <GlobalSearch />
          {user && <NotificationCenter notifications={notifications} />}
          <ProductSwitcher current={product} />
          <UserMenu user={user} settingsHref={settingsHref} />
        </div>
      </div>
    </header>
  );
}
