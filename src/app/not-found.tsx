import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ChefHat, Home, ArrowLeft } from "lucide-react"

export default function NotFound() {
  return (
    <div className="min-h-screen bg-primary text-primary-foreground flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 left-10 w-64 h-64 bg-secondary rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent rounded-full blur-3xl" />
      </div>

      <div className="max-w-2xl w-full relative z-10">
        <div className="text-center space-y-8">
          {/* Icon */}
          <div className="flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 bg-secondary blur-2xl rounded-full scale-150 opacity-30 animate-pulse" />
              <div className="relative bg-secondary/20 backdrop-blur-sm p-8 rounded-full border border-secondary/30">
                <ChefHat className="w-20 h-20 text-secondary" strokeWidth={1.5} />
              </div>
            </div>
          </div>

          {/* 404 */}
          <div className="space-y-4">
            <h1 className="text-8xl md:text-9xl font-bold tracking-tighter text-balance">404</h1>
            <div className="h-1 w-24 mx-auto bg-gradient-to-r from-transparent via-secondary to-transparent" />
          </div>

          {/* Message */}
          <div className="space-y-4">
            <h2 className="text-2xl md:text-3xl font-semibold text-balance leading-tight">
              On le prépare dans notre cuisine interne
            </h2>
            <p className="text-lg text-primary-foreground/70 max-w-md mx-auto text-pretty leading-relaxed">
              Cette page est en cours de préparation par nos chefs. Elle sera bientôt prête à être servie.
            </p>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
            <Button
              asChild
              size="lg"
              className="bg-secondary hover:bg-secondary/90 text-secondary-foreground font-medium px-8 shadow-lg shadow-secondary/20 transition-all hover:shadow-xl hover:shadow-secondary/30 hover:scale-105"
            >
              <Link href="/dashboard">
                <Home className="w-5 h-5 mr-2" />
                Retour à l'accueil
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-primary-foreground/20 hover:bg-primary-foreground/10 hover:border-primary-foreground/30 font-medium px-8 transition-all bg-transparent"
            >
              <Link href="javascript:history.back()">
                <ArrowLeft className="w-5 h-5 mr-2" />
                Page précédente
              </Link>
            </Button>
          </div>

          {/* Footer note */}
          <div className="pt-8">
            <p className="text-sm text-primary-foreground/50 text-pretty">
              Si vous pensez qu'il s'agit d'une erreur, n'hésitez pas à nous contacter.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
