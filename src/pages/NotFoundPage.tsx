import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-4 text-center">
      <p className="text-muted-foreground text-6xl font-bold">404</p>
      <h1 className="text-xl font-semibold">Página no encontrada</h1>
      <p className="text-muted-foreground text-sm">
        La ruta que buscas no existe o no tienes acceso.
      </p>
      <Button asChild>
        <Link to="/">Volver al inicio</Link>
      </Button>
    </div>
  );
}
