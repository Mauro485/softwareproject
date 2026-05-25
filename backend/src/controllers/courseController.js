const Course = require('../models/course');
const Enrollment = require('../models/enrollment');
const ActivityResult = require('../models/activityResult');
const Progress = require('../models/progress');
const UserAchievement = require('../models/userAchievement');
const { getAchievementById } = require('../utils/achievementsList');

// Get all courses
const getCourses = async (req, res) => {
  try {
    const courses = await Course.find();
    res.status(200).json(courses);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching courses', error: error.message });
  }
};

// Get course by ID
const getCourseById = async (req, res) => {
  try {
    const { id } = req.params;
    const course = await Course.findById(id);

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    res.status(200).json(course);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching course', error: error.message });
  }
};

// Create a new course
const createCourse = async (req, res) => {
  try {
    const { name, description, modules } = req.body;
    const { userId } = req.user;

    if (!name) {
      return res.status(400).json({ message: 'Course name is required' });
    }

    const newCourse = new Course({
      name,
      description,
      createdBy: userId,
      modules
    });

    const savedCourse = await newCourse.save();
    res.status(201).json(savedCourse);
  } catch (error) {
    res.status(500).json({ message: 'Error creating course', error: error.message });
  }
};

// Enroll student in a course
const enrollStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const user = req.user;

    const course = await Course.findById(id);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    if (!user) {
      return res.status(200).json({ message: 'Invitado accediendo temporalmente', isGuest: true });
    }

    const existingEnrollment = await Enrollment.findOne({ student: user.userId, course: id });
    if (existingEnrollment) {
      return res.status(400).json({ message: 'User is already enrolled in this course' });
    }

    const newEnrollment = new Enrollment({
      student: user.userId,
      course: id
    });

    const savedEnrollment = await newEnrollment.save();
    res.status(201).json(savedEnrollment);
  } catch (error) {
    res.status(500).json({ message: 'Error enrolling in course', error: error.message });
  }
};

// Add a module to a course
const createModule = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, order, textContent, imageUrl, videoUrl } = req.body;

    if (!title || !description || order === undefined) {
      return res.status(400).json({ message: 'Title, description, and order are required' });
    }

    const course = await Course.findById(id);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    const contents = [];
    
    if (textContent) {
      contents.push({ type: 'text', title: 'Contenido Principal', text: textContent });
    }
    if (imageUrl) {
      contents.push({ type: 'image', title: 'Recurso Visual', imageUrl });
    }
    if (videoUrl) {
      contents.push({ type: 'video', title: 'Video Explicativo', videoUrl });
    }

    const newModule = {
      title,
      description,
      order,
      contents,
      activities: []
    };

    course.modules.push(newModule);
    await course.save();
    
    // El ID del módulo recién insertado es el último en el array
    const createdModule = course.modules[course.modules.length - 1];

    res.status(201).json({ message: 'Module created successfully', module: createdModule, course });
  } catch (error) {
    res.status(500).json({ message: 'Error creating module', error: error.message });
  }
};

// Add an activity to a specific module
const createActivity = async (req, res) => {
  try {
    const { id, moduleId } = req.params;
    const { question, difficulty, options } = req.body;

    if (!question || !difficulty || !options || options.length < 2) {
      return res.status(400).json({ message: 'Question, difficulty, and at least 2 options are required' });
    }

    // Verify there is exactly one correct option
    const correctOptions = options.filter(opt => opt.isCorrect);
    if (correctOptions.length !== 1) {
      return res.status(400).json({ message: 'There must be exactly one correct option' });
    }

    const course = await Course.findById(id);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    const module = course.modules.id(moduleId);
    if (!module) {
      return res.status(404).json({ message: 'Module not found' });
    }

    const newActivity = {
      question,
      difficulty,
      options
    };

    module.activities.push(newActivity);
    await course.save();

    res.status(201).json({ message: 'Activity created successfully', activity: module.activities[module.activities.length - 1] });
  } catch (error) {
    res.status(500).json({ message: 'Error creating activity', error: error.message });
  }
};

// Get module for studying (strips isCorrect)
const getModuleStudy = async (req, res) => {
  try {
    const { id, moduleId } = req.params;

    const course = await Course.findById(id);
    if (!course) return res.status(404).json({ message: 'Course not found' });

    const moduleDoc = course.modules.id(moduleId);
    if (!moduleDoc) return res.status(404).json({ message: 'Module not found' });

    // Clone to manipulate
    const moduleObj = moduleDoc.toObject();

    // Strip isCorrect from options
    if (moduleObj.activities) {
      moduleObj.activities.forEach(activity => {
        if (activity.options) {
          activity.options.forEach(opt => {
            delete opt.isCorrect;
          });
        }
      });
    }

    res.status(200).json(moduleObj);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching module', error: error.message });
  }
};

