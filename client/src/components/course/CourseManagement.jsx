import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Grid,
  Button,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  MenuItem,
  Chip,
  FormControl,
  InputLabel,
  Select,
  FormHelperText
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Group as GroupIcon
} from '@mui/icons-material';
import axios from 'axios';

const CourseManagement = () => {
  const [courses, setCourses] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    department: '',
    description: '',
    schedule: {
      day: '',
      startTime: '',
      endTime: '',
      room: ''
    },
    semester: '',
    maxStudents: ''
  });

  useEffect(() => {
    fetchCourses();
    fetchDepartments();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/courses', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setCourses(response.data);
    } catch (error) {
      setError('Failed to fetch courses');
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/departments', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      console.log('Fetched departments:', response.data);
      setDepartments(response.data);
    } catch (error) {
      console.error('Error fetching departments:', error);
      setError('Failed to fetch departments. Please refresh the page.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (course = null) => {
    if (course) {
      setEditingCourse(course);
      setFormData({
        name: course.name,
        code: course.code,
        department: course.department,
        description: course.description || '',
        schedule: course.schedule || {
          day: '',
          startTime: '',
          endTime: '',
          room: ''
        },
        semester: course.semester,
        maxStudents: course.maxStudents
      });
    } else {
      setEditingCourse(null);
      setFormData({
        name: '',
        code: '',
        department: '',
        description: '',
        schedule: {
          day: '',
          startTime: '',
          endTime: '',
          room: ''
        },
        semester: '',
        maxStudents: ''
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingCourse(null);
    setFormData({
      name: '',
      code: '',
      department: '',
      description: '',
      schedule: {
        day: '',
        startTime: '',
        endTime: '',
        room: ''
      },
      semester: '',
      maxStudents: ''
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('schedule.')) {
      const scheduleField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        schedule: {
          ...prev.schedule,
          [scheduleField]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      setLoading(true);
      
      // Format the data before sending
      const courseData = {
        ...formData,
        semester: parseInt(formData.semester),
        maxStudents: parseInt(formData.maxStudents),
        schedule: {
          ...formData.schedule,
          startTime: formData.schedule.startTime.trim(),
          endTime: formData.schedule.endTime.trim()
        }
      };

      console.log('Sending course data:', courseData);

      if (editingCourse) {
        await axios.put(
          `/api/courses/${editingCourse._id}`,
          courseData,
          {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
          }
        );
        setSuccess('Course updated successfully');
      } else {
        await axios.post('/api/courses', courseData, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setSuccess('Course created successfully');
      }
      handleCloseDialog();
      fetchCourses();
    } catch (error) {
      console.error('Course submission error:', error.response?.data);
      if (error.response?.data?.errors) {
        // Handle validation errors
        const errorMessages = error.response.data.errors.map(err => err.msg).join(', ');
        setError(errorMessages);
      } else {
        setError(error.response?.data?.error || 'Failed to save course');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this course?')) {
      try {
        setLoading(true);
        await axios.delete(`/api/courses/${id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setSuccess('Course deleted successfully');
        fetchCourses();
      } catch (error) {
        setError(error.response?.data?.message || 'Failed to delete course');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
          <Typography variant="h4">Course Management</Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
          >
            Add Course
          </Button>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Code</TableCell>
                <TableCell>Department</TableCell>
                <TableCell>Instructor</TableCell>
                <TableCell>Schedule</TableCell>
                <TableCell>Capacity</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : courses.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    No courses found
                  </TableCell>
                </TableRow>
              ) : (
                courses.map((course) => (
                  <TableRow key={course._id}>
                    <TableCell>{course.name}</TableCell>
                    <TableCell>{course.code}</TableCell>
                    <TableCell>{course.department}</TableCell>
                    <TableCell>{course.instructor}</TableCell>
                    <TableCell>
                      {course.schedule ? `${course.schedule.day} ${course.schedule.startTime}-${course.schedule.endTime} (${course.schedule.room})` : 'N/A'}
                    </TableCell>
                    <TableCell>
                      <Chip
                        icon={<GroupIcon />}
                        label={`${course.students?.length || 0}/${course.maxStudents}`}
                        color={(course.students?.length || 0) >= course.maxStudents ? 'error' : 'success'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton
                        color="primary"
                        onClick={() => handleOpenDialog(course)}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        color="error"
                        onClick={() => handleDelete(course._id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
          <DialogTitle>
            {editingCourse ? 'Edit Course' : 'Add New Course'}
          </DialogTitle>
          <DialogContent>
            <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
              <Grid container spacing={2}>
                <Grid xs={12}>
                  <TextField
                    fullWidth
                    label="Course Name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </Grid>
                <Grid xs={12}>
                  <TextField
                    fullWidth
                    label="Course Code"
                    name="code"
                    value={formData.code}
                    onChange={handleChange}
                    required
                    helperText="3-10 characters, uppercase letters and numbers only"
                  />
                </Grid>
                <Grid xs={12}>
                  <FormControl fullWidth required error={!formData.department}>
                    <InputLabel>Department</InputLabel>
                    <Select
                      name="department"
                      value={formData.department}
                      onChange={handleChange}
                      label="Department"
                    >
                      {departments.length === 0 ? (
                        <MenuItem disabled>No departments available</MenuItem>
                      ) : (
                        departments.map((dept) => (
                          <MenuItem key={dept._id} value={dept._id}>
                            {dept.name}
                          </MenuItem>
                        ))
                      )}
                    </Select>
                    {!formData.department && (
                      <FormHelperText error>Department is required</FormHelperText>
                    )}
                  </FormControl>
                </Grid>
                <Grid xs={12}>
                  <TextField
                    fullWidth
                    label="Description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    multiline
                    rows={3}
                  />
                </Grid>
                <Grid xs={12}>
                  <FormControl fullWidth required>
                    <InputLabel>Schedule Day</InputLabel>
                    <Select
                      name="schedule.day"
                      value={formData.schedule.day}
                      onChange={handleChange}
                      label="Schedule Day"
                    >
                      <MenuItem value="Monday">Monday</MenuItem>
                      <MenuItem value="Tuesday">Tuesday</MenuItem>
                      <MenuItem value="Wednesday">Wednesday</MenuItem>
                      <MenuItem value="Thursday">Thursday</MenuItem>
                      <MenuItem value="Friday">Friday</MenuItem>
                      <MenuItem value="Saturday">Saturday</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid xs={6}>
                  <TextField
                    fullWidth
                    label="Start Time"
                    name="schedule.startTime"
                    value={formData.schedule.startTime}
                    onChange={handleChange}
                    required
                    helperText="Format: HH:MM"
                  />
                </Grid>
                <Grid xs={6}>
                  <TextField
                    fullWidth
                    label="End Time"
                    name="schedule.endTime"
                    value={formData.schedule.endTime}
                    onChange={handleChange}
                    required
                    helperText="Format: HH:MM"
                  />
                </Grid>
                <Grid xs={12}>
                  <TextField
                    fullWidth
                    label="Room"
                    name="schedule.room"
                    value={formData.schedule.room}
                    onChange={handleChange}
                    required
                  />
                </Grid>
                <Grid xs={6}>
                  <TextField
                    fullWidth
                    label="Semester"
                    name="semester"
                    type="number"
                    value={formData.semester}
                    onChange={handleChange}
                    required
                    inputProps={{ min: 1, max: 8 }}
                  />
                </Grid>
                <Grid xs={6}>
                  <TextField
                    fullWidth
                    label="Maximum Students"
                    name="maxStudents"
                    type="number"
                    value={formData.maxStudents}
                    onChange={handleChange}
                    required
                    inputProps={{ min: 1 }}
                  />
                </Grid>
              </Grid>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button
              onClick={handleSubmit}
              variant="contained"
              disabled={loading || !formData.department}
            >
              {loading ? <CircularProgress size={24} /> : 'Save'}
            </Button>
          </DialogActions>
        </Dialog>
      </Paper>
    </Container>
  );
};

export default CourseManagement; 