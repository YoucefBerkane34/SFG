import { Wifi, WifiOff } from "lucide-react";

export default function NetworkStatus({ connected }) {
  return (
    <div className="flex items-center gap-2 text-xs">
      {connected ? (
        <>
          <Wifi className="w-3.5 h-3.5 text-emerald-400" />
          <span className="text-emerald-400">Live</span>
        </>
      ) : (
        <>
          <WifiOff className="w-3.5 h-3.5 text-red-400" />
          <span className="text-red-400">Disconnected</span>
        </>
      )}
    </div>
  );
}
