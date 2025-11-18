'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { FolderOpen, Mail, CheckCircle, Loader2, Clock, Users } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

// Données fictives d'employés
const MOCK_EMPLOYEES = [
  { matricule: 'EMP001', nom: 'Dupont', prenom: 'Jean', email: 'jean.dupont@example.com' },
  { matricule: 'EMP002', nom: 'Martin', prenom: 'Sophie', email: 'sophie.martin@example.com' },
  { matricule: 'EMP003', nom: 'Bernard', prenom: 'Pierre', email: 'pierre.bernard@example.com' },
  { matricule: 'EMP004', nom: 'Dubois', prenom: 'Marie', email: 'marie.dubois@example.com' },
  { matricule: 'EMP005', nom: 'Laurent', prenom: 'Luc', email: 'luc.laurent@example.com' },
]

export function EmailSender() {
  const [folderPath, setFolderPath] = useState('')
  const [emailSubject, setEmailSubject] = useState('Votre fiche de paie')
  const [emailBody, setEmailBody] = useState('Bonjour,\n\nVeuillez trouver ci-joint votre fiche de paie.\n\nCordialement,\nService RH')
  const [scheduleSend, setScheduleSend] = useState(false)
  const [scheduleDate, setScheduleDate] = useState('')
  const [scheduleTime, setScheduleTime] = useState('')
  const [sendMode, setSendMode] = useState<'all' | 'individual'>('all')
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [success, setSuccess] = useState(false)
  const [emailsSent, setEmailsSent] = useState(0)

  const handleSend = async () => {
    if (!folderPath) {
      return
    }

    setIsProcessing(true)
    setSuccess(false)
    setProgress(0)
    setEmailsSent(0)

    // Simulation de l'envoi
    const totalEmails = MOCK_EMPLOYEES.length
    for (let i = 1; i <= totalEmails; i++) {
      await new Promise(resolve => setTimeout(resolve, 500))
      setProgress((i / totalEmails) * 100)
      setEmailsSent(i)
    }

    setIsProcessing(false)
    setSuccess(true)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Envoi par email</CardTitle>
          <CardDescription>
            Envoyez les fiches de paie par email de manière individuelle ou groupée
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email-folder">Dossier contenant les fichiers PDF</Label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <FolderOpen className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email-folder"
                  placeholder="C:\Documents\Fiches_Decoupees"
                  value={folderPath}
                  onChange={(e) => setFolderPath(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button variant="outline">
                <FolderOpen className="w-4 h-4 mr-2" />
                Parcourir
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="send-mode">Mode d{"'"}envoi</Label>
            <Select value={sendMode} onValueChange={(value: 'all' | 'individual') => setSendMode(value)}>
              <SelectTrigger id="send-mode">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Envoi groupé (tous les employés)</SelectItem>
                <SelectItem value="individual">Envoi individuel (sélection)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="subject">Objet de l{"'"}email</Label>
            <Input
              id="subject"
              value={emailSubject}
              onChange={(e) => setEmailSubject(e.target.value)}
              placeholder="Objet de l'email"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="body">Corps du message</Label>
            <Textarea
              id="body"
              value={emailBody}
              onChange={(e) => setEmailBody(e.target.value)}
              placeholder="Contenu de l'email"
              rows={6}
            />
          </div>

          <div className="bg-muted/50 border border-border rounded-lg p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="schedule" className="text-base">
                  Programmer l{"'"}envoi
                </Label>
                <p className="text-sm text-muted-foreground">
                  Planifier l{"'"}envoi pour une date et heure ultérieure
                </p>
              </div>
              <Switch
                id="schedule"
                checked={scheduleSend}
                onCheckedChange={setScheduleSend}
              />
            </div>

            {scheduleSend && (
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="space-y-2">
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={scheduleDate}
                    onChange={(e) => setScheduleDate(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="time">Heure</Label>
                  <Input
                    id="time"
                    type="time"
                    value={scheduleTime}
                    onChange={(e) => setScheduleTime(e.target.value)}
                  />
                </div>
              </div>
            )}
          </div>

          {isProcessing && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Envoi en cours...</span>
                <span className="font-medium text-foreground">{emailsSent} / {MOCK_EMPLOYEES.length} emails envoyés</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          )}

          {success && (
            <Alert className="border-accent/50 bg-accent/10">
              <CheckCircle className="h-4 w-4 text-accent" />
              <AlertDescription className="text-accent-foreground">
                {scheduleSend 
                  ? `Envoi programmé pour le ${scheduleDate} à ${scheduleTime}. ${emailsSent} emails seront envoyés.`
                  : `Envoi terminé ! ${emailsSent} emails ont été envoyés avec succès.`}
              </AlertDescription>
            </Alert>
          )}

          <Button
            onClick={handleSend}
            disabled={!folderPath || isProcessing || (scheduleSend && (!scheduleDate || !scheduleTime))}
            className="w-full"
            size="lg"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Envoi en cours...
              </>
            ) : scheduleSend ? (
              <>
                <Clock className="w-4 h-4 mr-2" />
                Programmer l{"'"}envoi
              </>
            ) : (
              <>
                <Mail className="w-4 h-4 mr-2" />
                Envoyer maintenant
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Aperçu des destinataires
            <Badge variant="secondary">{MOCK_EMPLOYEES.length}</Badge>
          </CardTitle>
          <CardDescription>
            Liste des employés qui recevront leur fiche de paie
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {MOCK_EMPLOYEES.map((employee) => (
              <div key={employee.matricule} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg border border-border">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center">
                    <span className="text-sm font-medium text-accent">{employee.prenom.charAt(0)}{employee.nom.charAt(0)}</span>
                  </div>
                  <div>
                    <p className="font-medium text-sm text-foreground">{employee.prenom} {employee.nom}</p>
                    <p className="text-xs text-muted-foreground">{employee.email}</p>
                  </div>
                </div>
                <Badge variant="outline" className="font-mono text-xs">
                  {employee.matricule}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
