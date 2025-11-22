'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { 
  FileText, 
  Lock, 
  Mail, 
  LogOut, 
  User, 
  Sparkles, 
  Download, 
  Shield, 
  Send, 
  FolderOpen 
} from 'lucide-react'
import { PdfSplitter } from '@/components/pdf-splitter'
import { PasswordProtector } from '@/components/password-protector'
import { PdfEmailManager } from '@/components/email-sender'

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
    localStorage.removeItem('token')
    localStorage.removeItem('downloadLinks')
    router.push('/')
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-md shadow-sm">
        <div className="container mx-auto px-4 py-5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-xl">
              <FileText className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold  bg-clip-text text-black">
                PaieDigit
              </h1>
              <p className="text-sm text-muted-foreground">Gestion sécurisée des bulletins de paie</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Badge variant="secondary" className="px-4 py-2 text-sm font-medium">
              <User className="w-4 h-4 mr-2" />
              Admin
            </Badge>
            <Button 
              onClick={handleLogout}
              variant="outline"
              className="hover:bg-red-50 hover:text-red-600 hover:border-red-300 transition-all"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Déconnexion
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-10 max-w-7xl">
        {/* Bienvenue */}
        <section className="text-center mb-12">
          <h2 className="text-5xl font-extrabold mb-4 text-black  bg-clip-text ">
            Bienvenue sur PaieDigit
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Découpez, protégez et envoyez vos bulletins de paie en quelques clics — tout est sécurisé et automatisé !
          </p>
        </section>

        {/* Étapes rapides */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          <Card className="border-2 border-blue-200 hover:border-blue-400 hover:shadow-2xl transition-all duration-300 group">
            <CardHeader>
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <FileText className="w-7 h-7 text-white" />
              </div>
              <CardTitle className="text-xl text-blue-600">Étape 1 • Découpage</CardTitle>
              <CardDescription className="font-medium">
                Séparez un PDF groupé en bulletins individuels
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Un seul fichier → plusieurs PDFs par matricule
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 border-purple-200 hover:border-purple-400 hover:shadow-2xl transition-all duration-300 group">
            <CardHeader>
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <Shield className="w-7 h-7 text-white" />
              </div>
              <CardTitle className="text-xl text-purple-600">Étape 2 • Protection</CardTitle>
              <CardDescription className="font-medium">
                Mot de passe automatique (matricule)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Chaque bulletin est sécurisé et confidentiel
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 border-green-200 hover:border-green-400 hover:shadow-2xl transition-all duration-300 group">
            <CardHeader>
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <Mail className="w-7 h-7 text-white" />
              </div>
              <CardTitle className="text-xl text-green-600">Étape 3 • Envoi</CardTitle>
              <CardDescription className="font-medium">
                Distribution par email (individuelle ou groupée)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Vos salariés reçoivent leur bulletin instantly
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Onglets */}
        <Tabs defaultValue="split" className="w-full">
          <TabsList className="grid grid-cols-2 md:grid-cols-4 w-full max-w-4xl mx-auto h-auto p-2 bg-white/90 backdrop-blur-lg shadow-xl rounded-2xl">
            <TabsTrigger 
              value="split" 
              className="flex flex-col items-center gap-2 py-4 rounded-xl data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700 data-[state=active]:shadow-md transition-all"
            >
              <Download className="w-6 h-6" />
              <span className="font-semibold text-sm">Découper PDF</span>
            </TabsTrigger>

            <TabsTrigger 
              value="protect" 
              className="flex flex-col items-center gap-2 py-4 rounded-xl data-[state=active]:bg-purple-100 data-[state=active]:text-purple-700 data-[state=active]:shadow-md transition-all"
            >
              <Lock className="w-6 h-6" />
              <span className="font-semibold text-sm">Protéger PDF</span>
            </TabsTrigger>

            <TabsTrigger 
              value="send" 
              className="flex flex-col items-center gap-2 py-4 rounded-xl data-[state=active]:bg-green-100 data-[state=active]:text-green-700 data-[state=active]:shadow-md transition-all"
            >
              <Send className="w-6 h-6" />
              <span className="font-semibold text-sm">Envoyer Emails</span>
            </TabsTrigger>

            <TabsTrigger 
              value="view" 
              className="flex flex-col items-center gap-2 py-4 rounded-xl data-[state=active]:bg-amber-100 data-[state=active]:text-amber-700 data-[state=active]:shadow-md transition-all"
            >
              <FolderOpen className="w-6 h-6" />
              <span className="font-semibold text-sm">Voir les PDFs</span>
            </TabsTrigger>
          </TabsList>

          <div className="mt-10">
            <TabsContent value="split" className="mt-0">
              <PdfSplitter />
            </TabsContent>

            <TabsContent value="protect" className="mt-0">
              <PasswordProtector />
            </TabsContent>

            <TabsContent value="send" className="mt-0">
              <PdfEmailManager />
            </TabsContent>

            <TabsContent value="view" className="mt-0">
              <Card className="border-dashed border-2">
                <CardHeader className="text-center py-12">
                  <FolderOpen className="w-20 h-20 mx-auto text-muted-foreground mb-4" />
                  <CardTitle className="text-2xl">Consulter les PDFs générés</CardTitle>
                  <CardDescription className="text-lg max-w-2xl mx-auto">
                    Tous les bulletins découpés et protégés sont disponibles dans l’onglet « Découper PDF ».<br />
                    Vous pouvez les télécharger ou les envoyer directement depuis là-bas.
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  <Button size="lg" onClick={() => document.querySelector('[value="split"]')?.closest('button')?.click()}>
                    Aller au Découpage
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </div>
        </Tabs>
      </main>
    </div>
  )
}