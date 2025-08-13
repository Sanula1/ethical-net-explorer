import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Login from './Login';
import Dashboard from './Dashboard';
import Users from './Users';
import Students from './Students';
import Parents from './Parents';
import Teachers from './Teachers';
import Classes from './Classes';
import Subjects from './Subjects';
import Attendance from './Attendance';
import AttendanceMarking from './AttendanceMarking';
import AttendanceMarkers from './AttendanceMarkers';
import QRAttendance from './QRAttendance';
import Grading from './Grading';
import LiveLectures from './LiveLectures';
import Homework from './Homework';
import Exams from './Exams';
import Results from './Results';
import Settings from './Settings';
import Profile from './Profile';
import Appearance from './Appearance';
import InstituteDetails from './InstituteDetails';
import InstituteSelector from './InstituteSelector';
import ClassSelector from './ClassSelector';
import SubjectSelector from './SubjectSelector';
import ParentChildrenSelector from './ParentChildrenSelector';
import Institutes from './Institutes';
import TeacherStudents from './TeacherStudents';
import TeacherHomework from './TeacherHomework';
import TeacherExams from './TeacherExams';
import TeacherLectures from './TeacherLectures';
import Lectures from './Lectures';
import Organizations from './Organizations';
import OrganizationSelector from './OrganizationSelector';
import OrganizationCourses from './OrganizationCourses';
import OrganizationLectures from './OrganizationLectures';
import OrganizationSelectorForManager from './OrganizationSelectorForManager';

interface AppContentProps {
  currentPage: string;
  onPageChange: (page: string) => void;
}

const AppContent = ({ currentPage, onPageChange }: AppContentProps) => {
  const { user, selectedInstitute, selectedClass, selectedSubject, selectedChild, selectedOrganization } = useAuth();

  if (!user) {
    return <Login />;
  }

  const userRole = user.role;

  // For OrganizationManager users - handle organization-specific routes
  if (userRole === 'OrganizationManager') {
    switch (currentPage) {
      case 'select-organization':
        return <OrganizationSelectorForManager onOrganizationSelect={(org) => console.log('Organization selected:', org)} />;
      case 'organization-courses':
        return <OrganizationCourses />;
      case 'organization-lectures':
        return <OrganizationLectures />;
      case 'profile':
        return <Profile />;
      case 'appearance':
        return <Appearance />;
      case 'settings':
        return <Settings />;
      case 'dashboard':
      default:
        return <Dashboard />;
    }
  }

  // For all other user roles - existing logic
  switch (currentPage) {
    case 'dashboard':
      if (!selectedInstitute) {
        return <InstituteSelector />;
      }
      return <Dashboard />;

    case 'users':
      return <Users />;

    case 'students':
      return <Students />;

    case 'parents':
      return <Parents />;

    case 'teachers':
      return <Teachers />;

    case 'classes':
      return <Classes />;

    case 'subjects':
      return <Subjects />;

    case 'attendance':
      return <Attendance />;

    case 'attendance-marking':
      return <AttendanceMarking />;

    case 'attendance-markers':
      return <AttendanceMarkers />;

    case 'qr-attendance':
      return <QRAttendance />;

    case 'grading':
      return <Grading />;

    case 'live-lectures':
      return <LiveLectures />;

    case 'homework':
      return <Homework />;

    case 'exams':
      return <Exams />;

    case 'results':
      return <Results />;

    case 'settings':
      return <Settings />;

    case 'profile':
      return <Profile />;

    case 'appearance':
      return <Appearance />;

    case 'institute-details':
      return <InstituteDetails />;

    case 'select-class':
      return <ClassSelector />;

    case 'select-subject':
      return <SubjectSelector />;

    case 'select-children':
      return <ParentChildrenSelector />;

    case 'institutes':
      return <Institutes />;

    case 'organizations':
      return <Organizations />;

    // Teacher-specific routes that require Institute + Class + Subject selection
    case 'teacher-students':
      if (!selectedInstitute || !selectedClass || !selectedSubject) {
        return (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Selection Required
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Please select an Institute, Class, and Subject to view students.
              </p>
            </div>
          </div>
        );
      }
      return <TeacherStudents />;

    case 'teacher-homework':
      if (!selectedInstitute || !selectedClass || !selectedSubject) {
        return (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Selection Required
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Please select an Institute, Class, and Subject to manage homework.
              </p>
            </div>
          </div>
        );
      }
      return <TeacherHomework />;

    case 'teacher-exams':
      if (!selectedInstitute || !selectedClass || !selectedSubject) {
        return (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Selection Required
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Please select an Institute, Class, and Subject to manage exams.
              </p>
            </div>
          </div>
        );
      }
      return <TeacherExams />;

    case 'teacher-lectures':
      if (!selectedInstitute || !selectedClass || !selectedSubject) {
        return (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Selection Required
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Please select an Institute, Class, and Subject to manage lectures.
              </p>
            </div>
          </div>
        );
      }
      return <TeacherLectures />;

    case 'lectures':
      return <Lectures />;

    default:
      if (!selectedInstitute) {
        return <InstituteSelector />;
      }
      return <Dashboard />;
  }
};

export default AppContent;
