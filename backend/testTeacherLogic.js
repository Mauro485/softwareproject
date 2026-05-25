const mongoose = require('mongoose');

async function test() {
  await mongoose.connect('mongodb+srv://mmonterrozasevilla_db_user:OPQ4RQQJoVF3kJHl@cluster0.fgtiasg.mongodb.net/ova-git-backend_db?appName=Cluster0');
  
  const Enrollment = mongoose.model('Enrollment', new mongoose.Schema({}, {strict: false}), 'enrollments');
  const Progress = mongoose.model('Progress', new mongoose.Schema({}, {strict: false}), 'progresses');
  const Course = mongoose.model('Course', new mongoose.Schema({createdBy: mongoose.Schema.Types.ObjectId, name: String, modules: Array}, {strict: false}), 'courses');
  const User = mongoose.model('User', new mongoose.Schema({name: String, email: String, role: String}, {strict: false}), 'users');

  const teacher = await User.findOne({role: 'teacher'});
  console.log('Teacher:', teacher._id);

  const courses = await Course.find({ createdBy: teacher._id });
  const courseIds = courses.map(c => c._id);
  
  const enrollments = await Enrollment.find({ course: { $in: courseIds } })
    .populate('student', 'name email')
    .populate('course', 'name modules');

  const studentsData = await Promise.all(enrollments.map(async (enr) => {
    const progresses = await Progress.find({ user: enr.student._id, course: enr.course._id });
    const totalModules = enr.course.modules.length;
    let overallProgress = 0;
    
    if (totalModules > 0) {
      const sumPercentage = progresses.reduce((acc, curr) => acc + curr.percentage, 0);
      overallProgress = Math.round(sumPercentage / totalModules);
    }
    
    return {
      progressesFound: progresses.length,
      studentIdType: typeof enr.student._id,
      courseIdType: typeof enr.course._id,
      overallProgress
    };
  }));

  console.log(studentsData);
  process.exit();
}
test();
