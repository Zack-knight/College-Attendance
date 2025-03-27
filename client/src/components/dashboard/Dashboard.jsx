import { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  CardHeader,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  CircularProgress
} from '@mui/material';
import {
  Event as EventIcon,
  School as SchoolIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';

const Dashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await axios.get('/api/dashboard', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setDashboardData(response.data);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const getRoleSpecificContent = () => {
    if (!dashboardData) return null;

    switch (user?.role) {
      case 'student':
        return (
          <>
            <Grid xs={12} sm={6}>
              <Card>
                <CardHeader title="My Courses" />
                <CardContent>
                  {loading ? (
                    <Box display="flex" justifyContent="center" p={2}>
                      <CircularProgress />
                    </Box>
                  ) : (
                    <List>
                      {dashboardData.courses.map((course) => (
                        <ListItem key={course._id}>
                          <ListItemIcon>
                            <SchoolIcon />
                          </ListItemIcon>
                          <ListItemText
                            primary={course.name}
                            secondary={`Code: ${course.code}`}
                          />
                        </ListItem>
                      ))}
                    </List>
                  )}
                </CardContent>
              </Card>
            </Grid>
            <Grid xs={12} sm={6}>
              <Card>
                <CardHeader title="Recent Attendance" />
                <CardContent>
                  {loading ? (
                    <Box display="flex" justifyContent="center" p={2}>
                      <CircularProgress />
                    </Box>
                  ) : (
                    <List>
                      {dashboardData.recentAttendance.map((record) => (
                        <ListItem key={record._id}>
                          <ListItemIcon>
                            {record.status === 'present' ? (
                              <CheckCircleIcon color="success" />
                            ) : (
                              <CancelIcon color="error" />
                            )}
                          </ListItemIcon>
                          <ListItemText
                            primary={new Date(record.date).toLocaleDateString()}
                            secondary={`Status: ${record.status}`}
                          />
                        </ListItem>
                      ))}
                    </List>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </>
        );

      case 'teacher':
        return (
          <>
            <Grid xs={12} sm={6}>
              <Card>
                <CardHeader title="My Courses" />
                <CardContent>
                  {loading ? (
                    <Box display="flex" justifyContent="center" p={2}>
                      <CircularProgress />
                    </Box>
                  ) : (
                    <List>
                      {dashboardData.courses.map((course) => (
                        <ListItem key={course._id}>
                          <ListItemIcon>
                            <SchoolIcon />
                          </ListItemIcon>
                          <ListItemText
                            primary={course.name}
                            secondary={`Code: ${course.code} | Students: ${course.students.length}`}
                          />
                        </ListItem>
                      ))}
                    </List>
                  )}
                </CardContent>
              </Card>
            </Grid>
            <Grid xs={12} sm={6}>
              <Card>
                <CardHeader title="Active Sessions" />
                <CardContent>
                  {loading ? (
                    <Box display="flex" justifyContent="center" p={2}>
                      <CircularProgress />
                    </Box>
                  ) : (
                    <List>
                      {dashboardData.activeSessions.map((session) => (
                        <ListItem key={session._id}>
                          <ListItemIcon>
                            <EventIcon />
                          </ListItemIcon>
                          <ListItemText
                            primary={session.course.name}
                            secondary={`Started: ${new Date(session.startTime).toLocaleString()}`}
                          />
                        </ListItem>
                      ))}
                    </List>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </>
        );

      case 'admin':
        return (
          <>
            <Grid xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography variant="h6">Total Students</Typography>
                  <Typography variant="h4">{dashboardData.statistics.totalStudents}</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography variant="h6">Total Teachers</Typography>
                  <Typography variant="h4">{dashboardData.statistics.totalTeachers}</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography variant="h6">Total Courses</Typography>
                  <Typography variant="h4">{dashboardData.statistics.totalCourses}</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography variant="h6">Active Sessions</Typography>
                  <Typography variant="h4">{dashboardData.statistics.activeSessionsCount}</Typography>
                </CardContent>
              </Card>
            </Grid>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={3}>
        <Grid xs={12}>
          <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
            <Typography component="h1" variant="h4" gutterBottom>
              Welcome, {user?.name}!
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              {user?.role.charAt(0).toUpperCase() + user?.role.slice(1)} Dashboard
            </Typography>
          </Paper>
        </Grid>
        {getRoleSpecificContent()}
      </Grid>
    </Container>
  );
};

export default Dashboard; 