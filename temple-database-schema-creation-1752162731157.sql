--
-- PostgreSQL database dump
--

-- Dumped from database version 16.3 (PGlite 0.2.0)
-- Dumped by pg_dump version 16.4

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'SQL_ASCII';
SET standard_conforming_strings = off;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET escape_string_warning = off;
SET row_security = off;

--
-- Name: meta; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA meta;


ALTER SCHEMA meta OWNER TO postgres;

--
-- Name: vector; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS vector WITH SCHEMA public;


--
-- Name: EXTENSION vector; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION vector IS 'vector data type and ivfflat and hnsw access methods';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: embeddings; Type: TABLE; Schema: meta; Owner: postgres
--

CREATE TABLE meta.embeddings (
    id bigint NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    content text NOT NULL,
    embedding public.vector(384) NOT NULL
);


ALTER TABLE meta.embeddings OWNER TO postgres;

--
-- Name: embeddings_id_seq; Type: SEQUENCE; Schema: meta; Owner: postgres
--

ALTER TABLE meta.embeddings ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME meta.embeddings_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: migrations; Type: TABLE; Schema: meta; Owner: postgres
--

CREATE TABLE meta.migrations (
    version text NOT NULL,
    name text,
    applied_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE meta.migrations OWNER TO postgres;

--
-- Name: favorite_pagodas; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.favorite_pagodas (
    id bigint NOT NULL,
    user_id bigint NOT NULL,
    pagoda_id bigint NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.favorite_pagodas OWNER TO postgres;

--
-- Name: favorite_pagodas_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.favorite_pagodas ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.favorite_pagodas_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: temples; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.temples (
    id bigint NOT NULL,
    name text NOT NULL,
    description text,
    province text,
    district text,
    ward text,
    address_detail text,
    latitude double precision,
    longitude double precision,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.temples OWNER TO postgres;

--
-- Name: temples_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.temples ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.temples_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id bigint NOT NULL,
    username text NOT NULL,
    email text NOT NULL,
    password text NOT NULL,
    is_admin boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.users ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.users_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Data for Name: embeddings; Type: TABLE DATA; Schema: meta; Owner: postgres
--



--
-- Data for Name: migrations; Type: TABLE DATA; Schema: meta; Owner: postgres
--

INSERT INTO meta.migrations VALUES ('202407160001', 'embeddings', '2025-06-29 14:23:52.122+00');


--
-- Data for Name: favorite_pagodas; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: temples; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Name: embeddings_id_seq; Type: SEQUENCE SET; Schema: meta; Owner: postgres
--

SELECT pg_catalog.setval('meta.embeddings_id_seq', 1, false);


--
-- Name: favorite_pagodas_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.favorite_pagodas_id_seq', 1, false);


--
-- Name: temples_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.temples_id_seq', 1, false);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_id_seq', 1, false);


--
-- Name: embeddings embeddings_pkey; Type: CONSTRAINT; Schema: meta; Owner: postgres
--

ALTER TABLE ONLY meta.embeddings
    ADD CONSTRAINT embeddings_pkey PRIMARY KEY (id);


--
-- Name: migrations migrations_pkey; Type: CONSTRAINT; Schema: meta; Owner: postgres
--

ALTER TABLE ONLY meta.migrations
    ADD CONSTRAINT migrations_pkey PRIMARY KEY (version);


--
-- Name: favorite_pagodas favorite_pagodas_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.favorite_pagodas
    ADD CONSTRAINT favorite_pagodas_pkey PRIMARY KEY (id);


--
-- Name: temples temples_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.temples
    ADD CONSTRAINT temples_pkey PRIMARY KEY (id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: favorite_pagodas favorite_pagodas_pagoda_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.favorite_pagodas
    ADD CONSTRAINT favorite_pagodas_pagoda_id_fkey FOREIGN KEY (pagoda_id) REFERENCES public.temples(id);


--
-- Name: favorite_pagodas favorite_pagodas_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.favorite_pagodas
    ADD CONSTRAINT favorite_pagodas_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- PostgreSQL database dump complete
--