// Evaluate entire module (CU-7)
const evaluateModule = async (req, res) => {
  try {
    const { id, moduleId } = req.params;
    const { answers } = req.body; // Array of { activityId, optionId }

    if (!Array.isArray(answers)) {
      return res.status(400).json({ message: 'Answers must be an array' });
    }

    const course = await Course.findById(id);
    if (!course) return res.status(404).json({ message: 'Course not found' });

    const moduleDoc = course.modules.id(moduleId);
    if (!moduleDoc) return res.status(404).json({ message: 'Module not found' });

    let correctCount = 0;
    const totalActivities = moduleDoc.activities.length;
    
    // Process each answer
    const resultsToSave = [];
    
    for (const answer of answers) {
      const activity = moduleDoc.activities.id(answer.activityId);
      if (activity) {
        const option = activity.options.id(answer.optionId);
        if (option) {
          const isCorrect = option.isCorrect;
          if (isCorrect) correctCount++;
          
          if (req.user && req.user.userId) {
            resultsToSave.push({
              user: req.user.userId,
              course: id,
              module: moduleId,
              activity: answer.activityId,
              option: answer.optionId,
              isCorrect
            });
          }
        }
      }
    }

    const percentage = totalActivities > 0 ? Math.round((correctCount / totalActivities) * 100) : 100;
    const completed = percentage === 100;

    let unlockedAchievement = null;

    // If user is authenticated, save results and update progress
    if (req.user && req.user.userId) {
      // Clear previous results for this user and module? 
      // (Optional depending on business rules, here we just insert new ones)
      if (resultsToSave.length > 0) {
        await ActivityResult.insertMany(resultsToSave);
      }

      // Update progress
      await Progress.findOneAndUpdate(
        { user: req.user.userId, module: moduleId },
        { course: id, percentage, completed, lastUpdated: Date.now() },
        { returnDocument: 'after', upsert: true }
      );

      // ACHIEVEMENT ENGINE
      // Check for 'perfect_module'
      if (percentage === 100) {
        const existing = await UserAchievement.findOne({ user: req.user.userId, achievementId: 'perfect_module' });
        if (!existing) {
          await new UserAchievement({ user: req.user.userId, achievementId: 'perfect_module' }).save();
          unlockedAchievement = getAchievementById('perfect_module');
        }
      }
      
      // Check for 'first_module'
      if (completed) {
        const existing = await UserAchievement.findOne({ user: req.user.userId, achievementId: 'first_module' });
        if (!existing) {
          await new UserAchievement({ user: req.user.userId, achievementId: 'first_module' }).save();
          unlockedAchievement = getAchievementById('first_module'); // Only one achievement returned in this simplified logic, could be an array if multiple
        }
      }
    }

    res.status(200).json({
      score: correctCount,
      total: totalActivities,
      percentage,
      achievementUnlocked: unlockedAchievement,
      message: req.user && req.user.userId ? 'Results saved successfully' : 'Evaluated as guest'
    });

  } catch (error) {
    res.status(500).json({ message: 'Error evaluating module', error: error.message });
  }
};

// Get module progress (CU-8)
const getModuleProgress = async (req, res) => {
  try {
    const { id, moduleId } = req.params;
    const { userId } = req.user;

    const course = await Course.findById(id);
    if (!course) return res.status(404).json({ message: 'Course not found' });

    const module = course.modules.id(moduleId);
    if (!module) return res.status(404).json({ message: 'Module not found' });

    const totalActivities = module.activities.length;
    
    let percentage = 100;
    let completed = true;

    if (totalActivities > 0) {
      // Find all correct results for this user and module
      const correctResults = await ActivityResult.find({
        user: userId,
        module: moduleId,
        isCorrect: true
      });

      // Get unique activity IDs that have been solved correctly
      const uniqueSolvedActivities = new Set(correctResults.map(r => r.activity.toString()));
      const correctCount = uniqueSolvedActivities.size;

      percentage = Math.round((correctCount / totalActivities) * 100);
      completed = percentage === 100;
    }

    // Upsert the progress record
    const progress = await Progress.findOneAndUpdate(
      { user: userId, module: moduleId },
      { course: id, percentage, completed, lastUpdated: Date.now() },
      { returnDocument: 'after', upsert: true }
    );

    if (totalActivities === 0) {
       return res.status(200).json({ percentage: 100, completed: true, message: 'No activities in this module' });
    }

    res.status(200).json(progress);
  } catch (error) {
    res.status(500).json({ message: 'Error getting progress', error: error.message });
  }
};

// Get students for a teacher's courses
const getTeacherStudents = async (req, res) => {
  try {
    const { userId } = req.user;

    // 1. Find courses created by this teacher
    const courses = await Course.find({ createdBy: userId });
    const courseIds = courses.map(c => c._id);

    if (courseIds.length === 0) {
      return res.status(200).json([]);
    }

    // 2. Find enrollments for these courses, populate student info and course info
    const enrollments = await Enrollment.find({ course: { $in: courseIds } })
      .populate('student', 'name email')
      .populate('course', 'name modules');

    // 3. For each enrollment, calculate progress
    const studentsData = await Promise.all(enrollments.map(async (enr) => {
      // Find progress records for this student and course
      const progresses = await Progress.find({ user: enr.student._id, course: enr.course._id });
      
      const totalModules = enr.course.modules.length;
      let overallProgress = 0;
      
      if (totalModules > 0) {
        // Promedio del porcentaje de todos los módulos del curso
        const sumPercentage = progresses.reduce((acc, curr) => acc + curr.percentage, 0);
        overallProgress = Math.round(sumPercentage / totalModules);
      }

      return {
        id: enr._id,
        studentName: enr.student.name,
        studentEmail: enr.student.email,
        courseName: enr.course.name,
        progress: overallProgress,
        enrolledAt: enr.enrolledAt
      };
    }));

    res.status(200).json(studentsData);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching teacher students', error: error.message });
  }
};

