export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="auth-layout">
      {/* ---- Left: Brand Panel ---- */}
      <div className="auth-brand">
        <div className="auth-brand-content">
          <h1 className="auth-brand-logo">JobMatch</h1>
          <p className="auth-brand-tagline">
            Where talent meets opportunity — powered by AI that
            understands people, not just keywords.
          </p>
          <div className="auth-brand-decoration" />
          <p className="auth-brand-quote">
            &ldquo;The best way to predict the future is to create it.&rdquo;
          </p>
        </div>
      </div>

      {/* ---- Right: Form Panel ---- */}
      <div className="auth-form-panel">
        <div className="auth-form-container">
          {children}
        </div>
      </div>
    </div>
  );
}