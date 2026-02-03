import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Card,
  CardContent,
  CardActionArea,
  Grid,
  Box,
  Chip,
  CircularProgress,
  Alert,
} from '@mui/material';
import { useProjects } from '../hooks/useProjects';
import HelpButton from '../components/HelpButton';

export default function ProjectList() {
  const navigate = useNavigate();
  const { data: projects, isLoading, error } = useProjects();

  const currentUserName = localStorage.getItem('currentUserName') || 'User';

  if (isLoading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 8, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 8 }}>
        <Alert severity="error">
          Failed to load projects. Please make sure the backend server is running.
        </Alert>
      </Container>
    );
  }

  return (
    <>
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Welcome back, {currentUserName}!
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" gutterBottom sx={{ mb: 4 }}>
          Select a project to view its Kanban board
        </Typography>

        <Grid container spacing={3}>
        {projects?.map((project) => (
          <Grid item xs={12} md={6} key={project.id}>
            <Card elevation={2}>
              <CardActionArea onClick={() => navigate(`/projects/${project.id}/board`)}>
                <CardContent>
                  <Typography variant="h5" component="div" gutterBottom>
                    {project.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    {project.description}
                  </Typography>

                  {project.taskCounts && (
                    <Box display="flex" gap={1} flexWrap="wrap">
                      <Chip
                        label={`To Do: ${project.taskCounts.toDo}`}
                        size="small"
                        variant="outlined"
                      />
                      <Chip
                        label={`In Progress: ${project.taskCounts.inProgress}`}
                        size="small"
                        variant="outlined"
                        color="primary"
                      />
                      <Chip
                        label={`In Review: ${project.taskCounts.inReview}`}
                        size="small"
                        variant="outlined"
                        color="warning"
                      />
                      <Chip
                        label={`Done: ${project.taskCounts.done}`}
                        size="small"
                        variant="outlined"
                        color="success"
                      />
                    </Box>
                  )}
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
        </Grid>
      </Container>

      <HelpButton screenContext="project_list" />
    </>
  );
}
