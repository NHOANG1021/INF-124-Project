INSERT INTO Store (ItemName, ItemType, Price, Art, Description)
VALUES
('Dark Theme', 1, 500, 'moon', 'A midnight UI skin for deep-focus work sessions.'),
('Space Theme', 1, 500, 'planet', 'A cosmic dashboard with brighter highlights and stars.'),
('Forest Theme', 1, 500, 'forest', 'A calm woodland palette for a softer productivity mood.'),
('Pink Strawberry Theme', 1, 650, 'strawberry', 'A playful pink UI with sweet berry highlights and soft cards.'),
('Orange Citrus Theme', 1, 650, 'orange', 'A bright tangerine theme with warm glow accents and energy.'),
('Blue Ocean Theme', 1, 650, 'ocean', 'A refreshing deep-sea palette with cool blues and wave tones.'),
('Double XP', 2, 1000, 'xp', 'Boost rewards for the next streak of completed tasks.'),
('Task Extension', 2, 750, 'calendar', 'Use one extension token when you need extra time.'),
('Custom Avatar', 2, 1200, 'avatar', 'Unlock a personalized profile look and badge frame.'),
('Strawberry Frame', 3, 300, 'frame-strawberry', 'A rosy berry frame that wraps your avatar in pink highlights.'),
('Citrus Frame', 3, 300, 'frame-orange', 'A sunny orange frame for a bold and energetic profile look.'),
('Ocean Frame', 3, 300, 'frame-ocean', 'A cool blue frame that gives your avatar a wave-inspired border.');

INSERT INTO dbo.ItemType ([ItemTypeID], [TypeName])
VALUES
(1, 'Themes'),
(2, 'Powerups'), 
(3, 'Cosmetic')

