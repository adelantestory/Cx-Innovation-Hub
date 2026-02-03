import { useNavigate } from 'react-router-dom';
import { AppBar, Toolbar, Typography, IconButton, Box } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

interface NavigationBarProps {
  title: string;
  showBackButton?: boolean;
}

export default function NavigationBar({ title, showBackButton = true }: NavigationBarProps) {
  const navigate = useNavigate();

  return (
    <AppBar position="static">
      <Toolbar>
        {showBackButton && (
          <IconButton
            edge="start"
            color="inherit"
            aria-label="back"
            onClick={() => navigate('/projects')}
            sx={{ mr: 2 }}
          >
            <ArrowBackIcon />
          </IconButton>
        )}
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          {title}
        </Typography>
        <Box>
          <Typography variant="body2">
            {localStorage.getItem('currentUserName') || 'User'}
          </Typography>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
