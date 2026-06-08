export default function BillingSuccessPage() {
  return (
    <div className="max-w-xl mx-auto glass-card p-8 text-center">
      <h1 className="text-2xl font-semibold">Subscription updated</h1>
      <p className="text-slate-400 mt-3">Your billing changes were applied successfully.</p>
      <a className="btn-primary inline-flex mt-6" href="/dashboard">Go to Dashboard</a>
    </div>
  );
}
