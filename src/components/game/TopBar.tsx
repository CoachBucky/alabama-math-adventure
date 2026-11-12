import { Link } from "@tanstack/react-router";
import { Map as MapIcon, Trophy, Volume2, VolumeX } from "lucide-react";
import fox from "@/assets/fox-mascot.png";
import { updateProfile, useProfile } from "@/lib/game/progress";

export function TopBar() {
  const profile = useProfile();
  const totalStars = Object.values(profile.levels).reduce((s, l) => s + l.stars, 0);
  return (
    <header className="sticky top-0 z-30 border-b-2 border-border bg-background/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-3 px-4">
        <Link to="/" className="flex items-center gap-2">
          <img src={fox} alt="" width={40} height={40} className="size-10" />
          <span className="font-display text-xl font-bold tracking-tight">
            Math <span className="text-primary">Quest</span>
          </span>
        </Link>
        <nav className="ml-2 hidden items-center gap-1 sm:flex">
          {profile.grade && (
            <Link
              to="/map/$grade"
              params={{ grade: String(profile.grade) }}
              className="flex items-center gap-1.5 rounded-full px-3 py-1.5 font-display font-semibold text-muted-foreground hover:bg-muted"
              activeProps={{ className: "bg-teal-soft text-secondary-deep" }}
            >
              <MapIcon className="size-4" /> Map
            </Link>
          )}
          <Link
            to="/progress"
            className="flex items-center gap-1.5 rounded-full px-3 py-1.5 font-display font-semibold text-muted-foreground hover:bg-muted"
            activeProps={{ className: "bg-teal-soft text-secondary-deep" }}
          >
            <Trophy className="size-4" /> Trophies
          </Link>
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <span className="flex items-center gap-1.5 rounded-full bg-sunny-soft px-3 py-1.5 font-display font-bold text-sunny-foreground" title="Stars">
            ⭐ {totalStars}
          </span>
          <span className="flex items-center gap-1.5 rounded-full bg-sunny-soft px-3 py-1.5 font-display font-bold text-sunny-foreground" title="Coins">
            🪙 {profile.coins}
          </span>
          <button
            type="button"
            aria-label={profile.settings.sound ? "Turn sound off" : "Turn sound on"}
            onClick={() => updateProfile((p) => ({ ...p, settings: { ...p.settings, sound: !p.settings.sound } }))}
            className="flex size-10 items-center justify-center rounded-full text-muted-foreground hover:bg-muted"
          >
            {profile.settings.sound ? <Volume2 className="size-5" /> : <VolumeX className="size-5" />}
          </button>
          <Link to="/progress" className="flex size-10 items-center justify-center rounded-full text-muted-foreground hover:bg-muted sm:hidden" aria-label="Trophies">
            <Trophy className="size-5" />
          </Link>
        </div>
      </div>
    </header>
  );
}
