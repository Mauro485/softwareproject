const mongoose = require('mongoose');

async function test() {
  await mongoose.connect('mongodb+srv://mmonterrozasevilla_db_user:OPQ4RQQJoVF3kJHl@cluster0.fgtiasg.mongodb.net/ova-git-backend_db?appName=Cluster0');
  
  const Enrollment = mongoose.model('Enrollment', new mongoose.Schema({}, {strict: false}), 'enrollments');
  const Progress = mongoose.model('Progress', new mongoose.Schema({}, {strict: false}), 'progresses');
  const Course = mongoose.model('Course', new mongoose.Schema({modules: Array}, {strict: false}), 'courses');

  const enrs = await Enrollment.find().limit(2);
  for (const enr of enrs) {
    const course = await Course.findById(enr.course);
    const progresses = await Progress.find({ user: enr.student, course: enr.course });
    console.log('Enrolled course:', enr.course, 'Modules:', course.modules.length);
    console.log('Student:', enr.student);
    console.log('Progresses:', progresses);
  }
  process.exit();
}
test();
