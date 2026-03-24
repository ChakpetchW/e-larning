const categories = [{"id":"5ec3aa5e-ec9d-4efd-a544-e32afa312a9b","name":"Compliance","order":1,"createdAt":"2026-03-08T06:45:02.243Z"},{"id":"bc6cad05-a8b5-478c-8532-708813c79edd","name":"Soft Skills","order":2,"createdAt":"2026-03-08T06:45:02.282Z"},{"id":"a00e16bb-d3f5-42b3-a941-dba08f95c4de","name":"Hard Skills","order":3,"createdAt":"2026-03-08T06:45:02.289Z"}];
const courses = [{"id":"57bf065a-1167-444e-b246-00468f7eac8c","title":"Tester","description":"","categoryId":"5ec3aa5e-ec9d-4efd-a544-e32afa312a9b","points":100,"status":"PUBLISHED","image":"","createdAt":"2026-03-08T08:48:58.017Z","updatedAt":"2026-03-08T08:49:03.480Z","category":{"id":"5ec3aa5e-ec9d-4efd-a544-e32afa312a9b","name":"Compliance","order":1,"createdAt":"2026-03-08T06:45:02.243Z"},"isEnrolled":true,"enrollmentStatus":"COMPLETED","progressPercent":100},{"id":"a2333a4f-efff-4bd7-b0b5-43a459d28cf8","title":"Image Verification Course","description":"A course to verify image display.","categoryId":"bc6cad05-a8b5-478c-8532-708813c79edd","points":150,"status":"PUBLISHED","image":"https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400","createdAt":"2026-03-08T08:51:38.504Z","updatedAt":"2026-03-08T09:12:32.147Z","category":{"id":"bc6cad05-a8b5-478c-8532-708813c79edd","name":"Soft Skills","order":2,"createdAt":"2026-03-08T06:45:02.282Z"},"isEnrolled":true,"enrollmentStatus":"IN_PROGRESS","progressPercent":0}];

const categorizedCourses = categories.map(cat => ({
  ...cat,
  courses: courses.filter(c => c.categoryId === cat.id)
})).filter(cat => cat.courses.length > 0);

console.log("categorizedCourses length:", categorizedCourses.length);
console.log("Total courses in categorizedCourses:", categorizedCourses.reduce((sum, cat) => sum + cat.courses.length, 0));

const uncategorized = courses.filter(c => !c.categoryId);
console.log("uncategorized length:", uncategorized.length);

if (categorizedCourses.length > 0) {
  console.log("Will render categorized courses.");
}

if (uncategorized.length > 0 && categorizedCourses.length === 0) {
  console.log("Will render uncategorized courses.");
}
