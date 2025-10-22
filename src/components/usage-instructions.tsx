"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { FileSpreadsheet, Users, Building2, GraduationCap } from "lucide-react"

export function UsageInstructions() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5" />
            Instructions d'utilisation
          </CardTitle>
          <CardDescription>
            Comment utiliser l'application pour convertir vos fichiers Excel en JSON
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-medium mb-2">Format du fichier Excel</h4>
            <p className="text-sm text-muted-foreground mb-2">
              Votre fichier Excel doit contenir des feuilles avec les colonnes suivantes :
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="border rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="h-4 w-4" />
                  <span className="font-medium text-sm">Étudiants</span>
                </div>
                <div className="text-xs text-muted-foreground space-y-1">
                  <div>• Nom</div>
                  <div>• Prénom</div>
                  <div>• Spécialisation</div>
                  <div>• Société (optionnel)</div>
                  <div>• Encadreur (optionnel)</div>
                  <div>• Email (optionnel)</div>
                  <div>• Téléphone (optionnel)</div>
                  <div>• Statut (optionnel)</div>
                </div>
              </div>
              
              <div className="border rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <Building2 className="h-4 w-4" />
                  <span className="font-medium text-sm">Entreprises</span>
                </div>
                <div className="text-xs text-muted-foreground space-y-1">
                  <div>• Nom/Société</div>
                  <div>• Secteur</div>
                  <div>• Adresse (optionnel)</div>
                  <div>• Contact (optionnel)</div>
                  <div>• Email (optionnel)</div>
                  <div>• Téléphone (optionnel)</div>
                </div>
              </div>
              
              <div className="border rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <GraduationCap className="h-4 w-4" />
                  <span className="font-medium text-sm">Encadreurs</span>
                </div>
                <div className="text-xs text-muted-foreground space-y-1">
                  <div>• Nom</div>
                  <div>• Prénom</div>
                  <div>• Spécialisation</div>
                  <div>• Email (optionnel)</div>
                  <div>• Téléphone (optionnel)</div>
                </div>
              </div>
            </div>
          </div>
          
          {/* <div>
            <h4 className="font-medium mb-2">2. Fonctionnalités</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h5 className="text-sm font-medium mb-1">Importation automatique</h5>
                <p className="text-xs text-muted-foreground">
                  L'application détecte automatiquement le type de données (étudiants, entreprises, encadreurs) 
                  en analysant les en-têtes de colonnes.
                </p>
              </div>
              <div>
                <h5 className="text-sm font-medium mb-1">Recherche et filtrage</h5>
                <p className="text-xs text-muted-foreground">
                  Vous pouvez rechercher dans toutes les données et filtrer par type d'entité.
                </p>
              </div>
              <div>
                <h5 className="text-sm font-medium mb-1">Export JSON</h5>
                <p className="text-xs text-muted-foreground">
                  Les données sont converties en JSON structuré, prêt pour MongoDB avec Mongoose.
                </p>
              </div>
              <div>
                <h5 className="text-sm font-medium mb-1">Prévisualisation</h5>
                <p className="text-xs text-muted-foreground">
                  Visualisez vos données dans des tableaux organisés avant l'export final.
                </p>
              </div>
            </div>
          </div> */}
          
          {/* <div>
            <h4 className="font-medium mb-2">3. Fichiers d'exemple</h4>
            <p className="text-sm text-muted-foreground mb-2">
              Des fichiers d'exemple sont disponibles dans le dossier public pour tester l'application :
            </p>
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">exemple-donnees-etudiants.csv</Badge>
              <Badge variant="secondary">exemple-donnees-entreprises.csv</Badge>
              <Badge variant="secondary">exemple-donnees-encadreurs.csv</Badge>
            </div>
          </div> */}
          
          {/* <div>
            <h4 className="font-medium mb-2">4. Structure JSON générée</h4>
            <p className="text-sm text-muted-foreground mb-2">
              Le JSON généré contient :
            </p>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline">students: Student[]</Badge>
              <Badge variant="outline">companies: Company[]</Badge>
              <Badge variant="outline">supervisors: Supervisor[]</Badge>
              <Badge variant="outline">summary: object</Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Cette structure est optimisée pour l'utilisation avec MongoDB et Mongoose.
            </p>
          </div> */}
        </CardContent>
      </Card>
    </div>
  )
}
