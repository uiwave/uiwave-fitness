import { Suspense } from 'react';
import { BrowserRouter, Routes } from 'react-router-dom';

import { appRoutes } from './routes';

function RouterLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <span>Cargando...</span>
    </div>
  );
}

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Suspense fallback={<RouterLoading />}>
        <Routes>{appRoutes()}</Routes>
      </Suspense>
    </BrowserRouter>
  );
}
