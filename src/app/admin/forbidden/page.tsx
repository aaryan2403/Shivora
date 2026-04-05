export default function AdminForbiddenPage() {
  return (
    <main className="min-h-screen bg-obsidian text-creme selection:bg-ash selection:text-obsidian flex items-center justify-center px-6">
      <div className="w-full max-w-xl bg-primary/30 border border-primary/20 backdrop-blur-md p-10 rounded-sm shadow-2xl text-center">
        <h1 className="font-serif text-4xl mb-4">Access denied</h1>
        <p className="text-ash">Your account is not authorized to access the admin area.</p>
      </div>
    </main>
  );
}
