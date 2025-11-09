import SocialLinks from './SocialLinks';

export default function Footer() {
  return (
    <footer className="border-t py-12">
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <span className="text-sm font-bold">MH</span>
            </div>
            <span className="font-semibold">Menal Hub</span>
          </div>
          <SocialLinks />
          <p className="text-sm text-muted-foreground">© {new Date().getFullYear()} Menal Hub. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
