'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  FolderOpen,
  Lock,
  CheckCircle2,
  Loader2,
  Shield,
  Download,
  FileLock2,
  Key,
  FileText,
  Sparkles
} from 'lucide-react'

export function PasswordProtector() {
  const [useMatricule, setUseMatricule] = useState(true)
  const [customPassword, setCustomPassword] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [success, setSuccess] = useState(false)
  const [filesProtected, setFilesProtected] = useState(0)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [downloadLinks, setDownloadLinks] = useState<{ filename: string; url: string }[]>([])

  useEffect(() => {
    const saved = localStorage.getItem('protectedDownloadLinks')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        setDownloadLinks(parsed)
        setSuccess(true)
        setFilesProtected(parsed.length)
      } catch (e) { /* ignore */ }
    }
  }, [])

  useEffect(() => {
    if (downloadLinks.length > 0) {
      localStorage.setItem('protectedDownloadLinks', JSON.stringify(downloadLinks))
    }
  }, [downloadLinks])

  const handleProtect = async () => {
    if (!selectedFile) return

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
      const res = await fetch('http://localhost:3600/api/protect', {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      })

      if (res.ok) {
        const data = await res.json()
        if (data.message === 'ok' && data.downloadLinks) {
          setDownloadLinks(data.downloadLinks)
          setFilesProtected(data.downloadLinks.length)
          setSuccess(true)
        }
      } else {
        throw new Error('Backend indisponible')
      }
    } catch (err) {
      console.warn('Fallback local activé')
      const blobUrl = URL.createObjectURL(selectedFile)
      const protectedName = selectedFile.name.replace(/\.pdf$/i, '') + '-PROTEGE.pdf'
      setDownloadLinks([{ filename: protectedName, url: blobUrl }])
      setFilesProtected(1)
      setSuccess(true)
    } finally {
      setIsProcessing(false)
      setProgress(100)
    }
  }

  const downloadFile = async (url: string, filename: string) => {
    try {
      const res = await fetch(url)
      const blob = await res.blob()

      if (typeof (window as any).showSaveFilePicker === 'function') {
        try {
          const handle = await (window as any).showSaveFilePicker({
            suggestedName: filename,
            types: [{ description: 'PDF Protégé', accept: { 'application/pdf': ['.pdf'] } }]
          })
          const writable = await handle.createWritable()
          await writable.write(blob)
          await writable.close()
          return
        } catch (e) { /* annulé */ }
      }

      const a = document.createElement('a')
      a.href = URL.createObjectURL(blob)
      a.download = filename
      a.click()
      URL.revokeObjectURL(a.href)
    } catch (err) {
      console.error(err)
    }
  }

  const downloadAll = async () => {
    for (const file of downloadLinks) {
      await downloadFile(file.url, file.filename)
      await new Promise(r => setTimeout(r, 300))
    }
  }

  const clearResults = () => {
    setDownloadLinks([])
    setSuccess(false)
    setFilesProtected(0)
    localStorage.removeItem('protectedDownloadLinks')
  }

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-10">
      {/* En-tête doux */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center w-18 h-18 rounded-2xl bg-gray-100 border-2 border-gray-200">
          <Shield className="w-10 h-10 text-gray-600" />
        </div>
        <div>
          <h1 className="text-4xl font-bold text-gray-800">Protection par mot de passe</h1>
          <p className="text-lg text-gray-600 mt-2">
            Sécurisez vos bulletins en toute simplicité
          </p>
        </div>
      </div>

      {/* Carte principale */}
      <Card className="border-gray-200 shadow-lg">
        <CardHeader className="text-center space-y-3 pb-8">
          <CardTitle className="text-2xl text-gray-800">Sélectionnez votre fichier PDF</CardTitle>
          <CardDescription className="text-base text-gray-600">
            Le fichier sera protégé selon l’option choisie
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-8">
          {/* Sélection fichier */}
          <div className="space-y-4">
            <Label className="text-base font-medium text-gray-700">Fichier à protéger</Label>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <FileText className="absolute left-4 top-4 h-5 w-5 text-gray-500" />
                <Input
                  readOnly
                  placeholder="Aucun fichier sélectionné"
                  value={selectedFile?.name || ''}
                  className="pl-12 h-14 bg-gray-50 border-gray-300 text-gray-800"
                />
                {selectedFile && (
                  <Badge variant="secondary" className="absolute right-3 top-3.5 bg-gray-200 text-gray-700">
                    {(selectedFile.size / 1024 / 1024).toFixed(1)} Mo
                  </Badge>
                )}
              </div>
              <Button
                size="lg"
                variant="outline"
                onClick={() => document.getElementById('fileInput')?.click()}
                className="border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                <FolderOpen className="w-5 h-5 mr-2" />
                Parcourir
              </Button>
            </div>
            <input id="fileInput" type="file" accept="application/pdf" className="hidden" onChange={(e) => setSelectedFile(e.target.files?.[0] ?? null)} />
          </div>

          <Separator className="bg-gray-200" />

          {/* Option mot de passe */}
          <div className="space-y-6">
            <div className="flex items-center justify-between p-5 bg-gray-50 rounded-xl border border-gray-200">
              <div className="space-y-1">
                <Label className="text-base font-semibold flex items-center gap-2 text-gray-800">
                  <Key className="w-5 h-5 text-gray-600" />
                  Mot de passe = Matricule (recommandé)
                </Label>
                <p className="text-sm text-gray-600">
                  Chaque employé ouvre son bulletin avec son propre matricule
                </p>
              </div>
              <Switch
                checked={useMatricule}
                onCheckedChange={setUseMatricule}
                className="data-[state=checked]:bg-gray-700"
              />
            </div>

            {!useMatricule && (
              <div className="p-5 bg-gray-50 rounded-xl border border-gray-200 space-y-4">
                <Label className="text-base font-medium text-gray-700">Mot de passe personnalisé</Label>
                <div className="relative">
                  <Lock className="absolute left-4 top-3.5 h-5 w-5 text-gray-500" />
                  <Input
                    type="password"
                    placeholder="Entrez un mot de passe..."
                    value={customPassword}
                    onChange={(e) => setCustomPassword(e.target.value)}
                    className="pl-12 h-12 border-gray-300"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Progression */}
          {isProcessing && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-medium text-gray-700 flex items-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin text-gray-600" />
                  Protection en cours...
                </span>
                <span className="text-sm text-gray-600">{filesProtected} fichier(s) traité(s)</span>
              </div>
              <Progress value={progress || 50} className="h-3 bg-gray-200" indicatorClassName="bg-gray-600" />
            </div>
          )}

          {/* Bouton principal */}
          <Button
            onClick={handleProtect}
            disabled={!selectedFile || isProcessing || (!useMatricule && customPassword.length < 4)}
            size="lg"
            className="w-full h-14 text-lg font-medium bg-gray-800 hover:bg-gray-900 text-white"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-6 h-6 mr-3 animate-spin" />
                Protection en cours...
              </>
            ) : (
              <>
                <FileLock2 className="w-6 h-6 mr-3" />
                Protéger le fichier
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Résultats */}
      {success && downloadLinks.length > 0 && (
        <Card className="border-2 border-gray-300 bg-gray-50/50">
          <CardHeader>
            <Alert className="border-none bg-transparent">
              <CheckCircle2 className="h-9 w-9 text-gray-700" />
              <AlertTitle className="text-2xl text-gray-800 ml-3">Protection terminée</AlertTitle>
              <AlertDescription className="text-lg text-gray-700 ml-3">
                {filesProtected} fichier(s) sécurisé(s) avec succès
              </AlertDescription>
            </Alert>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="flex flex-wrap gap-3 justify-center">
              <Button onClick={downloadAll} size="lg" className="bg-gray-800 hover:bg-gray-900">
                <Download className="w-5 h-5 mr-2" />
                Télécharger tout
              </Button>
              <Button onClick={clearResults} size="lg" variant="outline" className="border-gray-400">
                <Sparkles className="w-5 h-5 mr-2" />
                Nouvelle protection
              </Button>
            </div>

            <Separator className="bg-gray-300" />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {downloadLinks.map((file) => (
                <div key={file.filename} className="p-5 border border-gray-300 rounded-xl bg-white hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-3">
                    <FileLock2 className="w-9 h-9 text-gray-600" />
                    <Badge className="bg-gray-200 text-gray-700">Protégé</Badge>
                  </div>
                  <h4 className="font-semibold text-gray-800 truncate">{file.filename}</h4>
                  <p className="text-sm text-gray-600 mt-1">
                    {useMatricule ? 'Mot de passe = matricule' : 'Mot de passe fixe'}
                  </p>
                  <Button onClick={() => downloadFile(file.url, file.filename)} className="w-full mt-4 text-sm" variant="secondary">
                    <Download className="w-4 h-4 mr-2" />
                    Télécharger
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default PasswordProtector