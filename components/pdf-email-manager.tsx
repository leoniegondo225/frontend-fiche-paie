'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { CheckCircle, Loader2, Mail } from 'lucide-react'

interface FileLink {
  matricule: string
  url: string
  email?: string
}

export function PdfEmailManager() {
  const [splitFiles, setSplitFiles] = useState<FileLink[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [emailsSent, setEmailsSent] = useState(0)
  const [success, setSuccess] = useState(false)
  const [scheduledTime, setScheduledTime] = useState<string>("")
  const [isScheduled, setIsScheduled] = useState(false)
  const [countdown, setCountdown] = useState<number>(0)

  // Charger les fichiers découpés depuis localStorage
  useEffect(() => {
    const saved = localStorage.getItem("downloadLinks")
    if (saved) setSplitFiles(JSON.parse(saved))
  }, [])

  // Compte à rebours pour l'envoi programmé
  useEffect(() => {
    let timer: NodeJS.Timeout
    if (isScheduled && countdown > 0) {
      timer = setInterval(() => {
        setCountdown(prev => prev - 1)
      }, 1000)
    } else if (countdown === 0 && isScheduled) {
      setIsScheduled(false)
      sendFilesByEmail(splitFiles)
    }
    return () => clearInterval(timer)
  }, [isScheduled, countdown, splitFiles])

  const sendFilesByEmail = async (files: FileLink[] | FileLink) => {
    const filesArray = Array.isArray(files) ? files : [files]
    if (filesArray.length === 0) return

    setIsProcessing(true)
    setProgress(0)
    setEmailsSent(0)
    setSuccess(false)

    const total = filesArray.length

    for (let i = 0; i < total; i++) {
      const file = filesArray[i]
      try {
        const token = localStorage.getItem('token')
        if (!token) {
          alert("Token manquant.")
          break
        }

        const res = await fetch('http://localhost:3600/api/sendOne', {
          method: 'POST',
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            matricule: file.matricule,
            pdfUrl: file.url,
            email: file.email || "leoniegondo@gmail.com"
          })
        })

        const data = await res.json()
        if (!res.ok) console.error(`Erreur pour ${file.matricule} : ${data.message}`)
      } catch (err) {
        console.error(err)
      }

      setEmailsSent(i + 1)
      setProgress(((i + 1) / total) * 100)
      await new Promise(r => setTimeout(r, 300))
    }

    setIsProcessing(false)
    setSuccess(true)
    setIsScheduled(false)
    setCountdown(0)
  }

  const handleSendClick = () => {
    if (scheduledTime) {
      const delay = new Date(scheduledTime).getTime() - Date.now()
      if (delay > 0) {
        setIsScheduled(true)
        setCountdown(Math.floor(delay / 1000))
      } else {
        alert("Veuillez choisir une date future")
      }
    } else {
      sendFilesByEmail(splitFiles)
    }
  }

  const formatCountdown = (seconds: number) => {
    const min = Math.floor(seconds / 60)
    const sec = seconds % 60
    return `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Envoyer les fichiers découpés</CardTitle>
        <CardDescription>Envoyez individuellement ou en groupe les fichiers générés par le découpage PDF</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">

        {splitFiles.length === 0 && (
          <p className="text-muted-foreground">Aucun fichier découpé disponible</p>
        )}

        {splitFiles.map(file => (
          <div key={file.matricule} className="flex justify-between items-center border rounded-md p-2">
            <span>{file.matricule}.pdf</span>
            <Button
              size="sm"
              onClick={() => sendFilesByEmail(file)}
              disabled={isProcessing || isScheduled}
            >
              Envoyer par email
            </Button>
          </div>
        ))}

        {/* Programmation de l'envoi */}
        <div className="flex flex-col space-y-2 mt-2">
          <label>Date et heure d'envoi :</label>
          <Input
            type="datetime-local"
            value={scheduledTime}
            onChange={(e) => setScheduledTime(e.target.value)}
            disabled={isProcessing || isScheduled}
          />
        </div>

        <Button
          onClick={handleSendClick}
          disabled={isProcessing || isScheduled || splitFiles.length === 0}
          className="w-full mt-2"
        >
          {isProcessing || isScheduled
            ? <Loader2 className="w-4 h-4 animate-spin mr-2" />
            : <Mail className="w-4 h-4 mr-2" />}
          {isScheduled ? `Envoi programmé dans ${formatCountdown(countdown)}` : "Envoyer tous les fichiers"}
        </Button>

        {isProcessing && (
          <Progress value={progress} className="h-2 mt-2" />
        )}

        {success && (
          <Alert className="border-accent/50 bg-accent/10 mt-2">
            <CheckCircle className="h-4 w-4 text-accent" />
            <AlertDescription>{emailsSent} fichiers envoyés avec succès !</AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  )
}

export default PdfEmailManager
