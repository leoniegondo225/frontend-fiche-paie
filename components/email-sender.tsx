'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  CheckCircle2,
  Loader2,
  Mail,
  Clock,
  Upload,
  Send,
  CalendarClock,
  Files,
  AlertCircle
} from 'lucide-react'

interface FileLink {
  matricule: string
  url: string
  email?: string
}

export function PdfEmailManager() {
  const [localFiles, setLocalFiles] = useState<File[]>([])
  const [splitFiles, setSplitFiles] = useState<FileLink[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [emailsSent, setEmailsSent] = useState(0)
  const [success, setSuccess] = useState(false)
  const [scheduledTime, setScheduledTime] = useState<string>("")
  const [countdown, setCountdown] = useState<number | null>(null)
  const [isScheduled, setIsScheduled] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem("downloadLinks")
    if (saved) setSplitFiles(JSON.parse(saved))
  }, [])

  // Compte à rebours
  useEffect(() => {
    if (!isScheduled || !scheduledTime) return

    const interval = setInterval(() => {
      const diff = new Date(scheduledTime).getTime() - new Date().getTime()
      if (diff <= 0) {
        clearInterval(interval)
        sendFilesByEmail([...localFiles, ...splitFiles])
        setIsScheduled(false)
        setCountdown(null)
      } else {
        setCountdown(Math.floor(diff / 1000))
      }
    }, 1000)
    return () => clearInterval(interval)
  }, [isScheduled, scheduledTime, localFiles, splitFiles])

  const handleLocalFilesChange = (files: FileList | null) => {
    if (!files) return
    setLocalFiles(Array.from(files))
  }

  const sendFilesByEmail = async (files: (File | FileLink)[]) => {
    if (files.length === 0) return

    setIsProcessing(true)
    setProgress(0)
    setEmailsSent(0)
    setSuccess(false)

    const total = files.length

    for (let i = 0; i < total; i++) {
      const item = files[i]
      try {
        let body: FormData
        const endpoint = "http://localhost:3600/api/sendOne"

        if (item instanceof File) {
          // Fichier local
          body = new FormData()
          body.append("files", item)
          body.append(
            "files",
            JSON.stringify([{ matricule: item.name.replace(".pdf", ""), email: "leoniegondo@gmail.com" }])
          )
        } else {
          // Fichier découpé (via URL)
          const response = await fetch(item.url)
          const blob = await response.blob()
          const pdfFile = new File([blob], `${item.matricule}.pdf`, { type: "application/pdf" })
          body = new FormData()
          body.append("files", pdfFile)
          body.append(
            "files",
            JSON.stringify([{ matricule: item.matricule, email: item.email || "leoniegondo@gmail.com" }])
          )
        }

        const res = await fetch(endpoint, {
          method: "POST",
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          body
        })

        if (!res.ok) {
          const errorText = await res.text()
          console.error("Backend error:", res.status, errorText)
        }
      } catch (err) {
        console.error("Frontend error:", err)
      }

      setEmailsSent(i + 1)
      setProgress(((i + 1) / total) * 100)
      await new Promise(r => setTimeout(r, 200))
    }

    setIsProcessing(false)
    setSuccess(true)
  }

  const formatCountdown = (seconds: number) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m}m ${s.toString().padStart(2, '0')}s`
  }

  const totalFilesToSend = localFiles.length + splitFiles.length

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Gestionnaire d'envoi PDF par email</h1>
        <p className="text-muted-foreground">Envoyez vos PDFs découpés ou locaux en un clic</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* === Fichiers locaux === */}
        <Card className="border-2 hover:border-primary/30 transition-colors">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="w-5 h-5" />
              Fichiers locaux
            </CardTitle>
            <CardDescription>
              Sélectionnez un ou plusieurs PDFs depuis votre ordinateur
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              type="file"
              multiple
              accept="application/pdf"
              onChange={(e) => handleLocalFilesChange(e.target.files)}
              className="cursor-pointer"
            />
            
            {localFiles.length > 0 && (
              <>
                <Separator />
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{localFiles.length} fichier(s) sélectionné(s)</span>
                    <Badge variant="secondary">{localFiles.length} PDFs</Badge>
                  </div>
                  <Button
                    onClick={() => sendFilesByEmail(localFiles)}
                    disabled={isProcessing || isScheduled}
                    className="w-full"
                    size="sm"
                  >
                    {isProcessing ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4 mr-2" />
                    )}
                    Envoyer maintenant
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* === Fichiers découpés === */}
        <Card className="border-2 hover:border-primary/30 transition-colors">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Files className="w-5 h-5" />
              Fichiers découpés
            </CardTitle>
            <CardDescription>
              {splitFiles.length} fichier(s) disponible(s) depuis le dernier découpage
            </CardDescription>
          </CardHeader>
          <CardContent>
            {splitFiles.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                Aucun fichier découpé disponible
              </p>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {splitFiles.map(f => (
                  <div
                    key={f.matricule}
                    className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/5 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="bg-primary/10 p-2 rounded">
                        <Mail className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{f.matricule}.pdf</p>
                        {f.email && <p className="text-xs text-muted-foreground">{f.email}</p>}
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => sendFilesByEmail([f])}
                      disabled={isProcessing || isScheduled}
                    >
                      <Send className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                ))}
                {splitFiles.length > 0 && (
                  <Button
                    onClick={() => sendFilesByEmail(splitFiles)}
                    disabled={isProcessing || isScheduled}
                    className="w-full mt-4"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Tout envoyer ({splitFiles.length})
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* === Programmation d'envoi === */}
      <Card className="border-2 border-dashed">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarClock className="w-6 h-6" />
            Programmation d'envoi
          </CardTitle>
          <CardDescription>
            Envoyez automatiquement tous les fichiers (locaux + découpés) à une date précise
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <Input
              type="datetime-local"
              value={scheduledTime}
              onChange={(e) => setScheduledTime(e.target.value)}
              disabled={isProcessing}
              className="flex-1"
            />
            <Button
              onClick={() => {
                if (!scheduledTime) return alert("Veuillez choisir une date et heure")
                setIsScheduled(true)
              }}
              disabled={isProcessing || isScheduled || totalFilesToSend === 0}
              size="lg"
              className="sm:w-auto w-full"
            >
              <Clock className="w-4 h-4 mr-2" />
              Programmer
            </Button>
          </div>

          {isScheduled && countdown !== null && (
            <Alert className="border-blue-200 bg-blue-50">
              <Clock className="h-4 w-4" />
              <AlertDescription className="font-medium">
                Envoi programmé dans : <span className="text-blue-700">{formatCountdown(countdown)}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="ml-4"
                  onClick={() => {
                    setIsScheduled(false)
                    setCountdown(null)
                    setScheduledTime("")
                  }}
                >
                  Annuler
                </Button>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* === Barre de progression === */}
      {isProcessing && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Envoi en cours...
              </span>
              <span className="text-sm text-muted-foreground">
                {emailsSent} / {totalFilesToSend}
              </span>
            </div>
            <Progress value={progress} className="h-3" />
          </CardContent>
        </Card>
      )}

      {/* === Message de succès === */}
      {success && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle2 className="h-5 w-5 text-green-600" />
          <AlertTitle className="text-green-800">Succès !</AlertTitle>
          <AlertDescription className="text-green-700">
            {emailsSent} fichier(s) ont été envoyés avec succès
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}

export default PdfEmailManager