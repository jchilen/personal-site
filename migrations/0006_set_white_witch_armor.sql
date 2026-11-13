-- The White Witch's armor is too complex to map onto this tool's rules, so it's treated as 3, a
-- fixed stand-in, instead of the 0 on its sheet. The Frame Survivability page explains this
-- wherever the White Witch's numbers appear.
UPDATE lancer_frames SET armor = 3 WHERE name = 'White Witch';