'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { LoginModal } from '@/components/login-modal'
import { FileText, Lock, Mail, CheckCircle, Sparkles } from 'lucide-react'

export default function HomePage() {
  const [isLoginOpen, setIsLoginOpen] = useState(false)

  return (
    <div className="min-h-screen gradient-bg">
      <header className="border-b border-border/50 glass-effect animate-slide-up">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center shadow-lg animate-float">
              <FileText className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-2xl bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                PaieDigit              </h1>
              <p className="text-xs text-muted-foreground">Gestion des fiches de paie</p>
            </div>
          </div>
          <Button
            onClick={() => setIsLoginOpen(true)}
            size="lg"
            className="gradient-accent text-white hover:opacity-90 transition-all hover:scale-105 shadow-lg"
          >

            Se connecter
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="space-y-4 animate-slide-up">
            <h2 className="text-6xl font-bold text-balance">
              <span className="bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
                Dématérialisation
              </span>
              <br />
              <span className="text-foreground">des fiches de paie</span>
            </h2>
            <p className="text-xl text-muted-foreground text-balance max-w-2xl mx-auto leading-relaxed">
              Simplifiez la distribution de vos fiches de paie avec notre solution automatisée et sécurisée
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mt-16">
            <div className="group bg-white border-2 border-primary/20 rounded-2xl p-8 space-y-4 hover:shadow-2xl hover:border-primary/50 transition-all duration-300 hover:-translate-y-2 animate-scale-in">
              <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center mx-auto group-hover:scale-110 transition-transform shadow-lg">
                <FileText className="w-8 h-8 text-white" />
              </div>
              <h3 className="font-bold text-xl text-primary">Découpage PDF</h3>
              <p className="text-muted-foreground leading-relaxed">
                Découpez automatiquement vos fichiers PDF en fiches individuelles par matricule
              </p>
              <div className="pt-2">
                <div className="h-1 w-0 group-hover:w-full bg-gradient-to-r from-primary to-accent transition-all duration-500 rounded-full" />
              </div>
            </div>

            <div className="group bg-white border-2 border-accent/20 rounded-2xl p-8 space-y-4 hover:shadow-2xl hover:border-accent/50 transition-all duration-300 hover:-translate-y-2 animate-scale-in" style={{ animationDelay: '0.1s' }}>
              <div className="w-16 h-16 rounded-2xl gradient-accent flex items-center justify-center mx-auto group-hover:scale-110 transition-transform shadow-lg">
                <Lock className="w-8 h-8 text-white" />
              </div>
              <h3 className="font-bold text-xl text-accent">Protection sécurisée</h3>
              <p className="text-muted-foreground leading-relaxed">
                Ajoutez un mot de passe automatique basé sur le matricule de chaque employé
              </p>
              <div className="pt-2">
                <div className="h-1 w-0 group-hover:w-full bg-gradient-to-r from-accent to-secondary transition-all duration-500 rounded-full" />
              </div>
            </div>

            <div className="group bg-white border-2 border-secondary/20 rounded-2xl p-8 space-y-4 hover:shadow-2xl hover:border-secondary/50 transition-all duration-300 hover:-translate-y-2 animate-scale-in" style={{ animationDelay: '0.2s' }}>
              <div className="w-16 h-16 rounded-2xl gradient-secondary flex items-center justify-center mx-auto group-hover:scale-110 transition-transform shadow-lg">
                <Mail className="w-8 h-8 text-white" />
              </div>
              <h3 className="font-bold text-xl text-secondary">Envoi par email</h3>
              <p className="text-muted-foreground leading-relaxed">
                Envoyez les fiches de manière individuelle ou groupée avec planification possible
              </p>
              <div className="pt-2">
                <div className="h-1 w-0 group-hover:w-full gradient-secondary transition-all duration-500 rounded-full" />
              </div>
            </div>
          </div>

          <div className="relative bg-white border-2 border-primary/20 rounded-3xl p-10 mt-16 space-y-6 overflow-hidden animate-scale-in" style={{ animationDelay: '0.3s' }}>
            <div className="absolute top-0 right-0 w-64 h-64 gradient-accent opacity-10 rounded-full blur-3xl animate-pulse-slow" />
            <div className="absolute bottom-0 left-0 w-64 h-64 gradient-secondary opacity-10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1.5s' }} />

            <div className="relative z-10">
              <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center mx-auto mb-4 animate-float shadow-lg">
                <CheckCircle className="w-9 h-9 text-white" />
              </div>
              <h3 className="font-bold text-2xl bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Prêt à commencer ?
              </h3>
              <p className="text-muted-foreground leading-relaxed max-w-xl mx-auto">
                Connectez-vous pour accéder à l{"'"}application et simplifier la gestion de vos fiches de paie
              </p>
              <Button
                size="lg"
                onClick={() => setIsLoginOpen(true)}
                className="mt-6 gradient-accent text-white hover:opacity-90 transition-all hover:scale-110 shadow-xl text-lg px-8 py-6"
              >

                Accéder à l{"'"}application
              </Button>
            </div>
          </div>
        </div>
      </main>

      <LoginModal open={isLoginOpen} onOpenChange={setIsLoginOpen} />
    </div>
  )
}
