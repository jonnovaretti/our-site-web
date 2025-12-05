import React, { Suspense, lazy } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import Navbar from './components/navbar.component';

const DashboardView = lazy(() => import('./views/dashboard.view'));
const ProjectsView = lazy(() => import('./views/projects.view'));
const NewProjectView = lazy(() => import('./views/new-project.view'));

function App() {
  return (
    <div className="grid min-h-screen grid-cols-[18rem_1fr] bg-gray-50 text-slate-900">
      <Navbar />
      <main className="flex flex-col bg-gray-50 p-8">
        <Suspense fallback={<div className="text-slate-600">Loading...</div>}>
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<DashboardView />} />
            <Route path="/projects" element={<ProjectsView />} />
            <Route path="/projects/new" element={<NewProjectView />} />
          </Routes>
        </Suspense>
      </main>
    </div>
  );
}

export default App;
