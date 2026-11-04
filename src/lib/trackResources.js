import { matchesGrade } from './grades.js'

export function isPublishedTrackItem(item) {
  const flag = item.publish ?? item.published
  return flag == null || flag === true || flag === 1 || flag === 'true'
}

export function visibleTrackResources(courses, userGrade) {
  return courses.filter((course) => isPublishedTrackItem(course) && matchesGrade(userGrade, course.grade))
}
