-- ============================================
-- COURSERA-STYLE LEARNING SYSTEM SCHEMA
-- ============================================

-- 1. COURSE MODULES (Weekly Sections)
CREATE TABLE IF NOT EXISTS public.course_modules (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL, -- e.g., "Week 1: Introduction to Python"
    description TEXT,
    order_index INTEGER NOT NULL DEFAULT 0,
    is_published BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 2. MODULE ITEMS (Videos, Readings, Quizzes, Assignments)
CREATE TABLE IF NOT EXISTS public.module_items (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    module_id UUID REFERENCES public.course_modules(id) ON DELETE CASCADE NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('video', 'reading', 'quiz', 'assignment')),
    title TEXT NOT NULL,
    description TEXT,
    content JSONB, -- Flexible content storage based on type
    order_index INTEGER NOT NULL DEFAULT 0,
    is_required BOOLEAN DEFAULT true,
    estimated_duration INTEGER, -- in minutes
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. QUIZZES
CREATE TABLE IF NOT EXISTS public.quizzes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    passing_score INTEGER DEFAULT 70, -- percentage
    time_limit INTEGER, -- minutes, NULL for unlimited
    attempts_allowed INTEGER DEFAULT 3, -- NULL for unlimited
    show_correct_answers BOOLEAN DEFAULT true,
    randomize_questions BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. QUIZ QUESTIONS
CREATE TABLE IF NOT EXISTS public.quiz_questions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    quiz_id UUID REFERENCES public.quizzes(id) ON DELETE CASCADE NOT NULL,
    question_text TEXT NOT NULL,
    question_type TEXT NOT NULL CHECK (question_type IN ('multiple_choice', 'true_false', 'short_answer')),
    options JSONB, -- Array of options for multiple choice: ["Option A", "Option B", ...]
    correct_answer TEXT NOT NULL,
    explanation TEXT, -- Explanation shown after submission
    points INTEGER DEFAULT 1,
    order_index INTEGER NOT NULL DEFAULT 0
);

