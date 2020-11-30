create table users
(
    user_id  text                   not null
        constraint users_pk
            primary key,
    muted    boolean  default false not null,
    offence  smallint default 0     not null,
    muted_at timestamp
);

alter table users
    owner to current_user;

create unique index users_user_id_uindex
    on users (user_id);

create table events
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

alter table events
    owner to current_user;

create unique index events_submissions_channel_id_uindex
    on events (submissions_channel_id);

create unique index events_event_id_uindex
    on events (event_id);

create table submissions
(
    submission_id     bigserial not null
        constraint submissions_pk
            primary key,
    user_id           text      not null,
    approved          boolean,
    review_message_id text      not null,
    event_id          integer   not null
        constraint submissions_events_event_id_fk
            references events,
    reviewed_by       text
);

alter table submissions
    owner to current_user;

create unique index submissions_review_message_id_uindex
    on submissions (review_message_id);

create unique index submissions_review_message_id_uindex_2
    on submissions (review_message_id);

create unique index submissions_submission_id_uindex
    on submissions (submission_id);

