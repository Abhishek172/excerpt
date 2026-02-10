export default function Footer() {
  return (
    <footer className="border-t border-neutral-800 bg-neutral-950 text-neutral-500">
      <div className="mx-auto max-w-6xl px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
        <span>© {new Date().getFullYear()} Excerpt</span>

        <div className="flex gap-4">
          <a
            href="/privacy"
            className="hover:text-neutral-300 transition"
          >
            Privacy
          </a>
          <a
            href="/data-retention"
            className="hover:text-neutral-300 transition"
          >
            Data Retention
          </a>
          <a
            href="mailto:support@excerpt.ai"
            className="hover:text-neutral-300 transition"
          >
            Contact
          </a>
          <a
            href="/terms"
            className="hover:text-neutral-300 transition"
          >
            Terms
          </a>
        </div>
      </div>
    </footer>
  );
}
