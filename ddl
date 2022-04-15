create table tags (
    id serial primary key,
    tag_id int unique ,
    description varchar
);

INSERT INTO tags (tag_id, description) VALUES (
                         4, 'test description 3'
                        );

select * from tags;


DELETE FROM tags;

UPDATE tags SET description = 'new dd' where tags.tag_id = 1;