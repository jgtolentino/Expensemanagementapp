import { useState } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Alert, AlertDescription } from "../components/ui/alert";
import { User } from "../types";
import { api } from "../lib/api";

interface LoginScreenProps {
  onLogin: (user: User) => void;
}

export function LoginScreen({ onLogin }: LoginScreenProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const user = await api.login(email, password);
      onLogin(user);
    } catch (err: any) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const quickLogin = async (role: "AM" | "FD") => {
    const credentials = role === "AM"
      ? { email: "am@example.com", password: "am123" }
      : { email: "fd@example.com", password: "admin123" };
    
    setEmail(credentials.email);
    setPassword(credentials.password);
    
    setError("");
    setLoading(true);
    
    try {
      const user = await api.login(credentials.email, credentials.password);
      onLogin(user);
    } catch (err: any) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4"
      style={{ backgroundColor: "#F2F7F2" }}
    >
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl" style={{ color: "#386641" }}>
            Rate Card Pro
          </CardTitle>
          <CardDescription>
            Mobile-first quote management system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={loading}
              style={{ backgroundColor: "#386641" }}
            >
              {loading ? "Logging in..." : "Sign In"}
            </Button>
          </form>

          <div className="mt-6">
            <p className="text-sm text-center text-muted-foreground mb-3">
              Quick demo login:
            </p>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                onClick={() => quickLogin("AM")}
                disabled={loading}
                className="text-sm"
              >
                Login as AM
              </Button>
              <Button
                variant="outline"
                onClick={() => quickLogin("FD")}
                disabled={loading}
                className="text-sm"
                style={{ borderColor: "#D4AC0D", color: "#D4AC0D" }}
              >
                Login as FD
              </Button>
            </div>
            <p className="text-xs text-center text-muted-foreground mt-2">
              AM: Account Manager | FD: Finance Director
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
