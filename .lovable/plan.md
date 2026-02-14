

## Problem

Course/subject pages fail to load when navigated from the dashboard because of an **ID vs slug mismatch**.

The route `/university/:universityId/:courseId/:semesterId/:subjectId` expects **slugs** in the URL parameters. Both `UniversityPage` and `SubjectPage` query the database using `.eq('slug', paramValue)`. However, the dashboard constructs URLs using **UUIDs** (e.g., `profile.university_id`, `subject.id`), which don't match any slug and return no data.

## Fix

Update the Dashboard to fetch and use **slugs** instead of UUIDs when building navigation URLs.

### Steps

1. **Update the subjects query in `Dashboard.tsx`** to also fetch related semester, course, and university slugs -- or store the university/course/semester slugs from the profile data.

2. **Store slugs from the profile's related entities.** The profile already fetches `university`, `course`, and `semester` objects (via `useProfile`). Extract their slugs and pass them to `IntelligentSubjectCard` instead of UUIDs.

3. **Update `IntelligentSubjectCard`** to use slugs for URL construction:
   - Change `universityId` prop to use the university slug
   - Change `courseId` prop to use the course slug  
   - Change `semesterId` prop to use the semester slug
   - Change `subject.id` to `subject.slug` in the URL path

4. **Verify `useProfile` hook** returns slug fields on the related university, course, and semester objects. If not, update the query to include them.

### Technical Details

**File: `src/pages/Dashboard.tsx`**
- Change props passed to `IntelligentSubjectCard` from UUIDs to slugs:
  - `universityId={profile.university?.slug}` instead of `profile.university_id`
  - `courseId={profile.course?.slug}` instead of `profile.course_id`
  - `semesterId={profile.semester?.slug}` instead of `profile.semester_id`

**File: `src/components/dashboard/IntelligentSubjectCard.tsx`**
- Change URL construction to use `subject.slug` instead of `subject.id`:
  ```
  /university/${universityId}/${courseId}/${semesterId}/${subject.slug}
  ```

**File: `src/hooks/useProfile.tsx`** (if needed)
- Verify the profile query includes `slug` fields on the joined university, course, and semester records. If missing, update the select query.

**Other dashboard components** that build similar URLs (e.g., `TodaysFocusCard`, `DashboardRightSidebar`) will also need the same slug-based fix applied.

