export function SiteFooter() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto max-w-5xl px-4 py-8 text-sm text-muted-foreground">
        © {new Date().getFullYear()} handwork
      </div>
    </footer>
  );
}
