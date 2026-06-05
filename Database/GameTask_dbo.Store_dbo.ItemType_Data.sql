INSERT INTO dbo.STORE ([ItemName], [ItemType], [Price])
VALUES 
('Dark Theme', 1, 500), 
('Space Theme', 1, 500), 
('Forest Theme', 1, 500), 
-- ('Double XP', 2, 500), 
-- ('Task Extension', 2, 500) 
-- ('Custom Avatar', 3, 500)

INSERT INTO dbo.ItemType ([ItemTypeID], [TypeName])
VALUES
(1, 'Themes'),
-- (2, 'Powerups'), 
(2, 'Cosmetic')

