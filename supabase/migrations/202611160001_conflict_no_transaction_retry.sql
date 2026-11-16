-- Business conflicts are not transient SQL serialization failures. Return HTTP 409
-- so PostgREST releases the connection instead of retrying an unchanged revision.
DO $migration$
DECLARE definition text;
BEGIN
 SELECT pg_get_functiondef('public.save_child_progress(uuid,bigint,uuid,jsonb,jsonb)'::regprocedure) INTO definition;
 IF position('errcode=''40001''' in definition)=0 THEN
  RAISE EXCEPTION 'Expected revision conflict SQLSTATE not found';
 END IF;
 EXECUTE replace(definition, 'errcode=''40001''', 'errcode=''PT409''');
END
$migration$;