-- 5. QUIZ ATTEMPTS
CREATE TABLE IF NOT EXISTS public.quiz_attempts (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    quiz_id UUID REFERENCES public.quizzes(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    answers JSONB NOT NULL, -- {question_id: answer, ...}
    score INTEGER NOT NULL, -- percentage
    points_earned INTEGER,
    total_points INTEGER,
    passed BOOLEAN NOT NULL,
    time_taken INTEGER, -- seconds
    started_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    completed_at TIMESTAMP WITH TIME ZONE
);

-- 6. ASSIGNMENTS
CREATE TABLE IF NOT EXISTS public.assignments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    instructions TEXT,
    max_score INTEGER DEFAULT 100,
    due_date TIMESTAMP WITH TIME ZONE,
    allow_late_submission BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. ASSIGNMENT SUBMISSIONS
CREATE TABLE IF NOT EXISTS public.assignment_submissions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    assignment_id UUID REFERENCES public.assignments(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    submission_text TEXT,
    submission_files JSONB, -- Array of file URLs/paths
    score INTEGER,
    feedback TEXT,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    graded_at TIMESTAMP WITH TIME ZONE,
    graded_by UUID REFERENCES public.users(id)
);

-- 8. STUDENT PROGRESS TRACKING
CREATE TABLE IF NOT EXISTS public.student_progress (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    module_item_id UUID REFERENCES public.module_items(id) ON DELETE CASCADE NOT NULL,
    status TEXT DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed')),
    progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
    time_spent INTEGER DEFAULT 0, -- seconds
    completed_at TIMESTAMP WITH TIME ZONE,
    last_accessed TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    UNIQUE(user_id, module_item_id)
);

-- 9. VIDEO PROGRESS (Detailed tracking for videos)
CREATE TABLE IF NOT EXISTS public.video_progress (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    module_item_id UUID REFERENCES public.module_items(id) ON DELETE CASCADE NOT NULL,
    current_position INTEGER DEFAULT 0, -- seconds (renamed from current_time to avoid reserved keyword)
    duration INTEGER, -- total video duration in seconds
    watch_percentage INTEGER DEFAULT 0,
    last_watched TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    UNIQUE(user_id, module_item_id)
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

CREATE INDEX IF NOT EXISTS idx_course_modules_course_id ON public.course_modules(course_id);
CREATE INDEX IF NOT EXISTS idx_course_modules_order ON public.course_modules(course_id, order_index);

CREATE INDEX IF NOT EXISTS idx_module_items_module_id ON public.module_items(module_id);
CREATE INDEX IF NOT EXISTS idx_module_items_order ON public.module_items(module_id, order_index);

CREATE INDEX IF NOT EXISTS idx_quiz_questions_quiz_id ON public.quiz_questions(quiz_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_user_quiz ON public.quiz_attempts(user_id, quiz_id);

CREATE INDEX IF NOT EXISTS idx_assignment_submissions_user ON public.assignment_submissions(user_id);
CREATE INDEX IF NOT EXISTS idx_assignment_submissions_assignment ON public.assignment_submissions(assignment_id);

CREATE INDEX IF NOT EXISTS idx_student_progress_user ON public.student_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_student_progress_item ON public.student_progress(module_item_id);

CREATE INDEX IF NOT EXISTS idx_video_progress_user_item ON public.video_progress(user_id, module_item_id);

-- ============================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================

-- Enable RLS
ALTER TABLE public.course_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.module_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignment_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.video_progress ENABLE ROW LEVEL SECURITY;

-- Allow all operations for now (will be restricted with proper auth later)
CREATE POLICY "Allow all on course_modules" ON public.course_modules FOR ALL USING (true);
CREATE POLICY "Allow all on module_items" ON public.module_items FOR ALL USING (true);
CREATE POLICY "Allow all on quizzes" ON public.quizzes FOR ALL USING (true);
CREATE POLICY "Allow all on quiz_questions" ON public.quiz_questions FOR ALL USING (true);
CREATE POLICY "Allow all on quiz_attempts" ON public.quiz_attempts FOR ALL USING (true);
CREATE POLICY "Allow all on assignments" ON public.assignments FOR ALL USING (true);
CREATE POLICY "Allow all on assignment_submissions" ON public.assignment_submissions FOR ALL USING (true);
CREATE POLICY "Allow all on student_progress" ON public.student_progress FOR ALL USING (true);
CREATE POLICY "Allow all on video_progress" ON public.video_progress FOR ALL USING (true);

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Function to calculate module progress
CREATE OR REPLACE FUNCTION calculate_module_progress(p_user_id UUID, p_module_id UUID)
RETURNS INTEGER AS $$
DECLARE
    total_items INTEGER;
    completed_items INTEGER;
BEGIN
    SELECT COUNT(*) INTO total_items
    FROM module_items
    WHERE module_id = p_module_id;
    
    IF total_items = 0 THEN
        RETURN 0;
    END IF;
    
    SELECT COUNT(*) INTO completed_items
    FROM student_progress sp
    JOIN module_items mi ON sp.module_item_id = mi.id
    WHERE mi.module_id = p_module_id
    AND sp.user_id = p_user_id
    AND sp.status = 'completed';
    
    RETURN (completed_items * 100 / total_items);
END;
$$ LANGUAGE plpgsql;

-- Function to calculate course progress
CREATE OR REPLACE FUNCTION calculate_course_progress(p_user_id UUID, p_course_id UUID)
RETURNS INTEGER AS $$
DECLARE
    total_items INTEGER;
    completed_items INTEGER;
BEGIN
    SELECT COUNT(*) INTO total_items
    FROM module_items mi
    JOIN course_modules cm ON mi.module_id = cm.id
    WHERE cm.course_id = p_course_id;
    
    IF total_items = 0 THEN
        RETURN 0;
    END IF;
    
    SELECT COUNT(*) INTO completed_items
    FROM student_progress sp
    JOIN module_items mi ON sp.module_item_id = mi.id
    JOIN course_modules cm ON mi.module_id = cm.id
    WHERE cm.course_id = p_course_id
    AND sp.user_id = p_user_id
    AND sp.status = 'completed';
    
    RETURN (completed_items * 100 / total_items);
END;
$$ LANGUAGE plpgsql;

-- Function to check if item is unlocked (for locked progression)
CREATE OR REPLACE FUNCTION is_item_unlocked(p_user_id UUID, p_item_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    item_order INTEGER;
    module_id_var UUID;
    previous_completed BOOLEAN;
BEGIN
    -- Get item order and module
    SELECT order_index, module_id INTO item_order, module_id_var
    FROM module_items
    WHERE id = p_item_id;
    
    -- First item is always unlocked
    IF item_order = 0 THEN
        RETURN true;
    END IF;
    
    -- Check if previous item is completed
    SELECT EXISTS(
        SELECT 1
        FROM module_items mi
        JOIN student_progress sp ON mi.id = sp.module_item_id
        WHERE mi.module_id = module_id_var
        AND mi.order_index = item_order - 1
        AND sp.user_id = p_user_id
        AND sp.status = 'completed'
    ) INTO previous_completed;
    
    RETURN previous_completed;
END;
$$ LANGUAGE plpgsql;
