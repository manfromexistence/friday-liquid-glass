"use client";

import { lt } from "@/lib/utils";

export function LtDemo() {
  return (
    <div className="space-y-4 p-4 border rounded-lg">
      <h3 className="font-semibold">lt() Function Demo</h3>
      <div className="space-y-2 text-sm">
        <div>
          <code className="bg-muted px-2 py-1 rounded">lt("friday.title")</code>
          <p className="mt-1">→ {lt("friday.title", "Friday Title")}</p>
        </div>
        <div>
          <code className="bg-muted px-2 py-1 rounded">lt("navigation.home")</code>
          <p className="mt-1">→ {lt("navigation.home", "Home")}</p>
        </div>
        <div>
          <code className="bg-muted px-2 py-1 rounded">lt("missing.key", "Fallback")</code>
          <p className="mt-1">→ {lt("missing.key", "Fallback Text")}</p>
        </div>
      </div>
    </div>
  );
}
