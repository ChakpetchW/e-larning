import { FILTER_VALUES } from './constants/filters';
import { ENROLLMENT_STATUS } from './constants/statuses';

/**
 * Utility for filtering and sorting courses consistently across the app.
 */
export const filterCourses = (courses, { activeCat = FILTER_VALUES.ALL_LABEL, searchQuery = '', status = 'all' }) => {
  if (!courses) return [];
  
  return courses.filter(c => {
    const matchCat = activeCat === FILTER_VALUES.ALL_LABEL || c.category?.name === activeCat;
    const searchLower = searchQuery.toLowerCase();
    const matchSearch = c.title.toLowerCase().includes(searchLower) || 
                      (c.description && c.description.toLowerCase().includes(searchLower));
    
    // Status Filter
    let matchStatus = true;
    if (status === 'enrolled') {
      matchStatus = c.isEnrolled && c.enrollmentStatus === ENROLLMENT_STATUS.IN_PROGRESS;
    } else if (status === 'completed') {
      matchStatus = c.enrollmentStatus === ENROLLMENT_STATUS.COMPLETED;
    } else if (status === 'not_started') {
      matchStatus = !c.isEnrolled;
    }

    return matchCat && matchSearch && matchStatus;
  });
};

export const sortCourses = (courses, sortBy = 'newest') => {
  if (!courses) return [];
  const sorted = [...courses]; // Avoid mutating original array
  const getDisplayPoints = (course) => course.totalPoints ?? course.points ?? 0;
  
  switch (sortBy) {
    case 'newest':
      return sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    case 'oldest':
      return sorted.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    case 'a-z':
      return sorted.sort((a, b) => a.title.localeCompare(b.title));
    case 'points_desc':
      return sorted.sort((a, b) => getDisplayPoints(b) - getDisplayPoints(a));
    default:
      return sorted;
  }
};
