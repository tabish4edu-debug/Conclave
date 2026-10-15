import React from 'react';
import { useStudio } from '../../context/StudioContext';
import { Sliders, Eye, ExternalLink, CheckCircle } from 'lucide-react';

export const CmsPreviewDock: React.FC = () => {
  const { activePage, setActivePage, isAdminLoggedIn } = useStudio();
  const isCms = activePage === 'admin';

  // Only display the preview toggle if the administrator is actively authenticated
  if (!isAdminLoggedIn) {
    return null;
  }

  return (
    <aside
      aria-label="Admin & Live View Controls"
      className="fixed bottom-4 left-4 z-50 flex items-center gap-2 bg-[#18191B]/95 backdrop-blur-md border border-[#3A3C3E] p-1.5 shadow-2xl transition-all duration-300"
    >
      <div className="flex items-center gap-2 px-2.5 py-1 text-[11px] font-mono">
        <span className="w-2 h-2 rounded-full bg-[#B08D57] animate-pulse"></span>
        <span className="text-[#F2EEE7] font-semibold tracking-wider uppercase">
          {isCms ? 'Admin Portal' : 'Live Website'}
        </span>
      </div>

      <div className="h-4 w-px bg-[#3A3C3E]" />

      {isCms ? (
        <button
          onClick={() => {
            localStorage.setItem('conclave_active_view', 'home');
            window.location.hash = '#home';
            setActivePage('home');
          }}
          className="flex items-center gap-1.5 px-3 py-1 bg-[#222222] hover:bg-[#2B2D2F] text-[#F2EEE7] hover:text-white border border-white/10 text-[11px] font-mono tracking-wider uppercase transition-colors cursor-pointer"
          title="Switch to Live Public Website"
        >
          <Eye className="w-3.5 h-3.5 text-[#B08D57]" />
          <span>View Website</span>
        </button>
      ) : (
        <button
          onClick={() => {
            localStorage.setItem('conclave_active_view', 'admin');
            window.location.hash = '#admin';
            setActivePage('admin');
          }}
          className="flex items-center gap-1.5 px-3 py-1 bg-[#B08D57] hover:bg-[#9A7844] text-[#202124] font-semibold text-[11px] font-mono tracking-wider uppercase transition-colors cursor-pointer"
          title="Open Admin Console"
        >
          <Sliders className="w-3.5 h-3.5 text-[#202124]" />
          <span>Open Admin Console</span>
        </button>
      )}
    </aside>
  );
};
