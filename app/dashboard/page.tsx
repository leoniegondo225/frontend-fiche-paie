'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { FileText, Lock, Mail, LogOut, User, Sparkles } from 'lucide-react'
import { PdfSplitter } from '@/components/pdf-splitter'
import { PasswordProtector } from '@/components/password-protector'
import { EmailSender } from '@/components/email-sender'

export default function DashboardPage() {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  

  useEffect(() => {
    const auth = localStorage.getItem('isAuthenticated')
    if (auth !== 'true') {
      router.push('/')
    } else {
      setIsAuthenticated(true)
    }
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated')
    router.push('/')
  }

  if (!isAuthenticated) {
    return null
  }

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
                PaySlipPro
              </h1>
              <p className="text-xs text-muted-foreground">Tableau de bord</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-4 py-2 gradient-secondary rounded-xl shadow-lg">
              <User className="w-5 h-5 text-white" />
              <span className="text-sm font-semibold text-white">Admin</span>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleLogout}
              className="hover:bg-destructive hover:text-white hover:border-destructive transition-all hover:scale-105"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Déconnexion
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8 animate-slide-up">
          <h2 className="text-4xl font-bold mb-2">
            <span className="bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
              Bienvenue sur PaySlipPro
            </span>
          </h2>
          <p className="text-muted-foreground text-lg">Gérez vos fiches de paie de manière simple et sécurisée</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mt-8 animate-scale-in" style={{animationDelay: '0.2s'}}>
          <Card className="border-2 border-primary/20 hover:border-primary/50 transition-all hover:shadow-xl hover:-translate-y-1 bg-white">
            <CardHeader className="pb-2">
              <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center mb-2 shadow-md">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <CardTitle className="text-lg text-primary">Étape 1</CardTitle>
              <CardDescription className="font-semibold">Découpage du fichier</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Sélectionnez et découpez votre fichier PDF en fiches individuelles
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 border-accent/20 hover:border-accent/50 transition-all hover:shadow-xl hover:-translate-y-1 bg-white">
            <CardHeader className="pb-2">
              <div className="w-12 h-12 rounded-xl gradient-accent flex items-center justify-center mb-2 shadow-md">
                <Lock className="w-6 h-6 text-white" />
              </div>
              <CardTitle className="text-lg text-accent">Étape 2</CardTitle>
              <CardDescription className="font-semibold">Sécurisation</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Ajoutez automatiquement un mot de passe basé sur le matricule
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 border-secondary/20 hover:border-secondary/50 transition-all hover:shadow-xl hover:-translate-y-1 bg-white">
            <CardHeader className="pb-2">
              <div className="w-12 h-12 rounded-xl gradient-secondary flex items-center justify-center mb-2 shadow-md">
                <Mail className="w-6 h-6 text-white" />
              </div>
              <CardTitle className="text-lg text-secondary">Étape 3</CardTitle>
              <CardDescription className="font-semibold">Distribution</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Envoyez les fiches par email de manière individuelle ou groupée
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="split" className="space-y-6 animate-scale-in pt-5">
          <TabsList className="grid w-full grid-cols-4 max-w-2xl bg-white/80 backdrop-blur-sm p-1.5 h-auto shadow-lg">
            <TabsTrigger 
              value="split" 
              className="flex items-center gap-2 data-[state=active]:bg-blue-100 data-[state=active]:text-blue-500 py-3 rounded-lg transition-all"
            >
              <FileText className="w-5 h-5" />
              <span className="font-semibold">Découper un PDF</span>
            </TabsTrigger>
            <TabsTrigger 
              value="protect" 
              className="flex items-center gap-2 data-[state=active]:bg-blue-100 data-[state=active]:text-blue-500 py-3 rounded-lg transition-all"
            >
              <Lock className="w-5 h-5" />
              <span className="font-semibold">Protéger un PDF</span>
            </TabsTrigger>
            <TabsTrigger 
              value="send" 
              className="flex items-center gap-2 data-[state=active]:bg-blue-100 data-[state=active]:text-blue-500 py-3 rounded-lg transition-all"
            >
              <Mail className="w-5 h-5" />
              <span className="font-semibold">Envoyé par email</span>
            </TabsTrigger>
            <TabsTrigger 
              value="send" 
              className="flex items-center gap-2 data-[state=active]:bg-blue-100 data-[state=active]:text-blue-500 py-3 rounded-lg transition-all"
            >
              <FileText className="w-5 h-5" />
              <span className="font-semibold">Consulter les pdf</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="split">
            <PdfSplitter />
          </TabsContent>

          <TabsContent value="protect">
            <PasswordProtector />
          </TabsContent>

          <TabsContent value="send">
            <EmailSender />
          </TabsContent>
        </Tabs>

        
      </main>
    </div>
  )
}
