INSERT INTO "Leader" (
    "id",
    "name",
    "title",
    "bio",
    "imageUrl",
    "contactEmail",
    "userId",
    "sortOrder",
    "updatedAt"
)
SELECT
    defaults."id",
    defaults."name",
    defaults."title",
    defaults."bio",
    defaults."imageUrl",
    defaults."contactEmail",
    (
        SELECT candidate."id"
        FROM "User" candidate
        WHERE candidate."email" = defaults."contactEmail"
          AND NOT EXISTS (
              SELECT 1
              FROM "Leader" linked
              WHERE linked."userId" = candidate."id"
          )
        LIMIT 1
    ),
    defaults."sortOrder",
    CURRENT_TIMESTAMP
FROM (
    VALUES
      ('00000000-0000-4000-8000-000000000001', 'KIBWANA H. JUMA', 'Pioneer and President', 'As founder and President, Hon. Kibwana sets the Parliament’s vision and strategic priorities, convenes leadership around shared goals, and champions youth inclusion and public participation. The President guides the executive team, builds partnerships that advance coastal development, and helps ensure the Parliament remains accountable to the young people it represents.', 'https://raw.githubusercontent.com/maina098/coastalYouthParliament/main/Hon.Kibwana.jpeg.jpeg', 'kibwanacyp@gmail.com', 0),
      ('00000000-0000-4000-8000-000000000002', 'HON. KHADIJA JILLO', 'Deputy President', 'The Deputy President works closely with the President to turn shared priorities into practical plans and coordinate follow-through across the executive and parliamentary teams. The office monitors progress on decisions, helps resolve coordination gaps, and encourages accountability among leaders. When delegated, the Deputy President represents the President and helps maintain continuity of leadership so ongoing work continues effectively.', 'https://raw.githubusercontent.com/maina098/coastalYouthParliament/main/WhatsApp%20Image%202026-10-21%20at%204.06.09%20AM.jpeg', NULL, 1),
      ('00000000-0000-4000-8000-000000000003', 'HON. NASSIB JUMA', 'Prime Cabinet Secretary', 'The Prime Cabinet Secretary coordinates work across the Cabinet, helps translate the President’s priorities into aligned plans, and follows up on decisions that involve multiple departments. The office supports clear communication between Cabinet Secretaries, tracks progress on shared commitments, and helps resolve coordination gaps so programmes move forward consistently.', 'https://raw.githubusercontent.com/maina098/coastalYouthParliament/main/WhatsApp%20Image%202026-08-14%20at%2011.56.41%20AM.jpeg', NULL, 2),
      ('00000000-0000-4000-8000-000000000004', 'HON. ALI KUBO', 'Speaker of the House', 'A principled and visionary leader entrusted with maintaining the dignity and order of parliamentary proceedings. Hon. Ali Kubo brings a wealth of experience in youth advocacy, governance, and legislative oversight, ensuring every voice in the coastal youth assembly is heard and represented with fairness and integrity.', 'https://raw.githubusercontent.com/maina098/coastalYouthParliament/main/630959814_26425337237072696_7273013418810656639_n.jpg', NULL, 3),
      ('00000000-0000-4000-8000-000000000005', 'HON. DULLA', 'Secretary General', 'The Secretary General serves as the administrative link between Parliament and the Executive, coordinating official communication and keeping leadership records and decisions organized. The office supports meeting preparation, tracks agreed actions, and helps ensure information reaches the right teams so parliamentary and executive work stays aligned.', 'https://raw.githubusercontent.com/maina098/coastalYouthParliament/main/WhatsApp%20Image%202026-08-14%20at%202.19.38%20AM.jpeg', NULL, 4),
      ('00000000-0000-4000-8000-000000000006', 'HON. AISHA YUSUF', 'Attorney General', 'The Attorney General advises the Parliament on legal and constitutional questions, reviews policies and proposed decisions for consistency with applicable rules, and helps leaders understand their obligations. The office promotes fair procedures, supports the development of sound governance frameworks, and helps address legal concerns transparently.', 'https://raw.githubusercontent.com/maina098/coastalYouthParliament/main/WhatsApp%20Image%202026-10-21%20at%204.06.11%20AM.jpeg', NULL, 5),
      ('00000000-0000-4000-8000-000000000007', 'HON. EMMANUEL MAINGI', 'CABINET SECRETARY FOR TREASURY', 'The Cabinet Secretary for Treasury leads financial planning for Parliament programmes, prepares budget priorities with the leadership team, and monitors how approved funds are allocated. The office promotes responsible financial management, provides clear updates on expenditure and resource needs, and supports sustainable initiatives that strengthen youth participation and regional development.', 'https://raw.githubusercontent.com/maina098/coastalYouthParliament/main/WhatsApp%20Image%202026-08-14%20at%2012.12.22%20PM.jpeg', NULL, 6),
      ('00000000-0000-4000-8000-000000000008', 'HON. BARKE RASHID', 'Cabinet Secretary for Mining, Blue Economy and Maritime Affairs', 'The Cabinet Secretary promotes responsible development of mineral resources and sustainable use of coastal and marine assets. The office advances blue-economy and maritime opportunities, supports sector partnerships, and encourages investment and livelihoods while safeguarding the region’s natural resources.', '/images/barke-rashid.jpg', NULL, 7),
      ('00000000-0000-4000-8000-000000000009', 'HON. MKASI HAMISI', 'Deputy Cabinet Secretary for Finance', 'The Deputy Cabinet Secretary for Finance supports the Treasury with budget preparation, expenditure tracking, and accurate financial records. The office helps monitor approved spending, prepare timely financial updates, identify funding needs, and strengthen transparent, accountable planning for Parliament programmes.', 'https://raw.githubusercontent.com/maina098/coastalYouthParliament/main/WhatsApp%20Image%202026-10-18%20at%208.52.20%20PM.jpeg', NULL, 8),
      ('00000000-0000-4000-8000-000000000010', 'HON. ANDERSON MAINA', 'Cabinet Secretary for ICT', 'The Cabinet Secretary for ICT oversees the digital tools and systems that support the Parliament’s work, from internal communication to public engagement. The office promotes secure, reliable access to information, supports digital skills and innovation, and identifies practical technology improvements that make coordination and service delivery more effective.', 'https://raw.githubusercontent.com/maina098/coastalYouthParliament/main/WhatsApp%20Image%202026-08-14%20at%2012.31.16%20PM.jpeg', NULL, 9)
) AS defaults("id", "name", "title", "bio", "imageUrl", "contactEmail", "sortOrder")
WHERE NOT EXISTS (
    SELECT 1
    FROM "Leader" existing
    WHERE LOWER(TRIM(existing."name")) = LOWER(TRIM(defaults."name"))
)
ON CONFLICT ("id") DO NOTHING;
