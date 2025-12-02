CREATE EXTENSION IF NOT EXISTS "pg_graphql";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "plpgsql";
CREATE EXTENSION IF NOT EXISTS "supabase_vault";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
--
-- PostgreSQL database dump
--


-- Dumped from database version 17.6
-- Dumped by pg_dump version 17.7

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--



--
-- Name: app_role; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.app_role AS ENUM (
    'admin',
    'user'
);


--
-- Name: event_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.event_status AS ENUM (
    'draft',
    'live',
    'ended'
);


--
-- Name: has_role(uuid, public.app_role); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.has_role(_user_id uuid, _role public.app_role) RETURNS boolean
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;


--
-- Name: is_admin(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.is_admin() RETURNS boolean
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
  SELECT public.has_role(auth.uid(), 'admin')
$$;


--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;


--
-- Name: update_updated_at_column_community(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_updated_at_column_community() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;


SET default_table_access_method = heap;

--
-- Name: assignment_submissions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.assignment_submissions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    assignment_id uuid NOT NULL,
    user_id uuid NOT NULL,
    content text NOT NULL,
    file_url text,
    score integer,
    feedback text,
    submitted_at timestamp with time zone DEFAULT now(),
    graded_at timestamp with time zone,
    graded_by uuid
);


--
-- Name: assignments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.assignments (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    lesson_id uuid NOT NULL,
    title text NOT NULL,
    description text NOT NULL,
    due_date timestamp with time zone,
    max_score integer DEFAULT 100,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: blogs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.blogs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    event_id uuid,
    title text NOT NULL,
    content text NOT NULL,
    author text NOT NULL,
    category text NOT NULL,
    read_time text NOT NULL,
    excerpt text NOT NULL,
    published boolean DEFAULT false,
    ai_generated boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: bounties; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.bounties (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    title text NOT NULL,
    description text NOT NULL,
    requirements text NOT NULL,
    prize_amount text NOT NULL,
    prize_currency text DEFAULT 'INR'::text,
    deadline timestamp with time zone NOT NULL,
    category text NOT NULL,
    difficulty text NOT NULL,
    max_submissions integer DEFAULT 1,
    status public.event_status DEFAULT 'draft'::public.event_status NOT NULL,
    created_by uuid,
    banner_url text,
    rules text,
    judging_criteria text,
    tags text[],
    total_participants integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    posted_by_student boolean DEFAULT false,
    task_type text DEFAULT 'company'::text
);


--
-- Name: bounty_payments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.bounty_payments (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    submission_id uuid NOT NULL,
    user_id uuid NOT NULL,
    amount numeric(10,2) NOT NULL,
    currency text DEFAULT 'INR'::text,
    status text DEFAULT 'pending'::text NOT NULL,
    payment_method text,
    transaction_id text,
    paid_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: bounty_submissions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.bounty_submissions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    bounty_id uuid NOT NULL,
    user_id uuid NOT NULL,
    submission_url text NOT NULL,
    description text NOT NULL,
    status text DEFAULT 'pending'::text NOT NULL,
    feedback text,
    score integer,
    submitted_at timestamp with time zone DEFAULT now(),
    reviewed_at timestamp with time zone,
    reviewed_by uuid
);


--
-- Name: community_links; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.community_links (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    platform text NOT NULL,
    url text NOT NULL,
    icon text NOT NULL,
    description text,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: course_enrollments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.course_enrollments (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    course_id uuid NOT NULL,
    user_id uuid NOT NULL,
    enrolled_at timestamp with time zone DEFAULT now(),
    completed_at timestamp with time zone,
    progress_percentage numeric DEFAULT 0
);


--
-- Name: courses; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.courses (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    title text NOT NULL,
    description text NOT NULL,
    instructor_name text NOT NULL,
    instructor_bio text,
    category text NOT NULL,
    level text DEFAULT 'beginner'::text NOT NULL,
    duration text NOT NULL,
    thumbnail_url text,
    status public.event_status DEFAULT 'draft'::public.event_status NOT NULL,
    price numeric DEFAULT 0,
    is_free boolean DEFAULT true,
    enrolled_count integer DEFAULT 0,
    rating numeric DEFAULT 0,
    total_lessons integer DEFAULT 0,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: events; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.events (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    title text NOT NULL,
    description text NOT NULL,
    date text NOT NULL,
    location text NOT NULL,
    participants integer DEFAULT 0,
    category text NOT NULL,
    status public.event_status DEFAULT 'draft'::public.event_status NOT NULL,
    created_by uuid,
    poster_url text,
    hashtags text[],
    external_link text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    is_online boolean DEFAULT true,
    is_free boolean DEFAULT true,
    days_left integer,
    applied_count integer DEFAULT 0
);


--
-- Name: group_members; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.group_members (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    group_id uuid NOT NULL,
    user_id uuid NOT NULL,
    role text DEFAULT 'member'::text,
    joined_at timestamp with time zone DEFAULT now()
);


--
-- Name: hackathons; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.hackathons (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    title text NOT NULL,
    organizer text NOT NULL,
    description text NOT NULL,
    start_date timestamp with time zone NOT NULL,
    end_date timestamp with time zone NOT NULL,
    registration_deadline timestamp with time zone NOT NULL,
    location text NOT NULL,
    mode text NOT NULL,
    category text NOT NULL,
    prize_pool text NOT NULL,
    max_team_size integer DEFAULT 4 NOT NULL,
    difficulty text NOT NULL,
    themes jsonb,
    banner_url text,
    external_link text,
    total_participants integer DEFAULT 0,
    status public.event_status DEFAULT 'draft'::public.event_status NOT NULL,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT hackathons_difficulty_check CHECK ((difficulty = ANY (ARRAY['beginner'::text, 'intermediate'::text, 'advanced'::text]))),
    CONSTRAINT hackathons_mode_check CHECK ((mode = ANY (ARRAY['online'::text, 'offline'::text, 'hybrid'::text])))
);


--
-- Name: jobs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.jobs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    title text NOT NULL,
    company text NOT NULL,
    location text NOT NULL,
    type text NOT NULL,
    duration text NOT NULL,
    stipend text NOT NULL,
    category text NOT NULL,
    apply_by text,
    description text,
    requirements text,
    status public.event_status DEFAULT 'draft'::public.event_status NOT NULL,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: lesson_progress; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.lesson_progress (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    lesson_id uuid NOT NULL,
    user_id uuid NOT NULL,
    enrollment_id uuid NOT NULL,
    completed boolean DEFAULT false,
    completed_at timestamp with time zone,
    time_spent_minutes integer DEFAULT 0,
    last_position integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: lessons; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.lessons (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    course_id uuid NOT NULL,
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


--
-- Name: scholarships; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.scholarships (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    title text NOT NULL,
    provider text NOT NULL,
    description text NOT NULL,
    amount text NOT NULL,
    deadline text NOT NULL,
    category text NOT NULL,
    eligibility text NOT NULL,
    requirements text,
    status public.event_status DEFAULT 'draft'::public.event_status NOT NULL,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: student_groups; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.student_groups (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    description text,
    created_by uuid NOT NULL,
    category text NOT NULL,
    max_members integer DEFAULT 10,
    is_public boolean DEFAULT true,
    avatar_url text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: student_profiles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.student_profiles (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    full_name text NOT NULL,
    bio text,
    college text,
    graduation_year integer,
    skills text[],
    linkedin_url text,
    github_url text,
    portfolio_url text,
    avatar_url text,
    is_looking_for_team boolean DEFAULT false,
    interests text[],
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: user_roles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_roles (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    role public.app_role DEFAULT 'user'::public.app_role NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: assignment_submissions assignment_submissions_assignment_id_user_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.assignment_submissions
    ADD CONSTRAINT assignment_submissions_assignment_id_user_id_key UNIQUE (assignment_id, user_id);


--
-- Name: assignment_submissions assignment_submissions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.assignment_submissions
    ADD CONSTRAINT assignment_submissions_pkey PRIMARY KEY (id);


--
-- Name: assignments assignments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.assignments
    ADD CONSTRAINT assignments_pkey PRIMARY KEY (id);


--
-- Name: blogs blogs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.blogs
    ADD CONSTRAINT blogs_pkey PRIMARY KEY (id);


--
-- Name: bounties bounties_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bounties
    ADD CONSTRAINT bounties_pkey PRIMARY KEY (id);


--
-- Name: bounty_payments bounty_payments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bounty_payments
    ADD CONSTRAINT bounty_payments_pkey PRIMARY KEY (id);


--
-- Name: bounty_submissions bounty_submissions_bounty_id_user_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bounty_submissions
    ADD CONSTRAINT bounty_submissions_bounty_id_user_id_key UNIQUE (bounty_id, user_id);


--
-- Name: bounty_submissions bounty_submissions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bounty_submissions
    ADD CONSTRAINT bounty_submissions_pkey PRIMARY KEY (id);


--
-- Name: community_links community_links_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.community_links
    ADD CONSTRAINT community_links_pkey PRIMARY KEY (id);


--
-- Name: course_enrollments course_enrollments_course_id_user_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.course_enrollments
    ADD CONSTRAINT course_enrollments_course_id_user_id_key UNIQUE (course_id, user_id);


--
-- Name: course_enrollments course_enrollments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.course_enrollments
    ADD CONSTRAINT course_enrollments_pkey PRIMARY KEY (id);


--
-- Name: courses courses_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.courses
    ADD CONSTRAINT courses_pkey PRIMARY KEY (id);


--
-- Name: events events_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.events
    ADD CONSTRAINT events_pkey PRIMARY KEY (id);


--
-- Name: group_members group_members_group_id_user_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.group_members
    ADD CONSTRAINT group_members_group_id_user_id_key UNIQUE (group_id, user_id);


--
-- Name: group_members group_members_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.group_members
    ADD CONSTRAINT group_members_pkey PRIMARY KEY (id);


--
-- Name: hackathons hackathons_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.hackathons
    ADD CONSTRAINT hackathons_pkey PRIMARY KEY (id);


--
-- Name: jobs jobs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.jobs
    ADD CONSTRAINT jobs_pkey PRIMARY KEY (id);


--
-- Name: lesson_progress lesson_progress_lesson_id_user_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.lesson_progress
    ADD CONSTRAINT lesson_progress_lesson_id_user_id_key UNIQUE (lesson_id, user_id);


--
-- Name: lesson_progress lesson_progress_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.lesson_progress
    ADD CONSTRAINT lesson_progress_pkey PRIMARY KEY (id);


--
-- Name: lessons lessons_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.lessons
    ADD CONSTRAINT lessons_pkey PRIMARY KEY (id);


--
-- Name: scholarships scholarships_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.scholarships
    ADD CONSTRAINT scholarships_pkey PRIMARY KEY (id);


--
-- Name: student_groups student_groups_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.student_groups
    ADD CONSTRAINT student_groups_pkey PRIMARY KEY (id);


--
-- Name: student_profiles student_profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.student_profiles
    ADD CONSTRAINT student_profiles_pkey PRIMARY KEY (id);


--
-- Name: student_profiles student_profiles_user_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.student_profiles
    ADD CONSTRAINT student_profiles_user_id_key UNIQUE (user_id);


--
-- Name: user_roles user_roles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_pkey PRIMARY KEY (id);


--
-- Name: user_roles user_roles_user_id_role_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_user_id_role_key UNIQUE (user_id, role);


--
-- Name: idx_assignment_submissions_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_assignment_submissions_user_id ON public.assignment_submissions USING btree (user_id);


--
-- Name: idx_assignments_lesson_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_assignments_lesson_id ON public.assignments USING btree (lesson_id);


--
-- Name: idx_enrollments_course_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_enrollments_course_id ON public.course_enrollments USING btree (course_id);


--
-- Name: idx_enrollments_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_enrollments_user_id ON public.course_enrollments USING btree (user_id);


--
-- Name: idx_lesson_progress_enrollment_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_lesson_progress_enrollment_id ON public.lesson_progress USING btree (enrollment_id);


--
-- Name: idx_lesson_progress_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_lesson_progress_user_id ON public.lesson_progress USING btree (user_id);


--
-- Name: idx_lessons_course_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_lessons_course_id ON public.lessons USING btree (course_id);


--
-- Name: blogs update_blogs_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_blogs_updated_at BEFORE UPDATE ON public.blogs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: bounties update_bounties_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_bounties_updated_at BEFORE UPDATE ON public.bounties FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: community_links update_community_links_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_community_links_updated_at BEFORE UPDATE ON public.community_links FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column_community();


--
-- Name: courses update_courses_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_courses_updated_at BEFORE UPDATE ON public.courses FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: events update_events_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON public.events FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: hackathons update_hackathons_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_hackathons_updated_at BEFORE UPDATE ON public.hackathons FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: jobs update_jobs_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_jobs_updated_at BEFORE UPDATE ON public.jobs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: lesson_progress update_lesson_progress_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_lesson_progress_updated_at BEFORE UPDATE ON public.lesson_progress FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: lessons update_lessons_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_lessons_updated_at BEFORE UPDATE ON public.lessons FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: scholarships update_scholarships_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_scholarships_updated_at BEFORE UPDATE ON public.scholarships FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: student_groups update_student_groups_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_student_groups_updated_at BEFORE UPDATE ON public.student_groups FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column_community();


--
-- Name: student_profiles update_student_profiles_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_student_profiles_updated_at BEFORE UPDATE ON public.student_profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column_community();


--
-- Name: assignment_submissions assignment_submissions_assignment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.assignment_submissions
    ADD CONSTRAINT assignment_submissions_assignment_id_fkey FOREIGN KEY (assignment_id) REFERENCES public.assignments(id) ON DELETE CASCADE;


--
-- Name: assignments assignments_lesson_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.assignments
    ADD CONSTRAINT assignments_lesson_id_fkey FOREIGN KEY (lesson_id) REFERENCES public.lessons(id) ON DELETE CASCADE;


--
-- Name: blogs blogs_event_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.blogs
    ADD CONSTRAINT blogs_event_id_fkey FOREIGN KEY (event_id) REFERENCES public.events(id) ON DELETE CASCADE;


--
-- Name: bounties bounties_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bounties
    ADD CONSTRAINT bounties_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE SET NULL;


--
-- Name: bounty_payments bounty_payments_submission_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bounty_payments
    ADD CONSTRAINT bounty_payments_submission_id_fkey FOREIGN KEY (submission_id) REFERENCES public.bounty_submissions(id) ON DELETE CASCADE;


--
-- Name: bounty_payments bounty_payments_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bounty_payments
    ADD CONSTRAINT bounty_payments_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: bounty_submissions bounty_submissions_bounty_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bounty_submissions
    ADD CONSTRAINT bounty_submissions_bounty_id_fkey FOREIGN KEY (bounty_id) REFERENCES public.bounties(id) ON DELETE CASCADE;


--
-- Name: bounty_submissions bounty_submissions_reviewed_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bounty_submissions
    ADD CONSTRAINT bounty_submissions_reviewed_by_fkey FOREIGN KEY (reviewed_by) REFERENCES auth.users(id) ON DELETE SET NULL;


--
-- Name: bounty_submissions bounty_submissions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bounty_submissions
    ADD CONSTRAINT bounty_submissions_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: course_enrollments course_enrollments_course_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.course_enrollments
    ADD CONSTRAINT course_enrollments_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.courses(id) ON DELETE CASCADE;


--
-- Name: events events_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.events
    ADD CONSTRAINT events_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE SET NULL;


--
-- Name: group_members group_members_group_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.group_members
    ADD CONSTRAINT group_members_group_id_fkey FOREIGN KEY (group_id) REFERENCES public.student_groups(id) ON DELETE CASCADE;


--
-- Name: jobs jobs_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.jobs
    ADD CONSTRAINT jobs_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE SET NULL;


--
-- Name: lesson_progress lesson_progress_enrollment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.lesson_progress
    ADD CONSTRAINT lesson_progress_enrollment_id_fkey FOREIGN KEY (enrollment_id) REFERENCES public.course_enrollments(id) ON DELETE CASCADE;


--
-- Name: lesson_progress lesson_progress_lesson_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.lesson_progress
    ADD CONSTRAINT lesson_progress_lesson_id_fkey FOREIGN KEY (lesson_id) REFERENCES public.lessons(id) ON DELETE CASCADE;


--
-- Name: lessons lessons_course_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.lessons
    ADD CONSTRAINT lessons_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.courses(id) ON DELETE CASCADE;


--
-- Name: scholarships scholarships_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.scholarships
    ADD CONSTRAINT scholarships_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE SET NULL;


--
-- Name: user_roles user_roles_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: assignment_submissions Admins can grade submissions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can grade submissions" ON public.assignment_submissions FOR UPDATE USING (public.is_admin());


--
-- Name: bounty_submissions Admins can manage all submissions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage all submissions" ON public.bounty_submissions TO authenticated USING (public.is_admin());


--
-- Name: community_links Anyone can view active community links; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can view active community links" ON public.community_links FOR SELECT USING (((is_active = true) OR public.is_admin()));


--
-- Name: group_members Anyone can view group members; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can view group members" ON public.group_members FOR SELECT USING (true);


--
-- Name: bounties Anyone can view live bounties; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can view live bounties" ON public.bounties FOR SELECT USING (((status = 'live'::public.event_status) OR public.is_admin()));


--
-- Name: courses Anyone can view live courses; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can view live courses" ON public.courses FOR SELECT USING (((status = 'live'::public.event_status) OR public.is_admin()));


--
-- Name: events Anyone can view live events; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can view live events" ON public.events FOR SELECT USING (((status = 'live'::public.event_status) OR public.is_admin()));


--
-- Name: hackathons Anyone can view live hackathons; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can view live hackathons" ON public.hackathons FOR SELECT USING (((status = 'live'::public.event_status) OR public.is_admin()));


--
-- Name: jobs Anyone can view live jobs; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can view live jobs" ON public.jobs FOR SELECT USING (((status = 'live'::public.event_status) OR public.is_admin()));


--
-- Name: scholarships Anyone can view live scholarships; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can view live scholarships" ON public.scholarships FOR SELECT USING (((status = 'live'::public.event_status) OR public.is_admin()));


--
-- Name: student_groups Anyone can view public groups; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can view public groups" ON public.student_groups FOR SELECT USING (((is_public = true) OR (created_by = auth.uid())));


--
-- Name: blogs Anyone can view published blogs; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can view published blogs" ON public.blogs FOR SELECT USING (((published = true) OR public.is_admin()));


--
-- Name: student_groups Authenticated users can create groups; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can create groups" ON public.student_groups FOR INSERT WITH CHECK ((auth.uid() = created_by));


--
-- Name: course_enrollments Authenticated users can enroll in courses; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can enroll in courses" ON public.course_enrollments FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: student_profiles Authenticated users can view profiles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can view profiles" ON public.student_profiles FOR SELECT USING ((auth.uid() IS NOT NULL));


--
-- Name: student_groups Group creators can update their groups; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Group creators can update their groups" ON public.student_groups FOR UPDATE USING ((auth.uid() = created_by));


--
-- Name: events Only admins can delete events; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Only admins can delete events" ON public.events FOR DELETE TO authenticated USING (public.is_admin());


--
-- Name: events Only admins can insert events; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Only admins can insert events" ON public.events FOR INSERT TO authenticated WITH CHECK (public.is_admin());


--
-- Name: assignments Only admins can manage assignments; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Only admins can manage assignments" ON public.assignments USING (public.is_admin());


--
-- Name: blogs Only admins can manage blogs; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Only admins can manage blogs" ON public.blogs TO authenticated USING (public.is_admin());


--
-- Name: bounties Only admins can manage bounties; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Only admins can manage bounties" ON public.bounties TO authenticated USING (public.is_admin());


--
-- Name: community_links Only admins can manage community links; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Only admins can manage community links" ON public.community_links USING (public.is_admin());


--
-- Name: courses Only admins can manage courses; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Only admins can manage courses" ON public.courses USING (public.is_admin());


--
-- Name: hackathons Only admins can manage hackathons; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Only admins can manage hackathons" ON public.hackathons USING (public.is_admin());


--
-- Name: jobs Only admins can manage jobs; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Only admins can manage jobs" ON public.jobs TO authenticated USING (public.is_admin());


--
-- Name: lessons Only admins can manage lessons; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Only admins can manage lessons" ON public.lessons USING (public.is_admin());


--
-- Name: bounty_payments Only admins can manage payments; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Only admins can manage payments" ON public.bounty_payments TO authenticated USING (public.is_admin());


--
-- Name: user_roles Only admins can manage roles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Only admins can manage roles" ON public.user_roles TO authenticated USING (public.is_admin());


--
-- Name: scholarships Only admins can manage scholarships; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Only admins can manage scholarships" ON public.scholarships TO authenticated USING (public.is_admin());


--
-- Name: course_enrollments Only admins can update enrollments; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Only admins can update enrollments" ON public.course_enrollments FOR UPDATE USING (public.is_admin());


--
-- Name: events Only admins can update events; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Only admins can update events" ON public.events FOR UPDATE TO authenticated USING (public.is_admin());


--
-- Name: bounty_submissions Users can create submissions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can create submissions" ON public.bounty_submissions FOR INSERT TO authenticated WITH CHECK ((user_id = auth.uid()));


--
-- Name: student_profiles Users can create their own profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can create their own profile" ON public.student_profiles FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: group_members Users can join groups; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can join groups" ON public.group_members FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: assignment_submissions Users can submit assignments; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can submit assignments" ON public.assignment_submissions FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: lesson_progress Users can track their own progress; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can track their own progress" ON public.lesson_progress FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: student_profiles Users can update their own profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their own profile" ON public.student_profiles FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: lesson_progress Users can update their own progress; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their own progress" ON public.lesson_progress FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: assignment_submissions Users can update their pending submissions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their pending submissions" ON public.assignment_submissions FOR UPDATE USING (((user_id = auth.uid()) AND (graded_at IS NULL)));


--
-- Name: bounty_submissions Users can update their pending submissions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their pending submissions" ON public.bounty_submissions FOR UPDATE TO authenticated USING (((user_id = auth.uid()) AND (status = 'pending'::text)));


--
-- Name: assignments Users can view assignments of enrolled courses; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view assignments of enrolled courses" ON public.assignments FOR SELECT USING (((EXISTS ( SELECT 1
   FROM (public.lessons l
     JOIN public.course_enrollments e ON ((e.course_id = l.course_id)))
  WHERE ((l.id = assignments.lesson_id) AND (e.user_id = auth.uid())))) OR public.is_admin()));


--
-- Name: lessons Users can view lessons of enrolled courses or free previews; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view lessons of enrolled courses or free previews" ON public.lessons FOR SELECT USING (((is_free_preview = true) OR (EXISTS ( SELECT 1
   FROM public.course_enrollments
  WHERE ((course_enrollments.course_id = lessons.course_id) AND (course_enrollments.user_id = auth.uid())))) OR public.is_admin()));


--
-- Name: course_enrollments Users can view their own enrollments; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own enrollments" ON public.course_enrollments FOR SELECT USING (((user_id = auth.uid()) OR public.is_admin()));


--
-- Name: bounty_payments Users can view their own payments; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own payments" ON public.bounty_payments FOR SELECT TO authenticated USING (((user_id = auth.uid()) OR public.is_admin()));


--
-- Name: lesson_progress Users can view their own progress; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own progress" ON public.lesson_progress FOR SELECT USING (((user_id = auth.uid()) OR public.is_admin()));


--
-- Name: user_roles Users can view their own roles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own roles" ON public.user_roles FOR SELECT TO authenticated USING ((user_id = auth.uid()));


--
-- Name: assignment_submissions Users can view their own submissions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own submissions" ON public.assignment_submissions FOR SELECT USING (((user_id = auth.uid()) OR public.is_admin()));


--
-- Name: bounty_submissions Users can view their own submissions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own submissions" ON public.bounty_submissions FOR SELECT TO authenticated USING (((user_id = auth.uid()) OR public.is_admin()));


--
-- Name: assignment_submissions; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.assignment_submissions ENABLE ROW LEVEL SECURITY;

--
-- Name: assignments; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;

--
-- Name: blogs; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.blogs ENABLE ROW LEVEL SECURITY;

--
-- Name: bounties; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.bounties ENABLE ROW LEVEL SECURITY;

--
-- Name: bounty_payments; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.bounty_payments ENABLE ROW LEVEL SECURITY;

--
-- Name: bounty_submissions; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.bounty_submissions ENABLE ROW LEVEL SECURITY;

--
-- Name: community_links; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.community_links ENABLE ROW LEVEL SECURITY;

--
-- Name: course_enrollments; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.course_enrollments ENABLE ROW LEVEL SECURITY;

--
-- Name: courses; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;

--
-- Name: events; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

--
-- Name: group_members; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;

--
-- Name: hackathons; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.hackathons ENABLE ROW LEVEL SECURITY;

--
-- Name: jobs; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;

--
-- Name: lesson_progress; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.lesson_progress ENABLE ROW LEVEL SECURITY;

--
-- Name: lessons; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;

--
-- Name: scholarships; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.scholarships ENABLE ROW LEVEL SECURITY;

--
-- Name: student_groups; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.student_groups ENABLE ROW LEVEL SECURITY;

--
-- Name: student_profiles; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.student_profiles ENABLE ROW LEVEL SECURITY;

--
-- Name: user_roles; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

--
-- PostgreSQL database dump complete
--


