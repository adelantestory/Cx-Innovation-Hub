import { useState } from 'react';
import { Fab, Badge } from '@mui/material';
import { HelpOutline } from '@mui/icons-material';
import HelpPanel from './HelpPanel';

interface HelpButtonProps {
  screenContext?: string;
}

export default function HelpButton({ screenContext }: HelpButtonProps) {
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  const handleTogglePanel = () => {
    setIsPanelOpen((prev) => !prev);
  };

  return (
    <>
      <Fab
        color="primary"
        aria-label="help"
        onClick={handleTogglePanel}
        sx={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          zIndex: 1000,
        }}
      >
        <HelpOutline />
      </Fab>

      <HelpPanel
        open={isPanelOpen}
        onClose={() => setIsPanelOpen(false)}
        screenContext={screenContext}
      />
    </>
  );
}
