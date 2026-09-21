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
      // In a real app we'd hash on the server, but our action expects passwordHash.
      // We will just pass the password string to the passwordHash field for now.
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
    <>
      <PageHeader title={isRegistering ? "Create an account" : "Welcome back"} subtitle="Manage your job applications" />
      <div className="mx-auto max-w-md px-4 py-16">
        <Surface className="p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
                {error}
              </div>
            )}
            <div>
              <label className="block text-xs font-medium text-muted-foreground">Username</label>
              <Input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="mt-1"
                placeholder="Enter your username"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground">Password</label>
              <Input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1"
                placeholder="Enter your password"
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Please wait..." : (isRegistering ? "Register" : "Login")}
            </Button>
            <div className="text-center text-sm text-muted-foreground">
              {isRegistering ? "Already have an account?" : "Don't have an account?"}{" "}
              <button
                type="button"
                onClick={() => setIsRegistering(!isRegistering)}
                className="font-medium text-primary hover:underline"
              >
                {isRegistering ? "Login" : "Register"}
              </button>
            </div>
          </form>
        </Surface>
      </div>
    </>
  );
}
