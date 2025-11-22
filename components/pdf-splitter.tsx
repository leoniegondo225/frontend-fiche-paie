'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  FileText,
  CheckCircle2,
  Loader2,
  FolderOpen,
  Download,
  Mail,
  RefreshCw,
  Upload,
  FileCheck,
  Trash2,
  Send
} from 'lucide-react'

export function PdfSplitter() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [success, setSuccess] = useState(false)
  const [downloadLinks, setDownloadLinks] = useState<{ matricule: string; url: string; email?: string }[]>([])
  const [showModal, setShowModal] = useState(false)
  const [modalMessage, setModalMessage] = useState('')


  // Chargement depuis localStorage
  useEffect(() => {
    const saved = localStorage.getItem("downloadLinks")
    if (saved) {
      const links = JSON.parse(saved)
      setDownloadLinks(links)
      setSuccess(true)
    }
  }, [])

  useEffect(() => {
    if (downloadLinks.length > 0) {
      localStorage.setItem("downloadLinks", JSON.stringify(downloadLinks))
    }
  }, [downloadLinks])
   const showModalMessage = (message: string) => {
    setModalMessage(message)
    setShowModal(true)
   }
const handleCloseModal = () => setShowModal(false)
  // Téléchargement intelligent (File System Access API + fallback)
  const downloadFile = async (fileUrl: string, filename: string) => {
    try {
      const response = await fetch(fileUrl)
      if (!response.ok) throw new Error('Erreur téléchargement')
      const blob = await response.blob()

      if (typeof (window as any).showSaveFilePicker === 'function') {
        try {
          const handle = await (window as any).showSaveFilePicker({
            suggestedName: filename,
            types: [{ description: 'PDF Files', accept: { 'application/pdf': ['.pdf'] } }]
          })
          const writable = await handle.createWritable()
          await writable.write(blob)
          await writable.close()
          return
        } catch (err) { /* utilisateur a annulé */ }
      }

      // Fallback classique
      const a = document.createElement('a')
      a.href = URL.createObjectURL(blob)
      a.download = filename
      a.click()
      URL.revokeObjectURL(a.href)
    } catch (err) {
      console.error(err)
    }
  }

  const downloadFileToDirectory = async (fileUrl: string, filename: string, dirHandle: any) => {
    const res = await fetch(fileUrl)
    const blob = await res.blob()
    const fileHandle = await dirHandle.getFileHandle(filename, { create: true })
    const writable = await fileHandle.createWritable()
    await writable.write(blob)
    await writable.close()
  }

  const downloadAll = async () => {
    if (downloadLinks.length === 0) return

    if (typeof (window as any).showDirectoryPicker === 'function') {
      try {
        const dirHandle = await (window as any).showDirectoryPicker()
        for (const file of downloadLinks) {
          await downloadFileToDirectory(file.url, `${file.matricule}.pdf`, dirHandle)
        }
        alert("Tous les fichiers ont été sauvegardés dans le dossier choisi !")
        return
      } catch (err) {
        console.warn("Dossier annulé ou erreur")
      }
    }

    // Fallback individuel
    for (const file of downloadLinks) {
      await downloadFile(file.url, `${file.matricule}.pdf`)
      await new Promise(r => setTimeout(r, 300))
    }
  }

    

  const clearAll = () => {
    setDownloadLinks([])
    setSuccess(false)
    setSelectedFile(null)
    localStorage.removeItem("downloadLinks")
  }

  const handleSplit = async () => {
    if (!selectedFile) return

    localStorage.removeItem("downloadLinks")
    setIsProcessing(true)
    setProgress(0)
    setSuccess(false)
    setDownloadLinks([])

    const token = localStorage.getItem('token')
    if (!token) {
      alert("Token manquant")
      setIsProcessing(false)
      return
    }

    const formData = new FormData()
    formData.append('file', selectedFile)

    try {
      const res = await fetch('http://localhost:3600/api/upload', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      })

      const data = await res.json()

      if (data.message === 'ok' && data.downloadLinks) {
        setDownloadLinks(data.downloadLinks)
        setSuccess(true)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setIsProcessing(false)
      setProgress(100)
    }
  }

  const sendByEmail = async (file: { matricule: string; url: string; email?: string }) => {
  try {
    const token = localStorage.getItem("token")
    if (!token) throw new Error("Token manquant")

    const response = await fetch(file.url)
    const blob = await response.blob()
    const pdfFile = new File([blob], `${file.matricule}.pdf`, { type: "application/pdf" })

    const formData = new FormData()
    formData.append("files", pdfFile)
    formData.append(
      "files",
      JSON.stringify([{ matricule: file.matricule, email: file.email || "leoniegondo@gmail.com" }])
    )

    const res = await fetch("http://localhost:3600/api/sendOne", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData
    })

    const data = await res.json()
   if (res.ok) showModalMessage(`Email envoyé à ${data.email || "l'adresse associée"}`)
      else showModalMessage("Erreur : " + data.message)
  } catch (err) {
    console.error(err)
    showModalMessage("Erreur réseau lors de l'envoi")
  }
}

