create schema if not exists anon_muting;

create table if not exists anon_muting.users
(
    user_id  text                   not null
        constraint users_pk
            primary key,
    muted    boolean  default false not null,
    offence  smallint default 0     not null,
    muted_at timestamp
);

alter table anon_muting.users
    owner to current_user;

create unique index if not exists users_user_id_uindex
    on anon_muting.users (user_id);

create table if not exists anon_muting.events
(
    created_by             text                 not null,
    submissions_channel_id text                 not null,
    review_channel_id      text                 not null,
    event_id               serial               not null
        constraint events_pk
            primary key,
    name                   text                 not null,
    active                 boolean default true not null,
    restriction            integer default 0    not null
);

alter table anon_muting.events
    owner to current_user;

create unique index if not exists events_submissions_channel_id_uindex
    on anon_muting.events (submissions_channel_id);

create unique index if not exists events_event_id_uindex
    on anon_muting.events (event_id);

create table if not exists anon_muting.submissions
(
    submission_id     bigserial not null
        constraint submissions_pk
            primary key,
    user_id           text      not null,
    approved          boolean,
    review_message_id text      not null,
    event_id          integer   not null
        constraint submissions_events_event_id_fk
            references anon_muting.events,
    reviewed_by       text
);

alter table anon_muting.submissions
    owner to current_user;

create unique index if not exists submissions_review_message_id_uindex
    on anon_muting.submissions (review_message_id);

create unique index if not exists submissions_review_message_id_uindex_2
    on anon_muting.submissions (review_message_id);

create unique index if not exists submissions_submission_id_uindex
    on anon_muting.submissions (submission_id);

alter table anon_muting.events 
  add column if not exists publish_reactions text[] not null default '{}';
