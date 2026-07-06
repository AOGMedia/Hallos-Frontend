"use client"

export default function ObsInstructions() {
  return (
    <div className="rounded-xl border border-border/10 p-4 flex flex-col gap-2">
      <div className="text-base font-semibold text-text-primary">How to Go Live with OBS</div>
      <ol className="list-decimal list-inside text-sm text-text-primary/90 flex flex-col gap-1">
        <li>Open OBS manually</li>
        <li>Go to Settings → Stream</li>
        <li>Paste RTMP Server URL</li>
        <li>Paste Stream Key</li>
        <li>Click Start Streaming</li>
      </ol>
    </div>
  )
}