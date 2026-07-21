import { Bell, Search } from "lucide-react"
import FullscreenButton from "@/components/common/Fullscreen"
import { ModeToggle } from "@/components/common/Toggle"

export default function Header() {
  return (
    <header className="fixed top-0 right-0 left-64 z-40 flex h-20 items-center justify-between border-b border-border bg-card px-8 shadow-sm">

      {/* Left Side */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">
    Dashboard
</h1>
      </div>

      {/* Right Side */}
      <div className="flex items-center gap-4">

        {/* Search */}
        <div className="flex items-center rounded-lg border border-input bg-background px-4 py-2">

          <Search size={18} className="text-muted-foreground" />

          <input
            type="text"
            placeholder="Search..."
            className="ml-2 bg-transparent text-foreground outline-none placeholder:text-muted-foreground"
          />

        </div>
        <ModeToggle />
        {/* Fullscreen */}
        <FullscreenButton />

        {/* Notifications */}
        <button className="rounded-lg border border-input bg-background p-3 transition hover:bg-accent">
          <Bell size={20} />
        </button>

        {/* User */}
        <div className="text-right">
          <h3 className="font-semibold">
            Barbara Logah
          </h3>

          <p className="text-sm text-muted-foreground">
            Company Administrator
          </p>
        </div>

      </div>

    </header>
  );
}
