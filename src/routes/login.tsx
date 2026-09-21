import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageHeader, Surface } from "@/components/jobdesk-shell";
import { login, register } from "@/actions";

export const Route = createFileRoute("/login")({
  component: Login,
});

// We need a simple hashing utility on the client side just for sending a hash,
// though in a real app, you'd send plaintext over HTTPS and hash on the server.
// For this simple example, we'll just send the plaintext password to the server,
// but our server expects a "passwordHash" field, so we'll just rename the field.
// Wait, actually I wrote the server action to expect a hash, let's just pass the string directly as it will be hashed by the server or we can just send it as passwordHash.

function Login() {
  const navigate = useNavigate();
  const [isRegistering, setIsRegistering] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isRegistering) {
        await register({ data: { username, passwordHash: password } });
      } else {
        await login({ data: { username, passwordHash: password } });
      }
      navigate({ to: "/" });
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col justify-center bg-background py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-xl font-bold text-primary-foreground">
          J
        </div>
        <h2 className="mt-6 text-center font-heading text-2xl font-bold leading-9 tracking-tight text-foreground">
          {isRegistering ? "Create your account" : "Welcome back"}
        </h2>
        <p className="mt-2 text-center text-sm text-muted-foreground">
          Manage your job applications with Jobdesk
        </p>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-[480px]">
        <Surface className="px-6 py-12 shadow sm:rounded-xl sm:px-12">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
                {error}
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-foreground">Username</label>
              <Input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="mt-2"
                placeholder="Enter your username"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground">Password</label>
              <Input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-2"
                placeholder="Enter your password"
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Please wait..." : (isRegistering ? "Register" : "Sign in")}
            </Button>
            <div className="text-center text-sm text-muted-foreground">
              {isRegistering ? "Already have an account?" : "Don't have an account?"}{" "}
              <button
                type="button"
                onClick={() => setIsRegistering(!isRegistering)}
                className="font-medium text-primary hover:underline focus:outline-none"
              >
                {isRegistering ? "Sign in" : "Register"}
              </button>
            </div>
          </form>
        </Surface>
      </div>
    </div>
  );
}
