'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { FileText, CheckCircle, Loader2 } from 'lucide-react'

export function PdfSplitter() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [success, setSuccess] = useState(false)
  const [downloadLinks, setDownloadLinks] = useState<{ matricule: string, url: string }[]>([])

  /* ---------------------------------------------------- */
  /* Charger depuis localStorage                          */
  /* ---------------------------------------------------- */
  useEffect(() => {
    const saved = localStorage.getItem("downloadLinks")
    if (saved) {
      setDownloadLinks(JSON.parse(saved))
      setSuccess(true)
    }
  }, [])

  useEffect(() => {
    if (downloadLinks.length > 0) {
      localStorage.setItem("downloadLinks", JSON.stringify(downloadLinks))
    }
  }, [downloadLinks])

  /* ---------------------------------------------------- */
  /* Téléchargement direct d’un fichier                   */
  /* ---------------------------------------------------- */
  const downloadFile = async (fileUrl: string, filename: string) => {
    console.log("Téléchargement de :", fileUrl)
  
    try {
       const a = document.createElement('a');
      a.href = fileUrl;
      a.download = filename;

      // Simulation d'un clic pour lancer le téléchargement
      document.body.appendChild(a);
      a.click();

      // Suppression de l'élément temporaire
      document.body.removeChild(a);
    } catch (err) {
      console.error("Erreur téléchargement :", err)
    }
  }

  /* ---------------------------------------------------- */
  /* Téléchargement de tous les fichiers                  */
  /* ---------------------------------------------------- */
  const downloadAll = async () => {
    for (const file of downloadLinks) {
      await downloadFile(file.url, `${file.matricule}.pdf`)
      await new Promise(r => setTimeout(r, 300)) // évite le blocage navigateur
    }
  }

  /* ---------------------------------------------------- */
  /* Suppression totale                                   */
  /* ---------------------------------------------------- */
  const clearAll = () => {
    setDownloadLinks([])
    setSuccess(false)
    localStorage.removeItem("downloadLinks")
  }

  /* ---------------------------------------------------- */
  /* Appel backend : découpage PDF                        */
  /* ---------------------------------------------------- */
  const handleSplit = async () => {
    if (!selectedFile) return

    // Reset
    localStorage.removeItem("downloadLinks")
    setIsProcessing(true)
    setProgress(0)
    setSuccess(false)
    setDownloadLinks([])

    const token = localStorage.getItem('token')
    if (!token) {
      console.error("Aucun token trouvé")
      setIsProcessing(false)
      return
    }

    const formData = new FormData()
    formData.append('file', selectedFile)

    try {
      const res = await fetch('http://localhost:3600/api/upload', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      })

      const data = await res.json()

      if (data.message === 'ok' && data.downloadLinks) {
        setSuccess(true)
        setDownloadLinks(data.downloadLinks)
      } else {
        console.error(data.message)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setIsProcessing(false)
      setProgress(100)
    }
  }

  /* ---------------------------------------------------- */
  /* Interface                                             */
  /* ---------------------------------------------------- */
  return (
    <Card>
      <CardHeader>
        <CardTitle>Découpage de fichier PDF</CardTitle>
        <CardDescription>Sélectionnez le fichier PDF à découper</CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* ----------------------------- Sélection PDF ---------------------------- */}
        <div className="space-y-2">
          <Label>Fichier PDF source</Label>

          <Input
            type="text"
            placeholder="Aucun fichier sélectionné"
            value={selectedFile?.name || ''}
            readOnly
          />

          <Button
            variant="outline"
            onClick={() => document.getElementById('fileInput')?.click()}
          >
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

        {/* ----------------------------- Progress Bar ----------------------------- */}
        {isProcessing && (
          <div className="space-y-2">
            <span className="text-muted-foreground">Découpage en cours...</span>
            <Progress value={progress} className="h-2" />
          </div>
        )}

        {/* ----------------------------- Résultats ----------------------------- */}
        {success && downloadLinks.length > 0 && (
          <div className='w-full flex flex-col border-accent/50 bg-accent/10 p-4'>
 <div className="flex items-center justify-between w-full">
              <p className="font-medium text-primary flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-accent" />
                Découpage terminé !
              </p>

              <div className="flex items-center gap-2">
                <Button
                  onClick={downloadAll}
                  className="bg-green-600 text-white hover:bg-green-700"
                >
                  Télécharger tout
                </Button>

                <Button
                  onClick={clearAll}
                  className="bg-red-600 text-white hover:bg-red-700"
                >
                  Supprimer tout
                </Button>
              </div>
            </div>

             <div className="mt-4 space-y-2 pt-10">
              {downloadLinks.map((d) => (
                <div
                  key={d.matricule}
                  className="flex items-center justify-between border rounded-md px-3 py-2 bg-white shadow-sm"
                >
                  <span className="font-semibold text-sm truncate max-w-[60%]">
                    {d.matricule}.pdf
                  </span>

                  <Button
                    onClick={() => downloadFile(d.url, `${d.matricule}.pdf`)}
                    className="px-3 py-1 text-xs bg-primary text-white rounded hover:bg-primary/80"
                  >
                    Télécharger
                  </Button>
                </div>
              ))}
            </div>

          </div>
         
        )}

        {/* ----------------------------- Bouton lancer ----------------------------- */}
        <Button
          onClick={handleSplit}
          disabled={!selectedFile || isProcessing}
          className="w-full"
          size="lg"
        >
          {isProcessing ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Découpage en cours...
            </>
          ) : (
            <>
              <FileText className="w-4 h-4 mr-2" />
              Lancer le découpage
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  )
}
