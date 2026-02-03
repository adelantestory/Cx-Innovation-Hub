import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Card,
  CardContent,
  CardActionArea,
  Grid,
  Avatar,
  Box,
  Chip,
} from '@mui/material';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'PM' | 'Engineer';
  avatarUrl: string;
}

// Hardcoded users from seed data
const users: User[] = [
  {
    id: '1',
    name: 'Sarah Johnson',
    email: 'sarah.johnson@taskify.dev',
    role: 'PM',
    avatarUrl: 'https://i.pravatar.cc/150?img=1',
  },
  {
    id: '2',
    name: 'Alex Chen',
    email: 'alex.chen@taskify.dev',
    role: 'Engineer',
    avatarUrl: 'https://i.pravatar.cc/150?img=2',
  },
  {
    id: '3',
    name: 'Jordan Lee',
    email: 'jordan.lee@taskify.dev',
    role: 'Engineer',
    avatarUrl: 'https://i.pravatar.cc/150?img=3',
  },
  {
    id: '4',
    name: 'Taylor Kim',
    email: 'taylor.kim@taskify.dev',
    role: 'Engineer',
    avatarUrl: 'https://i.pravatar.cc/150?img=4',
  },
  {
    id: '5',
    name: 'Morgan Patel',
    email: 'morgan.patel@taskify.dev',
    role: 'Engineer',
    avatarUrl: 'https://i.pravatar.cc/150?img=5',
  },
];

export default function UserSelection() {
  const navigate = useNavigate();

  const handleUserSelect = (user: User) => {
    // Store current user in localStorage
    localStorage.setItem('currentUserId', user.id);
    localStorage.setItem('currentUserName', user.name);
    localStorage.setItem('currentUserRole', user.role);
    // Navigate to project list
    navigate('/projects');
  };

  return (
    <Container maxWidth="md" sx={{ mt: 8 }}>
      <Typography variant="h3" component="h1" gutterBottom align="center">
        Welcome to Taskify
      </Typography>
      <Typography
        variant="subtitle1"
        gutterBottom
        align="center"
        color="text.secondary"
        sx={{ mb: 4 }}
      >
        Select your profile to continue
      </Typography>

      <Grid container spacing={3}>
        {users.map((user) => (
          <Grid item xs={12} sm={6} key={user.id}>
            <Card elevation={2}>
              <CardActionArea onClick={() => handleUserSelect(user)}>
                <CardContent>
                  <Box display="flex" alignItems="center" gap={2}>
                    <Avatar
                      src={user.avatarUrl}
                      alt={user.name}
                      sx={{ width: 60, height: 60 }}
                    />
                    <Box flex={1}>
                      <Typography variant="h6" component="div">
                        {user.name}
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        gutterBottom
                      >
                        {user.email}
                      </Typography>
                      <Chip
                        label={user.role === 'PM' ? 'Product Manager' : 'Engineer'}
                        size="small"
                        color={user.role === 'PM' ? 'primary' : 'secondary'}
                      />
                    </Box>
                  </Box>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}
