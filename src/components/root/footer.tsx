// components/ui/footer.tsx

import React from "react";

export default function Footer() {
  return (
    <footer className="w-full mt-auto border-t bg-muted py-4 text-sm text-muted-foreground">
      <div className="container flex flex-col items-center justify-between gap-2 sm:flex-row">
        <p>© {new Date().getFullYear()} <strong>Samarth Enterprise</strong>. All rights reserved.</p>
      
      </div>
    </footer>
  );
}

