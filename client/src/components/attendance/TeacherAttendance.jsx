import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  TextField,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Alert
} from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers';
import { Close as CloseIcon } from '@mui/icons-material';
import axios from 'axios';

const TeacherAttendance = () => {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [sessions, setSessions] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [sessionData, setSessionData] = useState({
    startTime: null,
    endTime: null,
    gracePeriodMinutes: 15
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchTeacherCourses();
  }, []);

  useEffect(() => {
    if (selectedCourse) {
      fetchActiveSessions();
    }
  }, [selectedCourse]);

  const fetchTeacherCourses = async () => {
    try {
      const response = await axios.get('/api/course/teacher');
      setCourses(response.data);
    } catch (error) {
      setError('Failed to fetch courses');
    }
  };

  const fetchActiveSessions = async () => {
    try {
      const response = await axios.get(`/api/attendance/course/${selectedCourse}/sessions`);
      setSessions(response.data);
    } catch (error) {
      setError('Failed to fetch active sessions');
    }
  };

  const handleCreateSession = async () => {
    try {
      await axios.post('/api/attendance/session', {
        courseId: selectedCourse,
        ...sessionData
      });
      setSuccess('Attendance session created successfully');
      setOpenDialog(false);
      fetchActiveSessions();
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to create session');
    }
  };

  const handleCloseSession = async (sessionId) => {
    try {
      await axios.put(`/api/attendance/session/${sessionId}/close`);
      setSuccess('Session closed successfully');
      fetchActiveSessions();
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to close session');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'open':
        return 'success';
      case 'closed':
        return 'error';
      case 'expired':
        return 'warning';
      default:
        return 'default';
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Attendance Management
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
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Select Course
              </Typography>
              <TextField
                select
                fullWidth
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
                SelectProps={{
                  native: true
                }}
              >
                <option value="">Select a course</option>
                {courses.map((course) => (
                  <option key={course._id} value={course._id}>
                    {course.name}
                  </option>
                ))}
              </TextField>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6">
                  Active Sessions
                </Typography>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => setOpenDialog(true)}
                  disabled={!selectedCourse}
                >
                  Create New Session
                </Button>
              </Box>

              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Start Time</TableCell>
                      <TableCell>End Time</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Present</TableCell>
                      <TableCell>Absent</TableCell>
                      <TableCell>Late</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {sessions.map((session) => (
                      <TableRow key={session._id}>
                        <TableCell>
                          {new Date(session.startTime).toLocaleString()}
                        </TableCell>
                        <TableCell>
                          {new Date(session.endTime).toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={session.status}
                            color={getStatusColor(session.status)}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>{session.presentCount}</TableCell>
                        <TableCell>{session.absentCount}</TableCell>
                        <TableCell>{session.lateCount}</TableCell>
                        <TableCell>
                          {session.status === 'open' && (
                            <Button
                              variant="outlined"
                              color="error"
                              size="small"
                              onClick={() => handleCloseSession(session._id)}
                            >
                              Close
                            </Button>
                          )}
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
          Create Attendance Session
          <IconButton
            aria-label="close"
            onClick={() => setOpenDialog(false)}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <DateTimePicker
              label="Start Time"
              value={sessionData.startTime}
              onChange={(newValue) => setSessionData({ ...sessionData, startTime: newValue })}
              renderInput={(params) => <TextField {...params} fullWidth sx={{ mb: 2 }} />}
            />
            <DateTimePicker
              label="End Time"
              value={sessionData.endTime}
              onChange={(newValue) => setSessionData({ ...sessionData, endTime: newValue })}
              renderInput={(params) => <TextField {...params} fullWidth sx={{ mb: 2 }} />}
            />
            <TextField
              label="Grace Period (minutes)"
              type="number"
              value={sessionData.gracePeriodMinutes}
              onChange={(e) => setSessionData({ ...sessionData, gracePeriodMinutes: parseInt(e.target.value) })}
              fullWidth
              inputProps={{ min: 0, max: 60 }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleCreateSession} variant="contained" color="primary">
            Create Session
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TeacherAttendance; 