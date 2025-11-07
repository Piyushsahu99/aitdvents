-- Create LMS tables for courses, lessons, enrollments, and progress tracking

-- Courses table
CREATE TABLE public.courses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  instructor_name text NOT NULL,
  instructor_bio text,
  category text NOT NULL,
  level text NOT NULL DEFAULT 'beginner',
  duration text NOT NULL,
  thumbnail_url text,
  status event_status NOT NULL DEFAULT 'draft'::event_status,
  price numeric DEFAULT 0,
  is_free boolean DEFAULT true,
  enrolled_count integer DEFAULT 0,
  rating numeric DEFAULT 0,
  total_lessons integer DEFAULT 0,
  created_by uuid,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Lessons table
CREATE TABLE public.lessons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  content text NOT NULL,
  video_url text,
  duration_minutes integer DEFAULT 0,
  order_index integer NOT NULL,
  is_free_preview boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Course enrollments table
CREATE TABLE public.course_enrollments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  enrolled_at timestamp with time zone DEFAULT now(),
  completed_at timestamp with time zone,
  progress_percentage numeric DEFAULT 0,
  UNIQUE(course_id, user_id)
);

-- Lesson progress table
CREATE TABLE public.lesson_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id uuid NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  enrollment_id uuid NOT NULL REFERENCES public.course_enrollments(id) ON DELETE CASCADE,
  completed boolean DEFAULT false,
  completed_at timestamp with time zone,
  time_spent_minutes integer DEFAULT 0,
  last_position integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(lesson_id, user_id)
);

-- Assignments table
CREATE TABLE public.assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id uuid NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text NOT NULL,
  due_date timestamp with time zone,
  max_score integer DEFAULT 100,
  created_at timestamp with time zone DEFAULT now()
);

-- Assignment submissions table
CREATE TABLE public.assignment_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id uuid NOT NULL REFERENCES public.assignments(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  content text NOT NULL,
  file_url text,
  score integer,
  feedback text,
  submitted_at timestamp with time zone DEFAULT now(),
  graded_at timestamp with time zone,
  graded_by uuid,
  UNIQUE(assignment_id, user_id)
);

-- Enable RLS on all tables
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignment_submissions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for courses
CREATE POLICY "Anyone can view live courses" ON public.courses
FOR SELECT USING ((status = 'live'::event_status) OR is_admin());

CREATE POLICY "Only admins can manage courses" ON public.courses
FOR ALL USING (is_admin());

-- RLS Policies for lessons
CREATE POLICY "Users can view lessons of enrolled courses or free previews" ON public.lessons
FOR SELECT USING (
  is_free_preview = true 
  OR EXISTS (
    SELECT 1 FROM public.course_enrollments 
    WHERE course_id = lessons.course_id 
    AND user_id = auth.uid()
  )
  OR is_admin()
);

CREATE POLICY "Only admins can manage lessons" ON public.lessons
FOR ALL USING (is_admin());

-- RLS Policies for enrollments
CREATE POLICY "Users can view their own enrollments" ON public.course_enrollments
FOR SELECT USING (user_id = auth.uid() OR is_admin());

CREATE POLICY "Authenticated users can enroll in courses" ON public.course_enrollments
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Only admins can update enrollments" ON public.course_enrollments
FOR UPDATE USING (is_admin());

-- RLS Policies for lesson progress
CREATE POLICY "Users can view their own progress" ON public.lesson_progress
FOR SELECT USING (user_id = auth.uid() OR is_admin());

CREATE POLICY "Users can track their own progress" ON public.lesson_progress
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own progress" ON public.lesson_progress
FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for assignments
CREATE POLICY "Users can view assignments of enrolled courses" ON public.assignments
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.lessons l
    JOIN public.course_enrollments e ON e.course_id = l.course_id
    WHERE l.id = assignments.lesson_id 
    AND e.user_id = auth.uid()
  )
  OR is_admin()
);

CREATE POLICY "Only admins can manage assignments" ON public.assignments
FOR ALL USING (is_admin());

-- RLS Policies for assignment submissions
CREATE POLICY "Users can view their own submissions" ON public.assignment_submissions
FOR SELECT USING (user_id = auth.uid() OR is_admin());

CREATE POLICY "Users can submit assignments" ON public.assignment_submissions
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their pending submissions" ON public.assignment_submissions
FOR UPDATE USING (user_id = auth.uid() AND graded_at IS NULL);

CREATE POLICY "Admins can grade submissions" ON public.assignment_submissions
FOR UPDATE USING (is_admin());

-- Create indexes for better performance
CREATE INDEX idx_lessons_course_id ON public.lessons(course_id);
CREATE INDEX idx_enrollments_user_id ON public.course_enrollments(user_id);
CREATE INDEX idx_enrollments_course_id ON public.course_enrollments(course_id);
CREATE INDEX idx_lesson_progress_user_id ON public.lesson_progress(user_id);
CREATE INDEX idx_lesson_progress_enrollment_id ON public.lesson_progress(enrollment_id);
CREATE INDEX idx_assignments_lesson_id ON public.assignments(lesson_id);
CREATE INDEX idx_assignment_submissions_user_id ON public.assignment_submissions(user_id);

-- Trigger for updating updated_at
CREATE TRIGGER update_courses_updated_at
BEFORE UPDATE ON public.courses
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_lessons_updated_at
BEFORE UPDATE ON public.lessons
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_lesson_progress_updated_at
BEFORE UPDATE ON public.lesson_progress
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();