CREATE OR REPLACE FUNCTION public.get_my_work_order_review_status(
  p_work_order_id uuid
)
RETURNS TABLE (
  reviewed_by_me boolean,
  reviewed_by_other boolean
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
DECLARE
  v_user_id uuid := auth.uid();
  v_client_id uuid;
  v_provider_id uuid;
  v_other_user_id uuid;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'You must sign in first.';
  END IF;

  SELECT client_id, provider_id
  INTO v_client_id, v_provider_id
  FROM public.work_orders
  WHERE id = p_work_order_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Work order not found.';
  END IF;

  IF v_user_id <> v_client_id AND v_user_id <> v_provider_id THEN
    RAISE EXCEPTION 'You are not a participant in this work order.';
  END IF;

  v_other_user_id := CASE
    WHEN v_user_id = v_client_id THEN v_provider_id
    ELSE v_client_id
  END;

  RETURN QUERY
  SELECT
    EXISTS (
      SELECT 1
      FROM public.work_order_reviews r
      WHERE r.work_order_id = p_work_order_id
        AND r.reviewer_id = v_user_id
    ),
    EXISTS (
      SELECT 1
      FROM public.work_order_reviews r
      WHERE r.work_order_id = p_work_order_id
        AND r.reviewer_id = v_other_user_id
    );
END;
$$;

REVOKE ALL ON FUNCTION public.get_my_work_order_review_status(uuid)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_my_work_order_review_status(uuid)
  TO authenticated;
