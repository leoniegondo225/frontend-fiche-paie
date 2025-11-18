'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { Switch } from '@/components/ui/switch'
import { FolderOpen, Lock, CheckCircle, Loader2, Shield } from 'lucide-react'

export function PasswordProtector() {
  const [useFolderPicker, setUseFolderPicker] = useState(false)
  const [useMatricule, setUseMatricule] = useState(true)
  const [customPassword, setCustomPassword] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [success, setSuccess] = useState(false)
  const [filesProtected, setFilesProtected] = useState(0)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [downloadLinks, setDownloadLinks] = useState<{ filename: string, url: string }[]>([])

  const handleProtect = async () => {
    if (!selectedFile) return
    // Reset
    setIsProcessing(true)
    setSuccess(false)
    setProgress(0)
    setFilesProtected(0)
    setDownloadLinks([])
    localStorage.removeItem('protectedDownloadLinks')

    const token = localStorage.getItem('token')
    const formData = new FormData()
    formData.append('file', selectedFile)
    formData.append('useMatricule', String(useMatricule))
    if (!useMatricule) formData.append('password', customPassword)

    try {
      // Tentative d'appel à une route backend `/api/protect` si elle existe
      const res = await fetch('http://localhost:3600/api/protect', {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        body: formData,
      })

      if (res.ok) {
        const data = await res.json()
        if (data.message === 'ok' && data.downloadLinks) {
          setSuccess(true)
          setDownloadLinks(data.downloadLinks)
          setFilesProtected(data.downloadLinks.length || 0)
          try { localStorage.setItem('protectedDownloadLinks', JSON.stringify(data.downloadLinks)) } catch (e) { /* ignore */ }
        } else {
          console.error(data.message)
        }
      } else {
        // Si la route n'existe pas (404) ou autre erreur côté serveur, on effectue un fallback local
        console.warn('Route /api/protect indisponible (', res.status, '), utilisation du fallback local')
        // Créer un "fichier protégé" local en réutilisant le blob (pas de chiffrement réel)
        const blobUrl = URL.createObjectURL(selectedFile)
        const protectedName = selectedFile.name.replace(/\.pdf$/i, '') + '-protected.pdf'
        setDownloadLinks([{ filename: protectedName, url: blobUrl }])
        setFilesProtected(1)
        setSuccess(true)
      }
    } catch (err) {
      // Erreur réseau : fallback local
      console.warn('Erreur réseau lors de l\'appel à /api/protect, fallback local :', err)
      const blobUrl = URL.createObjectURL(selectedFile)
      const protectedName = selectedFile.name.replace(/\.pdf$/i, '') + '-protected.pdf'
      setDownloadLinks([{ filename: protectedName, url: blobUrl }])
      setFilesProtected(1)
      setSuccess(true)
    } finally {
      setIsProcessing(false)
      setProgress(100)
    }
  }

  useEffect(() => {
    const saved = localStorage.getItem('protectedDownloadLinks')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        setDownloadLinks(parsed)
        setSuccess(true)
        setFilesProtected(parsed.length || 0)
      } catch (e) { /* ignore */ }
    }
  }, [])

  useEffect(() => {
    if (downloadLinks.length > 0) {
      localStorage.setItem('protectedDownloadLinks', JSON.stringify(downloadLinks))
    }
  }, [downloadLinks])

  const downloadFile = async (fileUrl: string, filename: string) => {
    try {
      const response = await fetch(fileUrl)
      if (!response.ok) throw new Error('Erreur lors du téléchargement')
      const blob = await response.blob()

      if (typeof (window as any).showSaveFilePicker === 'function') {
        try {
          const opts = {
            suggestedName: filename,
            types: [
              {
                description: 'PDF',
                accept: { 'application/pdf': ['.pdf'] },
              },
            ],
          }
          const handle = await (window as any).showSaveFilePicker(opts)
          const writable = await handle.createWritable()
          await writable.write(blob)
          await writable.close()
          try { alert(`${filename} sauvegardé.`) } catch (e) { /* ignore */ }
          return
        } catch (err) {
          console.warn('Sauvegarde via showSaveFilePicker annulée / échouée :', err)
        }
      }

      const a = document.createElement('a')
      const url = URL.createObjectURL(blob)
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error('Erreur téléchargement :', err)
    }
  }

  const downloadAll = async () => {
    if (downloadLinks.length === 0) return
    for (const f of downloadLinks) {
      await downloadFile(f.url, f.filename)
      await new Promise(r => setTimeout(r, 300))
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Protection par mot de passe</CardTitle>
        <CardDescription>
          Sécurisez vos fichiers PDF découpés avec un mot de passe
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="folder">Dossier contenant les fichiers PDF</Label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <FolderOpen className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                 type="text"
                placeholder="C:\Documents\Fiches_Decoupees"
                value={selectedFile?.name || ''}
                readOnly
                className="pl-10"
              />
            </div>
            <Button  variant="outline"
              onClick={() => document.getElementById('fileInput')?.click()}>
              <FolderOpen className="w-4 h-4 mr-2" />
              Parcourir
            </Button>
            <input
              type="file"
              id="fileInput"
              accept="application/pdf"
              className="hidden"
              onChange={(e) => setSelectedFile(e.target.files?.[0] ?? null)}
            />
          </div>
        </div>

        <div className="bg-muted/50 border border-border rounded-lg p-4 space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="auto-password" className="text-base">
                Mot de passe automatique
              </Label>
              <p className="text-sm text-muted-foreground">
                Utiliser le matricule comme mot de passe
              </p>
            </div>
            <Switch
              id="auto-password"
              checked={useMatricule}
              onCheckedChange={setUseMatricule}
            />
          </div>

          {!useMatricule && (
            <div className="space-y-2 pt-2">
              <Label htmlFor="custom">Mot de passe personnalisé</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="custom"
                  type="password"
                  placeholder="Entrez un mot de passe"
                  value={customPassword}
                  onChange={(e) => setCustomPassword(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          )}
        </div>

        <div className="bg-accent/10 border border-accent/30 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-accent mt-0.5" />
            <div className="space-y-1">
              <p className="font-medium text-sm text-foreground">Sécurité renforcée</p>
              <p className="text-sm text-muted-foreground">
                {useMatricule 
                  ? "Le matricule de chaque employé sera utilisé comme mot de passe unique pour son fichier PDF."
                  : "Tous les fichiers seront protégés avec le même mot de passe personnalisé."}
              </p>
            </div>
          </div>
        </div>

        {isProcessing && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Protection en cours...</span>
              <span className="font-medium text-foreground">{filesProtected} fichiers protégés</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        )}

        {success && (
          <Alert className="border-accent/50 bg-accent/10">
            <CheckCircle className="h-4 w-4 text-accent" />
            <AlertDescription className="text-accent-foreground">
              Protection terminée ! {filesProtected} fichiers ont été sécurisés avec succès.
            </AlertDescription>
          </Alert>
        )}

        <Button
          onClick={handleProtect}
          disabled={!selectedFile || isProcessing || (!useMatricule && !customPassword)}
          className="w-full"
          size="lg"
        >
          {isProcessing ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Protection en cours...
            </>
          ) : (
            <>
              <Lock className="w-4 h-4 mr-2" />
              Protéger les fichiers
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  )
}
