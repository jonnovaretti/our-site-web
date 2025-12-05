import React from 'react';
import { NavLink } from 'react-router-dom';

const linkBaseClasses =
  'flex items-center gap-3 rounded-lg px-4 py-2 text-sm font-medium transition hover:bg-indigo-50 hover:text-indigo-700';

function Navbar() {
  return (
    <aside className="h-full w-full bg-white shadow-sm">
      <div className="flex h-full flex-col border-r border-slate-200 p-4">
        <div className="mb-6 text-lg font-semibold text-indigo-700">Our Site</div>
        <nav className="space-y-2 text-slate-700">
          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              `${linkBaseClasses} ${isActive ? 'bg-indigo-100 text-indigo-800' : ''}`
            }
          >
            <span>Dashboard</span>
          </NavLink>
          <NavLink
            to="/projects"
            className={({ isActive }) =>
              `${linkBaseClasses} ${isActive ? 'bg-indigo-100 text-indigo-800' : ''}`
            }
          >
            <span>Projects</span>
          </NavLink>
          <NavLink
            to="/projects/new"
            className={({ isActive }) =>
              `${linkBaseClasses} ${isActive ? 'bg-indigo-100 text-indigo-800' : ''}`
            }
          >
            <span>New Project</span>
          </NavLink>
        </nav>
      </div>
    </aside>
  );
}

export default Navbar;
