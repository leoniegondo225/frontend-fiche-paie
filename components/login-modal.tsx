'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Mail, Lock } from 'lucide-react'

interface LoginModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}



export function LoginModal({ open, onOpenChange }: LoginModalProps) {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

 const handleLogin = async (e: React.FormEvent) => {
  e.preventDefault();
  setError('');
  setIsLoading(true);

  if (!email || !password) {
    setError("Veuillez remplir tous les champs");
    setIsLoading(false);
    return;
  }

  try {
  

    const req = await fetch("http://localhost:3600/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const res = await req.json();

    if (res.message === "ok") {
      console.log("Res :", res);

      // Stocker l'utilisateur connecté
      localStorage.setItem("token", res.accessToken);
    
      localStorage.setItem("isAuthenticated", "true");

      router.push('/dashboard');
      onOpenChange(false);
    } else {
      setError("Email ou mot de passe incorrect");
    }

  } catch (error) {
    console.log(error);
    setError("Une erreur est survenue lors de la connexion");
  } finally {
    setIsLoading(false);
  }
};


  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl">Connexion</DialogTitle>
          <DialogDescription>
            Connectez-vous pour accéder à l{"'"}application
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleLogin} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="admin@payslippro.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Mot de passe</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10"
                required
              />
            </div>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* <div className="bg-muted/50 border border-border rounded-lg p-3 text-sm">
            <p className="font-medium text-foreground mb-1">Identifiants de test :</p>
            <p className="text-muted-foreground">Email : admin@payslippro.com</p>
            <p className="text-muted-foreground">Mot de passe : admin123</p>
          </div> */}

          <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
            {isLoading ? 'Connexion en cours...' : 'Se connecter'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
