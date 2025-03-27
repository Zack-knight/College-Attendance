import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import axios from 'axios';

const StudentAttendance = () => {
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [activeSessions, setActiveSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);

  useEffect(() => {
    fetchEnrolledCourses();
  }, []);

  const fetchEnrolledCourses = async () => {
    try {
      const response = await axios.get('/api/course/student');
      setEnrolledCourses(response.data);
      // Fetch active sessions for each course
      const sessionsPromises = response.data.map(course =>
        axios.get(`/api/attendance/course/${course._id}/sessions`)
      );
      const sessionsResponses = await Promise.all(sessionsPromises);
      const allSessions = sessionsResponses.flatMap(response => response.data);
      setActiveSessions(allSessions.filter(session => session.status === 'open'));
    } catch (error) {
      setError('Failed to fetch courses and sessions');
    }
  };

  const handleMarkAttendance = async (status) => {
    try {
      setLoading(true);
      await axios.post('/api/attendance/mark', {
        sessionId: selectedSession._id,
        status
      });
      setSuccess('Attendance marked successfully');
      setOpenDialog(false);
      fetchEnrolledCourses(); // Refresh sessions
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to mark attendance');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Present':
        return 'success';
      case 'Late':
        return 'warning';
      case 'Absent':
        return 'error';
      default:
        return 'default';
    }
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Mark Attendance
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      <Grid container spacing={3}>
        <Grid xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Active Attendance Sessions
              </Typography>

              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Course</TableCell>
                      <TableCell>Start Time</TableCell>
                      <TableCell>End Time</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {activeSessions.map((session) => (
                      <TableRow key={session._id}>
                        <TableCell>{session.course.name}</TableCell>
                        <TableCell>{formatTime(session.startTime)}</TableCell>
                        <TableCell>{formatTime(session.endTime)}</TableCell>
                        <TableCell>
                          <Chip
                            label={session.status}
                            color="success"
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="contained"
                            color="primary"
                            onClick={() => {
                              setSelectedSession(session);
                              setOpenDialog(true);
                            }}
                          >
                            Mark Attendance
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          Mark Attendance
          <IconButton
            aria-label="close"
            onClick={() => setOpenDialog(false)}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          {selectedSession && (
            <Box sx={{ pt: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                Course: {selectedSession.course.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Start Time: {formatTime(selectedSession.startTime)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                End Time: {formatTime(selectedSession.endTime)}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button
            onClick={() => handleMarkAttendance('Present')}
            variant="contained"
            color="success"
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Mark Present'}
          </Button>
          <Button
            onClick={() => handleMarkAttendance('Absent')}
            variant="contained"
            color="error"
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Mark Absent'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default StudentAttendance; 