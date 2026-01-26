-- Fix function search_path for generate_quiz_code
CREATE OR REPLACE FUNCTION public.generate_quiz_code()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  result TEXT := '';
  i INTEGER;
BEGIN
  FOR i IN 1..6 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
  END LOOP;
  RETURN result;
END;
$$;

-- Fix function search_path for set_quiz_code
CREATE OR REPLACE FUNCTION public.set_quiz_code()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  new_code TEXT;
  code_exists BOOLEAN;
BEGIN
  IF NEW.quiz_code IS NULL OR NEW.quiz_code = '' THEN
    LOOP
      new_code := public.generate_quiz_code();
      SELECT EXISTS(SELECT 1 FROM public.quizzes WHERE quiz_code = new_code) INTO code_exists;
      EXIT WHEN NOT code_exists;
    END LOOP;
    NEW.quiz_code := new_code;
  END IF;
  RETURN NEW;
END;
$$;