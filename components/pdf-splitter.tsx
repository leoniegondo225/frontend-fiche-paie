'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { FileText, CheckCircle, Loader2, FolderOpen } from 'lucide-react'

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
      // Récupération du fichier
      const response = await fetch(fileUrl)
      if (!response.ok) throw new Error('Erreur lors du téléchargement')

      const blob = await response.blob()

      // Si l'API File System Access est disponible, proposer un emplacement de sauvegarde
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

          // Optionnel : feedback utilisateur
          try { alert(`${filename} sauvegardé.`) } catch (e) { /* ignore */ }
          return
        } catch (err) {
          // Si l'utilisateur annule ou si erreur, on retombe sur le fallback
          console.warn('Sauvegarde via showSaveFilePicker annulée / échouée :', err)
        }
      }

      // Fallback : déclencher un téléchargement via un <a>
      const a = document.createElement('a')
      const url = URL.createObjectURL(blob)

      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()

      // Nettoyage
      a.remove()
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error('Erreur téléchargement :', err)
    }
  }

  /* ---------------------------------------------------- */
  /* Utilitaires d'écriture (File System Access API)     */
  /* ---------------------------------------------------- */
  const downloadFileToDirectory = async (
    fileUrl: string,
    filename: string,
    dirHandle: any
  ) => {
    const res = await fetch(fileUrl);
    if (!res.ok) throw new Error(`Échec du téléchargement: ${res.status}`);
    const blob = await res.blob();

    const fileHandle = await dirHandle.getFileHandle(filename, { create: true });
    const writable = await fileHandle.createWritable();
    await writable.write(blob);
    await writable.close();
  }

  /* ---------------------------------------------------- */
  /* Téléchargement de tous les fichiers                  */
  /* - Essaie d'abord d'ouvrir un choix de dossier        */
  /* - Si indisponible, fallback vers <a download>       */
  /* ---------------------------------------------------- */
  const downloadAll = async () => {
    if (downloadLinks.length === 0) return

    // Si l'API File System est disponible, demander un dossier
    // Note: API disponible typiquement sur les navigateurs Chromium (Chrome, Edge)
    if (typeof (window as any).showDirectoryPicker === 'function') {
      try {
        const dirHandle = await (window as any).showDirectoryPicker()

        for (const file of downloadLinks) {
          try {
            await downloadFileToDirectory(file.url, `${file.matricule}.pdf`, dirHandle)
          } catch (err) {
            console.error('Erreur écriture fichier dans le dossier:', err)
          }
        }

        // Simple feedback à l'utilisateur
        try { alert('Tous les fichiers ont été sauvegardés dans le dossier sélectionné.') } catch (e) { /* ignore */ }
        return
      } catch (err) {
        // L'utilisateur a peut-être annulé le picker ou une erreur est survenue
        console.warn('Sélection de dossier annulée ou erreur:', err)
        // fallback au comportement standard
      }
    }

    // Fallback: déclencher les téléchargements via des liens <a>
    try {
      if (downloadLinks.length > 1) {
        try {
          alert("Votre navigateur ne permet pas de choisir un dossier. Il vous demandera où enregistrer chaque fichier.")
        } catch (e) { /* ignore */ }
      }

      for (const file of downloadLinks) {
        await downloadFile(file.url, `${file.matricule}.pdf`)
        await new Promise(r => setTimeout(r, 300)) // évite le blocage navigateur
      }
    } catch (err) {
      console.error('Erreur lors du téléchargement en fallback :', err)
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

const sendByEmail = async (file: { matricule: string; url: string }) => {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Aucun token trouvé.");
      return;
    }

    const res = await fetch("http://localhost:3600/api/payslips/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        matricule: file.matricule,
        pdfUrl: file.url, // 🔥 ON ENVOIE L’URL DU PDF, PAS UN FICHIER
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      alert("Erreur : " + data.message);
      return;
    }

    alert(`Email envoyé à : ${data.email}`);
  } catch (error) {
    console.error(error);
    alert("Erreur lors de l'envoi du mail.");
  }
};



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
          <div className="flex gap-2">
          <div className='relative flex-1'>
  <FolderOpen className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="C:\Documents\Fiches_pdf"
            value={selectedFile?.name || ''}
            readOnly
            className='pl-10'
          />
          </div>

          <Button
            variant="outline"
            onClick={() => document.getElementById('fileInput')?.click()}
          >
            <FolderOpen className="w-4 h-4 mr-2" />
            Parcourir
          </Button>
          </div>

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
                  Nouveau
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

                 <div className="flex items-center gap-2">

  {/* Bouton Télécharger */}
  <Button
    onClick={() => downloadFile(d.url, `${d.matricule}.pdf`)}
    className="px-3 py-1 text-xs bg-primary text-white rounded hover:bg-primary/80"
  >
    Télécharger
  </Button>

  {/* 🔥 Bouton Envoyer par email */}
  <Button
    onClick={() => sendByEmail(d)}
    className="px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700"
  >
    Envoyer email
  </Button>

</div>

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
