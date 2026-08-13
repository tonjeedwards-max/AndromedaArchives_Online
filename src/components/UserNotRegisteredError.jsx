export default function UserNotRegisteredError() {
  return (
    <div className="fixed inset-0 flex items-center justify-center p-6">
      <div className="max-w-md text-center">
        <h1 className="text-2xl font-semibold">Account not registered</h1>
        <p className="mt-3 text-muted-foreground">
          This account is not registered for Andromeda Archives. Please contact an administrator for access.
        </p>
      </div>
    </div>
  );
}