// Get enrolled courses for a student
const getEnrolledCourses = async (req, res) => {
  try {
    const { userId } = req.user;
    
    const enrollments = await Enrollment.find({ student: userId }).populate('course');
    const courses = enrollments.map(enr => enr.course).filter(c => c !== null); // Filter out nulls if course was deleted
    
    res.status(200).json(courses);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching enrolled courses', error: error.message });
  }
};

// Get students progress for a specific course
const getCourseStudentsProgress = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.user;

    const course = await Course.findOne({ _id: id, createdBy: userId });
    if (!course) {
      return res.status(404).json({ message: 'Course not found or unauthorized' });
    }

    const enrollments = await Enrollment.find({ course: id })
      .populate('student', 'name email')
      .populate('course', 'name modules');

    const studentsData = await Promise.all(enrollments.map(async (enr) => {
      const progresses = await Progress.find({ user: enr.student._id, course: id });
      
      const totalModules = enr.course.modules.length;
      let overallProgress = 0;
      
      if (totalModules > 0) {
        const sumPercentage = progresses.reduce((acc, curr) => acc + curr.percentage, 0);
        overallProgress = Math.round(sumPercentage / totalModules);
      }

      return {
        id: enr._id,
        studentName: enr.student.name,
        studentEmail: enr.student.email,
        courseName: enr.course.name,
        progress: overallProgress,
        enrolledAt: enr.enrolledAt
      };
    }));

    res.status(200).json(studentsData);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching course students progress', error: error.message });
  }
};

// Get teacher's created courses
const getTeacherCourses = async (req, res) => {
  try {
    const { userId } = req.user;
    const courses = await Course.find({ createdBy: userId });
    res.status(200).json(courses);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching teacher courses', error: error.message });
  }
};

// Update a course
const updateCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;
    const { userId } = req.user;

    const course = await Course.findOneAndUpdate(
      { _id: id, createdBy: userId },
      { name, description },
      { new: true }
    );

    if (!course) {
      return res.status(404).json({ message: 'Course not found or unauthorized' });
    }

    res.status(200).json(course);
  } catch (error) {
    res.status(500).json({ message: 'Error updating course', error: error.message });
  }
};

// Delete a course
const deleteCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.user;

    const course = await Course.findOneAndDelete({ _id: id, createdBy: userId });

    if (!course) {
      return res.status(404).json({ message: 'Course not found or unauthorized' });
    }

    res.status(200).json({ message: 'Course deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting course', error: error.message });
  }
};

// Update a module
const updateModule = async (req, res) => {
  try {
    const { id, moduleId } = req.params;
    const { userId } = req.user;
    const { title, description, order, textContent, imageUrl, videoUrl } = req.body;

    const course = await Course.findOne({ _id: id, createdBy: userId });
    if (!course) return res.status(404).json({ message: 'Course not found or unauthorized' });

    const module = course.modules.id(moduleId);
    if (!module) return res.status(404).json({ message: 'Module not found' });

    if (title) module.title = title;
    if (description) module.description = description;
    if (order !== undefined) module.order = order;

    // Reset contents if updating them
    module.contents = [];
    if (textContent) module.contents.push({ type: 'text', text: textContent });
    if (imageUrl) module.contents.push({ type: 'image', imageUrl });
    if (videoUrl) module.contents.push({ type: 'video', videoUrl });

    await course.save();
    res.status(200).json(module);
  } catch (error) {
    res.status(500).json({ message: 'Error updating module', error: error.message });
  }
};

// Delete a module
const deleteModule = async (req, res) => {
  try {
    const { id, moduleId } = req.params;
    const { userId } = req.user;

    const course = await Course.findOne({ _id: id, createdBy: userId });
    if (!course) return res.status(404).json({ message: 'Course not found or unauthorized' });

    course.modules.pull(moduleId);
    await course.save();
    res.status(200).json({ message: 'Module deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting module', error: error.message });
  }
};

module.exports = {
  getCourses,
  getCourseById,
  createCourse,
  enrollStudent,
  createModule,
  createActivity,
  getModuleStudy,
  evaluateModule,
  getModuleProgress,
  getTeacherStudents,
  getEnrolledCourses,
  getCourseStudentsProgress,
  getTeacherCourses,
  updateCourse,
  deleteCourse,
  updateModule,
  deleteModule
};