const sendAllByEmail = async () => {
  if (downloadLinks.length === 0) return

  try {
    const token = localStorage.getItem("token")
    const formData = new FormData()

    for (const file of downloadLinks) {
      const response = await fetch(file.url)
      const blob = await response.blob()
      const pdfFile = new File([blob], `${file.matricule}.pdf`, { type: "application/pdf" })
      formData.append("files", pdfFile)
    }

    formData.append(
      "files",
      JSON.stringify(
        downloadLinks.map(d => ({ matricule: d.matricule, email: d.email || "leoniegondo@gmail.com" }))
      )
    )

    const res = await fetch("http://localhost:3600/api/sendOne", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData
    })

    const data = await res.json()
    if (res.ok) showModalMessage("Tous les bulletins ont été envoyés !")
      else showModalMessage("Erreur : " + data.message)
  } catch (err) {
    console.error(err)
    showModalMessage("Erreur lors de l'envoi groupé")
  }
}


  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8">
      <div className="text-center space-y-3">
        <h1 className="text-4xl font-bold tracking-tight">Découpeur de Bulletins de Paie</h1>
        <p className="text-lg text-muted-foreground">
          Séparez un PDF contenant plusieurs bulletins en fichiers individuels par matricule
        </p>
      </div>

      <Card className="border-2 shadow-xl">
        <CardHeader className="text-center pb-8">
          <div className="mx-auto w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <FileText className="w-10 h-10 text-primary" />
          </div>
          <CardTitle className="text-2xl">Téléversez votre fichier PDF groupé</CardTitle>
          <CardDescription className="text-base">
            Le fichier sera découpé automatiquement par matricule
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-8">
          {/* Sélection du fichier */}
          <div className="space-y-4">
            <Label className="text-lg">Fichier PDF à découper</Label>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <FileText className="absolute left-4 top-4 h-5 w-5 text-muted-foreground" />
                <Input
                  readOnly
                  placeholder="Aucun fichier sélectionné"
                  value={selectedFile?.name || ''}
                  className="pl-12 h-14 text-lg cursor-default bg-muted/50"
                />
                {selectedFile && (
                  <Badge variant="secondary" className="absolute right-3 top-3.5">
                    <FileCheck className="w-3.5 h-3.5 mr-1" />
                    {selectedFile.size > 1024 * 1024
                      ? `${(selectedFile.size / (1024 * 1024)).toFixed(1)} MB`
                      : `${Math.round(selectedFile.size / 1024)} KB`}
                  </Badge>
                )}
              </div>
              <Button
                size="lg"
                variant="outline"
                onClick={() => document.getElementById('fileInput')?.click()}
                className="sm:w-auto w-full"
              >
                <FolderOpen className="w-5 h-5 mr-2" />
                Choisir un fichier
              </Button>
            </div>
            <input
              id="fileInput"
              type="file"
              accept="application/pdf"
              className="hidden"
              onChange={(e) => setSelectedFile(e.target.files?.[0] ?? null)}
            />
          </div>

          <Separator />

          {/* Barre de progression */}
          {isProcessing && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-medium flex items-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Découpage en cours...
                </span>
                <span className="text-sm text-muted-foreground">Préparation des bulletins</span>
              </div>
              <Progress value={progress || 70} className="h-4" />
            </div>
          )}

          {/* Bouton principal */}
          <Button
            onClick={handleSplit}
            disabled={!selectedFile || isProcessing}
            size="lg"
            className="w-full h-14 text-lg font-semibold"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-6 h-6 mr-3 animate-spin" />
                Découpage en cours...
              </>
            ) : (
              <>
                <Upload className="w-6 h-6 mr-3" />
                Lancer le découpage
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Résultats */}
      {success && downloadLinks.length > 0 && (
        <Card className="border-2 border-green-200 bg-green-50/50">
          <CardHeader>
            <Alert className="border-none bg-transparent">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
              <AlertTitle className="text-2xl text-green-800">
                Découpage terminé avec succès !
              </AlertTitle>
              <AlertDescription className="text-lg text-green-700">
                {downloadLinks.length} bulletin(s) individuel(s) généré(s)
              </AlertDescription>
            </Alert>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Actions globales */}
            <div className="flex flex-wrap gap-3 justify-center">
              <Button onClick={downloadAll} size="lg" className="bg-green-600 hover:bg-green-700">
                <Download className="w-5 h-5 mr-2" />
                Télécharger tous les PDFs
              </Button>
              <Button onClick={sendAllByEmail} size="lg" className="bg-blue-600 hover:bg-blue-700">
                <Send className="w-5 h-5 mr-2" />
                Envoyer tous par email
              </Button>
              <Button onClick={clearAll} size="lg" variant="destructive">
                <RefreshCw className="w-5 h-5 mr-2" />
                Nouveau découpage
              </Button>
            </div>

            <Separator />

            {/* Liste des fichiers */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {downloadLinks.map((d) => (
                <div
                  key={d.matricule}
                  className="group relative border rounded-xl p-5 bg-card hover:shadow-lg transition-all hover:border-primary/50"
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <h4 className="font-bold text-lg">{d.matricule}</h4>
                      <p className="text-sm text-muted-foreground">Bulletin de paie</p>
                    </div>
                    <FileText className="w-8 h-8 text-primary/70" />
                  </div>

                  <div className="mt-4 flex gap-2">
                    <Button
                      onClick={() => downloadFile(d.url, `${d.matricule}.pdf`)}
                      size="sm"
                      className="flex-1"
                    >
                      <Download className="w-4 h-4 mr-1" />
                      Télécharger
                    </Button>
                    <Button
                      onClick={() => sendByEmail(d)}
                      size="sm"
                      variant="outline"
                      className="flex-1 border-blue-600 text-blue-600 hover:bg-blue-50"
                    >
                      <Mail className="w-4 h-4 mr-1" />
                      Email
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
          
        </Card>
        
        
      )}

       {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-white rounded-xl shadow-lg p-6 max-w-sm w-full space-y-4">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-6 h-6 text-green-600" />
              <h3 className="text-lg font-semibold">Information</h3>
            </div>
            <p>{modalMessage}</p>
            <Button className="w-full" onClick={handleCloseModal}>
              Fermer
            </Button>
          </div>
        </div>
      )}
    </div>
    
  )
}

export default PdfSplitter