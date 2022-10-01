CREATE TABLE "public.users" (
	"id" serial NOT NULL,
	"name" varchar(85) NOT NULL,
	"email" varchar(60) NOT NULL,
	"password" varchar(65) NOT NULL,
	"phone" varchar(14),
	"cpf" varchar(18),
	"uf" char(2),
	"created_at" DATE NOT NULL DEFAULT 'current_timestamp',
	"updated_at" DATE NOT NULL DEFAULT 'current_timestamp',
	CONSTRAINT "users_pk" PRIMARY KEY ("id")
) WITH (
  OIDS=FALSE
);



CREATE TABLE "public.tasks" (
	"id" serial NOT NULL,
	"user_id" integer NOT NULL,
	"name" varchar(100) NOT NULL,
	"deadline_date" DATE NOT NULL,
	"deadline_time" TIME NOT NULL,
	"description" varchar(355),
	"created_at" DATE NOT NULL DEFAULT 'current_timestamp',
	"updated_at" DATE NOT NULL DEFAULT 'current_timestamp',
	CONSTRAINT "tasks_pk" PRIMARY KEY ("id")
) WITH (
  OIDS=FALSE
);



CREATE TABLE "public.projects" (
	"id" serial NOT NULL,
	"user_id" integer NOT NULL,
	"name" varchar(100) NOT NULL,
	"created_at" DATE NOT NULL DEFAULT 'current_timestamp',
	"updated_at" DATE NOT NULL DEFAULT 'current_timestamp',
	CONSTRAINT "projects_pk" PRIMARY KEY ("id")
) WITH (
  OIDS=FALSE
);



CREATE TABLE "public.proj_tasks" (
	"id" serial NOT NULL,
	"proj_id" integer NOT NULL,
	"task_num" integer(2) NOT NULL,
	"name" varchar(100) NOT NULL,
	"description" varchar(355),
	"deadline" DATE,
	"situation" integer(1) DEFAULT '1',
	"was_finished" BOOLEAN DEFAULT 'false',
	CONSTRAINT "proj_tasks_pk" PRIMARY KEY ("id")
) WITH (
  OIDS=FALSE
);



CREATE TABLE "public.bibliography" (
	"id" serial NOT NULL,
	"user_id" integer NOT NULL,
	"author" varchar(85) NOT NULL,
	"name" varchar(325) NOT NULL,
	"publication_date" DATE NOT NULL,
	"created_at" DATE NOT NULL DEFAULT 'current_timestamp',
	CONSTRAINT "bibliography_pk" PRIMARY KEY ("id")
) WITH (
  OIDS=FALSE
);



CREATE TABLE "public.user_preferences" (
	"id" serial NOT NULL,
	"user_id" integer NOT NULL,
	"image_path" varchar(255) NOT NULL,
	"default_theme" integer(1) NOT NULL,
	CONSTRAINT "user_preferences_pk" PRIMARY KEY ("id")
) WITH (
  OIDS=FALSE
);




ALTER TABLE "tasks" ADD CONSTRAINT "tasks_fk0" FOREIGN KEY ("user_id") REFERENCES "users"("id");

ALTER TABLE "projects" ADD CONSTRAINT "projects_fk0" FOREIGN KEY ("user_id") REFERENCES "users"("id");

ALTER TABLE "proj_tasks" ADD CONSTRAINT "proj_tasks_fk0" FOREIGN KEY ("proj_id") REFERENCES "projects"("id");

ALTER TABLE "bibliography" ADD CONSTRAINT "bibliography_fk0" FOREIGN KEY ("user_id") REFERENCES "users"("id");

ALTER TABLE "user_preferences" ADD CONSTRAINT "user_preferences_fk0" FOREIGN KEY ("user_id") REFERENCES "users"("id");

