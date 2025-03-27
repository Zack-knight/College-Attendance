import React, { useState, useEffect } from 'react';
import {
  Box,
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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { Close as CloseIcon } from '@mui/icons-material';
import axios from 'axios';

const TeacherAttendanceReport = () => {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    if (selectedCourse && startDate && endDate) {
      fetchAttendanceRecords();
    }
  }, [selectedCourse, startDate, endDate]);

  const fetchCourses = async () => {
    try {
      const response = await axios.get('/api/course/teacher');
      setCourses(response.data);
    } catch (error) {
      setError('Failed to fetch courses');
    }
  };

  const fetchAttendanceRecords = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/attendance/course/${selectedCourse}`, {
        params: {
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString()
        }
      });
      setAttendanceRecords(response.data.records);
      setStatistics(response.data.statistics);
    } catch (error) {
      setError('Failed to fetch attendance records');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (status) => {
    try {
      await axios.put(`/api/attendance/${selectedRecord._id}/verify`, {
        verificationStatus: status
      });
      setOpenDialog(false);
      fetchAttendanceRecords();
    } catch (error) {
      setError('Failed to update attendance status');
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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString();
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Attendance Report
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <FormControl fullWidth>
            <InputLabel>Select Course</InputLabel>
            <Select
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              label="Select Course"
            >
              {courses.map((course) => (
                <MenuItem key={course._id} value={course._id}>
                  {course.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} md={4}>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DatePicker
              label="Start Date"
              value={startDate}
              onChange={setStartDate}
              renderInput={(params) => <TextField {...params} fullWidth />}
            />
          </LocalizationProvider>
        </Grid>

        <Grid item xs={12} md={4}>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DatePicker
              label="End Date"
              value={endDate}
              onChange={setEndDate}
              renderInput={(params) => <TextField {...params} fullWidth />}
            />
          </LocalizationProvider>
        </Grid>

        {statistics && (
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Course Statistics
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={3}>
                    <Typography variant="subtitle2">Total Students</Typography>
                    <Typography variant="h4">{statistics.totalStudents}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={3}>
                    <Typography variant="subtitle2">Average Attendance</Typography>
                    <Typography variant="h4">{statistics.averageAttendance}%</Typography>
                  </Grid>
                  <Grid item xs={12} sm={3}>
                    <Typography variant="subtitle2">Present Today</Typography>
                    <Typography variant="h4">{statistics.presentToday}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={3}>
                    <Typography variant="subtitle2">Absent Today</Typography>
                    <Typography variant="h4">{statistics.absentToday}</Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        )}

        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Attendance Records
              </Typography>

              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                  <CircularProgress />
                </Box>
              ) : (
                <TableContainer component={Paper}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Student</TableCell>
                        <TableCell>Date</TableCell>
                        <TableCell>Time</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Verification</TableCell>
                        <TableCell>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {attendanceRecords.map((record) => (
                        <TableRow key={record._id}>
                          <TableCell>{record.student.name}</TableCell>
                          <TableCell>{formatDate(record.date)}</TableCell>
                          <TableCell>{formatTime(record.date)}</TableCell>
                          <TableCell>
                            <Chip
                              label={record.status}
                              color={getStatusColor(record.status)}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={record.verificationStatus}
                              color={record.verificationStatus === 'Verified' ? 'success' : 'error'}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="outlined"
                              size="small"
                              onClick={() => {
                                setSelectedRecord(record);
                                setOpenDialog(true);
                              }}
                            >
                              Verify
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          Verify Attendance
          <IconButton
            aria-label="close"
            onClick={() => setOpenDialog(false)}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          {selectedRecord && (
            <Box sx={{ pt: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                Student: {selectedRecord.student.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Date: {formatDate(selectedRecord.date)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Time: {formatTime(selectedRecord.date)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Status: {selectedRecord.status}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button
            onClick={() => handleUpdateStatus('Rejected')}
            variant="contained"
            color="error"
          >
            Reject
          </Button>
          <Button
            onClick={() => handleUpdateStatus('Verified')}
            variant="contained"
            color="success"
          >
            Verify
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TeacherAttendanceReport; 