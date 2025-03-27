import React from 'react';
import { Box, Tabs, Tab, Typography } from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';
import TeacherAttendance from './TeacherAttendance';
import TeacherAttendanceReport from './TeacherAttendanceReport';
import StudentAttendance from './StudentAttendance';
import AttendanceHistory from './AttendanceHistory';
import AdminAttendanceReport from './AdminAttendanceReport';

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`attendance-tabpanel-${index}`}
      aria-labelledby={`attendance-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const AttendanceManagement = () => {
  const { user } = useAuth();
  const [tabValue, setTabValue] = React.useState(0);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const renderTeacherTabs = () => (
    <>
      <Tabs value={tabValue} onChange={handleTabChange}>
        <Tab label="Manage Sessions" />
        <Tab label="View Reports" />
      </Tabs>
      <TabPanel value={tabValue} index={0}>
        <TeacherAttendance />
      </TabPanel>
      <TabPanel value={tabValue} index={1}>
        <TeacherAttendanceReport />
      </TabPanel>
    </>
  );

  const renderStudentTabs = () => (
    <>
      <Tabs value={tabValue} onChange={handleTabChange}>
        <Tab label="Mark Attendance" />
        <Tab label="View History" />
      </Tabs>
      <TabPanel value={tabValue} index={0}>
        <StudentAttendance />
      </TabPanel>
      <TabPanel value={tabValue} index={1}>
        <AttendanceHistory />
      </TabPanel>
    </>
  );

  const renderAdminTabs = () => (
    <>
      <Tabs value={tabValue} onChange={handleTabChange}>
        <Tab label="Attendance Reports" />
      </Tabs>
      <TabPanel value={tabValue} index={0}>
        <AdminAttendanceReport />
      </TabPanel>
    </>
  );

  return (
    <Box sx={{ width: '100%' }}>
      <Typography variant="h4" gutterBottom sx={{ p: 3, pb: 0 }}>
        Attendance Management
      </Typography>
      {user?.role === 'teacher' && renderTeacherTabs()}
      {user?.role === 'student' && renderStudentTabs()}
      {user?.role === 'admin' && renderAdminTabs()}
    </Box>
  );
};

export default AttendanceManagement; 