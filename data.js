(function () {
  "use strict";

  const LAST_CHECKED = "2026-05-04";

  const subjects = [
    {
      id: "reasoning",
      name: "Reasoning",
      color: "#55c7ff",
      topics: [
        "Series",
        "Coding-decoding",
        "Blood relation",
        "Direction",
        "Analogy",
        "Classification",
        "Syllogism",
        "Statement/conclusion"
      ]
    },
    {
      id: "maths",
      name: "Maths/Data Analysis",
      color: "#2de38b",
      topics: [
        "Percentage",
        "Ratio",
        "Average",
        "Profit/loss",
        "Simple interest",
        "Time and work",
        "Tables/charts"
      ]
    },
    {
      id: "gk",
      name: "GK/Current Affairs",
      color: "#ffad66",
      topics: [
        "Awards",
        "Appointments",
        "Sports",
        "Economy",
        "Science and technology",
        "Environment",
        "Important days",
        "Punjab current affairs"
      ]
    },
    {
      id: "punjab-history",
      name: "Punjab History",
      color: "#d6a94d",
      topics: [
        "Physical features of Punjab",
        "Ancient Punjab",
        "Sikh Gurus",
        "Adi Granth",
        "Bhakti and Sufi movement",
        "Sikh rulers",
        "Freedom movements",
        "Punjabi culture"
      ]
    },
    {
      id: "punjabi",
      name: "Punjabi",
      color: "#9b8cff",
      topics: [
        "Guru topics",
        "Synonyms/antonyms",
        "Muhavare",
        "Akhan",
        "Shabad bhed",
        "Agetar/pichettar",
        "Ling/vachan",
        "Vishram chinh",
        "Shudh-ashudh"
      ]
    },
    {
      id: "english",
      name: "English",
      color: "#55c7ff",
      topics: [
        "Subject-verb agreement",
        "Articles",
        "Prepositions",
        "Active/passive",
        "Direct/indirect",
        "Synonyms/antonyms",
        "One-word substitution",
        "Idioms",
        "Spelling correction"
      ]
    },
    {
      id: "ict",
      name: "ICT",
      color: "#2de38b",
      topics: [
        "Computer basics",
        "Input/output devices",
        "Internet",
        "MS Word",
        "Excel",
        "PowerPoint",
        "Shortcuts",
        "File types"
      ]
    },
    {
      id: "excise",
      name: "Excise Act",
      color: "#ff6271",
      topics: [
        "Important sections",
        "Tax basics",
        "Compliance concepts"
      ]
    },
    {
      id: "punjab-gk",
      name: "Punjab GK",
      color: "#ffe3a3",
      topics: [
        "Districts",
        "Rivers",
        "Culture",
        "Literature",
        "Important places"
      ]
    }
  ];

  const defaultSchedule = [
    {
      id: "run",
      title: "Running",
      start: "05:00",
      end: "07:00",
      category: "Fitness",
      color: "#2de38b",
      description: "Morning run, mobility, and breath work before study."
    },
    {
      id: "study",
      title: "Deep Study",
      start: "09:00",
      end: "17:00",
      category: "Study",
      color: "#d6a94d",
      description: "Core syllabus blocks, notes, MCQs, and active recall."
    },
    {
      id: "revision",
      title: "Night Revision",
      start: "21:00",
      end: "22:00",
      category: "Revision",
      color: "#9b8cff",
      description: "Mistake notebook, weak topics, and light recall only."
    }
  ];

  const phaseTasks = {
    basics: [
      ["Reasoning foundations", "Solve 25 questions from Series, Coding-decoding, and Analogy.", "Reasoning", ["Series", "Coding-decoding", "Analogy"]],
      ["Maths basics", "Revise percentage, ratio, averages, and 20 calculation drills.", "Maths/Data Analysis", ["Percentage", "Ratio", "Average"]],
      ["Punjab History base", "Read one compact note on physical features and ancient Punjab.", "Punjab History", ["Physical features of Punjab", "Ancient Punjab"]],
      ["Punjabi basics", "Revise shudh-ashudh, ling/vachan, and 20 vocabulary pairs.", "Punjabi", ["Shudh-ashudh", "Ling/vachan", "Synonyms/antonyms"]],
      ["GK/current affairs", "Read 30 minutes of official current affairs and make 8 one-line notes.", "GK/Current Affairs", ["Important days", "Punjab current affairs"]]
    ],
    scoring: [
      ["Punjabi Part A", "Attempt one qualifying Punjabi grammar drill and review errors.", "Punjabi", ["Guru topics", "Muhavare", "Agetar/pichettar"]],
      ["English accuracy", "Practice articles, prepositions, SVA, and error spotting.", "English", ["Articles", "Prepositions", "Subject-verb agreement"]],
      ["ICT scoring block", "Revise computer basics, file types, office tools, and shortcuts.", "ICT", ["Computer basics", "File types", "Shortcuts"]],
      ["GK/current affairs", "Make a current affairs micro-capsule from PIB/News sources.", "GK/Current Affairs", ["Awards", "Appointments", "Economy"]],
      ["Punjab History revision", "Revise Sikh Gurus, Adi Granth, and culture with MCQs.", "Punjab History", ["Sikh Gurus", "Adi Granth", "Punjabi culture"]]
    ],
    mock: [
      ["Full mock", "Attempt a timed mixed quiz or paper-practice set.", "Mock Tests", ["Full mocks"]],
      ["Sectional test", "Take one sectional test from your weakest subject.", "MCQs", ["Sectional tests"]],
      ["Mock analysis", "Write three errors, the cause, and the fix in the mistake notebook.", "Progress", ["Mock analysis"]],
      ["Mistake notebook revision", "Redo yesterday's wrong questions without looking at answers.", "MCQs", ["Mistake notebook revision"]],
      ["Current affairs recall", "Revise 20 current affairs facts with answer-first recall.", "GK/Current Affairs", ["Punjab current affairs", "Important days"]]
    ],
    final: [
      ["Revision only", "Revise short notes and formulas; avoid fresh heavy topics.", "Revision", ["Revision only"]],
      ["Light MCQs", "Do 25 light MCQs and stop before fatigue starts.", "MCQs", ["Light MCQs"]],
      ["Punjabi confidence", "Revise one Punjabi grammar set and Guru topic notes.", "Punjabi", ["Guru topics", "Shudh-ashudh"]],
      ["Sleep and confidence", "Pack documents, plan sleep, and do a calm 10-minute review.", "Habits", ["Sleep and confidence"]]
    ]
  };

  const materialResources = [
    {
      id: "official-psssb-home",
      title: "PSSSB Official Website",
      subject: "Official Resources",
      topic: "Official updates",
      type: "Official",
      sourceName: "Subordinate Services Selection Board, Punjab",
      url: "https://sssb.punjab.gov.in/",
      sourceBadge: "Official",
      lastChecked: LAST_CHECKED,
      description: "Official recruitment, notices, admit-card updates, results, and downloads.",
      keyPoints: [
        "Use this as the first source for all exam notices.",
        "The site lists Group C recruitment, downloads, circulars, and latest notices.",
        "The official site notes that content is published and managed by Government of Punjab."
      ],
      tags: ["PSSSB", "Official updates", "Notification"]
    },
    {
      id: "official-advt-page-2026",
      title: "Advertisement No. 01 of 2026 - Vacancy Page",
      subject: "Official Resources",
      topic: "Notification",
      type: "Official",
      sourceName: "PSSSB Group C Vacancy Page",
      url: "https://sssb.punjab.gov.in/vacancy/?key=vacancy_group_c&value=1712",
      sourceBadge: "Official",
      lastChecked: LAST_CHECKED,
      description: "Official page for Excise and Taxation Inspector Advertisement No. 01/2026.",
      keyPoints: [
        "Lists Advertisement No. 01 of 2026 for Excise and Taxation Inspector.",
        "Shows the official advertisement and syllabus/action links.",
        "Use it to verify future corrections, syllabus changes, and official notices."
      ],
      tags: ["PSSSB", "Excise Inspector", "Syllabus", "Notification"]
    },
    {
      id: "official-advt-pdf-2026",
      title: "Excise and Taxation Inspector Advertisement PDF 2026",
      subject: "Official Resources",
      topic: "Notification",
      type: "PDF",
      sourceName: "PSSSB",
      url: "https://sssb.punjab.gov.in/wp-content/uploads/2026/02/Advertisement-Excise-Inspector-13-2.pdf",
      sourceBadge: "Official",
      lastChecked: LAST_CHECKED,
      description: "Official Punjabi PDF for 197 Excise and Taxation Inspector posts.",
      keyPoints: [
        "Advertisement identifies the post as Excise and Taxation Inspector and lists 197 vacancies.",
        "Online application window in the PDF runs from 13 February 2026 to 6 March 2026.",
        "Selection is by objective written examination; Part A Punjabi is qualifying and Part B determines merit."
      ],
      tags: ["PSSSB", "197 vacancies", "Part A", "Part B", "Negative marking"]
    },
    {
      id: "official-written-exam-notice-2026",
      title: "Written Exam Notice - 31 May 2026",
      subject: "Official Resources",
      topic: "Exam date",
      type: "PDF",
      sourceName: "PSSSB",
      url: "https://sssb.punjab.gov.in/wp-content/uploads/2026/04/Written-Exam-Notice.pdf",
      sourceBadge: "Official",
      lastChecked: LAST_CHECKED,
      description: "Official public notice for the Excise and Taxation Inspector written exam date.",
      keyPoints: [
        "Public notice says the written examination for Advertisement No. 01/2026 will be held on 31 May 2026.",
        "Candidates are directed to keep checking the PSSSB website for latest updates.",
        "Use this date for CrackTrack countdown unless the board publishes a new notice."
      ],
      tags: ["Exam date", "31 May 2026", "PSSSB"]
    },
    {
      id: "psssb-forms-downloads",
      title: "PSSSB Application Forms and Downloads",
      subject: "Official Resources",
      topic: "Forms",
      type: "Official",
      sourceName: "PSSSB",
      url: "https://sssb.punjab.gov.in/forms-downloads/",
      sourceBadge: "Official",
      lastChecked: LAST_CHECKED,
      description: "Official downloads for candidate forms and related documents.",
      keyPoints: [
        "Useful for checking candidate forms and board downloads.",
        "Keep final documents verified against the latest official page.",
        "Do not rely on third-party form copies during counselling."
      ],
      tags: ["Forms", "Downloads", "Counselling"]
    },
    {
      id: "psssb-group-c",
      title: "PSSSB Group C Recruitment Listings",
      subject: "Official Resources",
      topic: "Official updates",
      type: "Official",
      sourceName: "PSSSB",
      url: "https://sssb.punjab.gov.in/vacancy-group-c/",
      sourceBadge: "Official",
      lastChecked: LAST_CHECKED,
      description: "Group C recruitment table where Advertisement No. 01/2026 appears.",
      keyPoints: [
        "Use it to confirm the current recruitment row.",
        "The page lists Group C advertisements and view links.",
        "Check for newly posted updates, corrections, and syllabus links."
      ],
      tags: ["Group C", "Recruitment", "Official"]
    },
    {
      id: "syllabus-revised-public-pdf",
      title: "Revised Syllabus Public PDF Mirror",
      subject: "Official Resources",
      topic: "Syllabus",
      type: "PDF",
      sourceName: "Public PDF mirror of PSSSB syllabus notice",
      url: "https://blogmedia.testbook.com/blog/wp-content/uploads/2023/02/revised-syllabus-for-excise-and-taxation-inspector-b102c62a.pdf",
      sourceBadge: "Public Source",
      lastChecked: LAST_CHECKED,
      description: "Public mirror of a PSSSB syllabus notice. Verify against the official PSSSB vacancy page before final exam use.",
      keyPoints: [
        "Part B topics include GK/current affairs, reasoning, numerical ability, English, Punjabi, ICT, and Punjab History/Culture.",
        "Approximate weightage in that public copy gives strong priority to GK/current affairs and reasoning/maths.",
        "Treat this as a convenience copy, not the final authority."
      ],
      tags: ["Syllabus", "Part B", "Public mirror"]
    },
    {
      id: "punjab-gov-history",
      title: "Punjab History - Government of Punjab, India",
      subject: "Punjab History",
      topic: "Ancient Punjab",
      type: "Article",
      sourceName: "Government of Punjab, India",
      url: "https://punjab.gov.in/know-punjab/history//",
      sourceBadge: "Official",
      lastChecked: LAST_CHECKED,
      description: "Official overview of Punjab history and the origin of the name Punjab.",
      keyPoints: [
        "Good starting point for a clean Punjab history timeline.",
        "Useful for forming one-page revision notes.",
        "Cross-check detailed facts with syllabus and standard history sources."
      ],
      tags: ["Punjab History", "Ancient Punjab", "Culture"]
    },
    {
      id: "punjab-gov-culture",
      title: "Punjab Culture - Government of Punjab, India",
      subject: "Punjab GK",
      topic: "Culture",
      type: "Article",
      sourceName: "Government of Punjab, India",
      url: "https://punjab.gov.in/culture",
      sourceBadge: "Official",
      lastChecked: LAST_CHECKED,
      description: "Official state portal page on Punjab's cultural heritage.",
      keyPoints: [
        "Use for culture keywords, arts, traditions, and heritage framing.",
        "Turn headings into flashcards for quick recall.",
        "Pair with Punjabi culture MCQs and revision notes."
      ],
      tags: ["Punjab GK", "Culture", "Important places"]
    },
    {
      id: "punjab-district-portal",
      title: "Punjab District Portal",
      subject: "Punjab GK",
      topic: "Districts",
      type: "Official",
      sourceName: "Government of Punjab District Portal",
      url: "https://punjab.s3waas.gov.in/index.html",
      sourceBadge: "Official",
      lastChecked: LAST_CHECKED,
      description: "Official district portal entry point for district-wise Punjab information.",
      keyPoints: [
        "Use for district names, district websites, and administrative reference.",
        "Good source for district-wise quick revision.",
        "Bookmark district pages for targeted Punjab GK notes."
      ],
      tags: ["Districts", "Punjab GK", "Administration"]
    },
    {
      id: "indiacode-punjab-excise-act",
      title: "Punjab Excise Act, 1914 - IndiaCode PDF",
      subject: "Excise Act",
      topic: "Important sections",
      type: "PDF",
      sourceName: "IndiaCode",
      url: "https://www.indiacode.nic.in/bitstream/123456789/21047/1/thepunjabexciseact.pdf",
      sourceBadge: "Official/Public",
      lastChecked: LAST_CHECKED,
      description: "Public IndiaCode PDF for the Punjab Excise Act, 1914.",
      keyPoints: [
        "Read definitions first, then administration, license, duty, search/seizure, and penalties.",
        "For exam prep, make section-number flashcards instead of reading the whole Act every day.",
        "Use latest official state updates if a provision has been amended."
      ],
      tags: ["Excise Act", "Sections", "Compliance"]
    },
    {
      id: "chandigarh-excise-act-pdf",
      title: "Punjab Excise Act, 1914 - Chandigarh Public PDF",
      subject: "Excise Act",
      topic: "Important sections",
      type: "PDF",
      sourceName: "Chandigarh Administration",
      url: "https://chandigarh.gov.in/sites/default/files/Updation26/punexaact1914.pdf",
      sourceBadge: "Official/Public",
      lastChecked: LAST_CHECKED,
      description: "Public PDF copy hosted by Chandigarh Administration; useful as an alternate readable copy.",
      keyPoints: [
        "Use as an alternate reading copy for the Act.",
        "Keep Punjab-specific amendments in mind.",
        "Build MCQs from definitions, duties, licensing powers, and offences."
      ],
      tags: ["Excise Act", "Bare Act", "Compliance"]
    },
    {
      id: "gst-council-gst-overview",
      title: "GST Council - GST Data and Overview",
      subject: "Excise Act",
      topic: "Tax basics",
      type: "Official",
      sourceName: "Goods and Services Tax Council",
      url: "https://gstcouncil.gov.in/gst",
      sourceBadge: "Official",
      lastChecked: LAST_CHECKED,
      description: "Official GST Council page for tax basics and GST context.",
      keyPoints: [
        "Use for GST structure and tax terminology.",
        "Separate GST basics from excise-specific legal sections.",
        "Good for short notes on indirect tax vocabulary."
      ],
      tags: ["Tax basics", "GST", "Economy"]
    },
    {
      id: "rbi-financial-education",
      title: "RBI Financial Education",
      subject: "GK/Current Affairs",
      topic: "Economy",
      type: "Article",
      sourceName: "Reserve Bank of India",
      url: "https://www.rbi.org.in/FinancialEducation/Home.aspx",
      sourceBadge: "Official",
      lastChecked: LAST_CHECKED,
      description: "RBI financial education material for banking, KYC, digital finance, and consumer awareness basics.",
      keyPoints: [
        "Useful for economy and financial awareness basics.",
        "RBI notes cover good financial practices and digital awareness.",
        "Make short MCQs from KYC, banking safety, and digital payment terms."
      ],
      tags: ["Economy", "Finance", "KYC"]
    },
    {
      id: "pib-all-releases",
      title: "PIB All Press Releases",
      subject: "GK/Current Affairs",
      topic: "Current affairs",
      type: "Article",
      sourceName: "Press Information Bureau",
      url: "https://pib.gov.in/Allrel.aspx",
      sourceBadge: "Official",
      lastChecked: LAST_CHECKED,
      description: "Official Government of India press release listing for current affairs.",
      keyPoints: [
        "Use for schemes, appointments, awards, economy, environment, science, and national updates.",
        "Do not over-read; filter by exam-relevant ministries and make concise one-line notes.",
        "Use CrackTrack's monthly capsule resources for planned revision."
      ],
      tags: ["Current affairs", "Awards", "Appointments", "Economy"]
    },
    {
      id: "india-gov-pib-news",
      title: "National Portal - PIB News",
      subject: "GK/Current Affairs",
      topic: "Current affairs",
      type: "Article",
      sourceName: "National Portal of India",
      url: "https://www.india.gov.in/news/pib-news",
      sourceBadge: "Official",
      lastChecked: LAST_CHECKED,
      description: "National Portal entry for PIB news and government press releases.",
      keyPoints: [
        "Alternate access point for official current affairs.",
        "Useful when PIB pages are slow or hard to filter.",
        "Convert headlines into one-question flashcards."
      ],
      tags: ["Current affairs", "Official updates"]
    },
    {
      id: "prs-monthly-policy",
      title: "PRS Monthly Policy Review",
      subject: "GK/Current Affairs",
      topic: "Polity basics",
      type: "Article",
      sourceName: "PRS Legislative Research",
      url: "https://prsindia.org/policy/monthly-policy-review",
      sourceBadge: "Public Source",
      lastChecked: LAST_CHECKED,
      description: "Free monthly policy review useful for polity, economy, governance, and legislation summaries.",
      keyPoints: [
        "Use for high-value monthly policy updates.",
        "Best for polity and economy consolidation.",
        "Make notes only on topics relevant to Group C general awareness."
      ],
      tags: ["Polity basics", "Economy", "Current affairs"]
    },
    {
      id: "prs-primers",
      title: "PRS Primers",
      subject: "GK/Current Affairs",
      topic: "Constitution/Polity basics",
      type: "Article",
      sourceName: "PRS Legislative Research",
      url: "https://prsindia.org/parliamenttrack/primers",
      sourceBadge: "Public Source",
      lastChecked: LAST_CHECKED,
      description: "Short primers on Parliament, policy, institutions, and governance.",
      keyPoints: [
        "Use primers for quick polity fundamentals.",
        "Turn each primer into five MCQs.",
        "Pair with NCERT civics for foundational clarity."
      ],
      tags: ["Polity basics", "Constitution", "Parliament"]
    },
    {
      id: "ncert-textbooks",
      title: "NCERT Textbooks PDF I-XII",
      subject: "GK/Current Affairs",
      topic: "Constitution/Polity basics",
      type: "PDF",
      sourceName: "NCERT",
      url: "https://www.ncert.nic.in/textbook.php?ln=en",
      sourceBadge: "Official/Public",
      lastChecked: LAST_CHECKED,
      description: "Official NCERT textbook PDF portal for history, civics, geography, science, and basics.",
      keyPoints: [
        "Use selected chapters only; this exam needs concise foundation, not full school coverage.",
        "For history and polity basics, make chapter summaries and topic quizzes.",
        "NCERT is legal and free from the official source."
      ],
      tags: ["NCERT", "History", "Polity basics", "Science"]
    },
    {
      id: "epathshala",
      title: "ePathshala NCERT eResources",
      subject: "Study Materials",
      topic: "NCERT resources",
      type: "Article",
      sourceName: "CIET, NCERT",
      url: "https://ciet.ncert.gov.in/initiative/epathshala?lang=en",
      sourceBadge: "Official/Public",
      lastChecked: LAST_CHECKED,
      description: "NCERT digital resource initiative for textbooks, audio, video, periodicals, and digital notes.",
      keyPoints: [
        "Good for legal eBooks and official school-level basics.",
        "Use bookmarks and notes while reading selected chapters.",
        "Useful for history, polity, geography, science, and English basics."
      ],
      tags: ["NCERT", "eBooks", "Study Materials"]
    },
    {
      id: "reasoning-coding-byjus",
      title: "Coding-Decoding Reasoning Notes",
      subject: "Reasoning",
      topic: "Coding-decoding",
      type: "Article",
      sourceName: "BYJU'S Exam Prep / Govt Exams",
      url: "https://byjus.com/govt-exams/coding-decoding-questions/",
      sourceBadge: "Free Web",
      lastChecked: LAST_CHECKED,
      description: "Free article explaining common coding-decoding formats for government exams.",
      keyPoints: [
        "Focus on letter shifts, reverse order, substitution, and symbol coding.",
        "Practice slow pattern recognition before speed drills.",
        "After reading, generate a Coding-decoding quiz in CrackTrack."
      ],
      tags: ["Reasoning", "Coding-decoding", "Practice"]
    },
    {
      id: "reasoning-analogy-byjus",
      title: "Reasoning Analogy Questions",
      subject: "Reasoning",
      topic: "Analogy",
      type: "Article",
      sourceName: "BYJU'S Govt Exams",
      url: "https://byjus.com/govt-exams/analogy-questions/",
      sourceBadge: "Free Web",
      lastChecked: LAST_CHECKED,
      description: "Free analogy questions and concept practice for government exam reasoning.",
      keyPoints: [
        "Identify the relationship first, then apply it to the missing pair.",
        "Common patterns include synonym, class-member, part-whole, and function.",
        "Avoid solving from options before understanding the relation."
      ],
      tags: ["Reasoning", "Analogy"]
    },
    {
      id: "indiabix-analogy",
      title: "IndiaBIX Analogy Practice",
      subject: "Reasoning",
      topic: "Analogy",
      type: "Practice",
      sourceName: "IndiaBIX",
      url: "https://www.indiabix.com/verbal-reasoning/analogy/introduction",
      sourceBadge: "Free Web",
      lastChecked: LAST_CHECKED,
      description: "Free verbal reasoning practice for analogy patterns.",
      keyPoints: [
        "Use for extra practice after learning the concept.",
        "Review wrong answers by writing the exact relationship.",
        "Transfer hard patterns into the mistake notebook."
      ],
      tags: ["Reasoning", "Analogy", "Practice"]
    },
    {
      id: "indiabix-aptitude",
      title: "IndiaBIX Aptitude Practice",
      subject: "Maths/Data Analysis",
      topic: "Percentage",
      type: "Practice",
      sourceName: "IndiaBIX",
      url: "https://www.indiabix.com/aptitude/questions-and-answers/",
      sourceBadge: "Free Web",
      lastChecked: LAST_CHECKED,
      description: "Free quantitative aptitude practice for percentages, ratio, average, profit/loss, SI, and time-work.",
      keyPoints: [
        "Use selected topics only; avoid random browsing.",
        "Log MCQs solved in Study Log to update progress.",
        "Convert repeated mistakes into weak-area quiz topics."
      ],
      tags: ["Maths/Data Analysis", "Percentage", "Ratio", "Average", "Practice"]
    },
    {
      id: "gfg-computer-basics",
      title: "Computer Basics and Operations",
      subject: "ICT",
      topic: "Computer basics",
      type: "Article",
      sourceName: "GeeksforGeeks",
      url: "https://www.geeksforgeeks.org/computer-science-fundamentals/basics-of-computer-and-its-operations/",
      sourceBadge: "Free Web",
      lastChecked: LAST_CHECKED,
      description: "Free computer fundamentals article for hardware, software, memory, and operations.",
      keyPoints: [
        "Use for basic ICT vocabulary and component questions.",
        "Memorize input, processing, storage, and output flow.",
        "Create flashcards for hardware vs software and memory types."
      ],
      tags: ["ICT", "Computer basics", "Input/output devices"]
    },
    {
      id: "gfg-input-output",
      title: "Input and Output Devices",
      subject: "ICT",
      topic: "Input/output devices",
      type: "Article",
      sourceName: "GeeksforGeeks",
      url: "https://www.geeksforgeeks.org/input-and-output-devices/",
      sourceBadge: "Free Web",
      lastChecked: LAST_CHECKED,
      description: "Free explanation of input, output, and hybrid devices.",
      keyPoints: [
        "Make a two-column list of input and output devices.",
        "Remember touchscreen can be both input and output.",
        "Practice examples: keyboard, mouse, scanner, monitor, printer, speakers."
      ],
      tags: ["ICT", "Input/output devices", "Computer basics"]
    },
    {
      id: "gfg-computer-fundamentals",
      title: "Computer Fundamentals Tutorial",
      subject: "ICT",
      topic: "Internet",
      type: "Article",
      sourceName: "GeeksforGeeks",
      url: "https://www.geeksforgeeks.org/computer-fundamentals-tutorial/",
      sourceBadge: "Free Web",
      lastChecked: LAST_CHECKED,
      description: "Free ICT fundamentals tutorial covering computers, operating systems, internet, and office tools.",
      keyPoints: [
        "Read only the basic computer, OS, internet, and office-tool sections for this exam.",
        "Make separate notes for Word, Excel, PowerPoint, shortcuts, and file types.",
        "Use CrackTrack ICT topic quiz after each reading."
      ],
      tags: ["ICT", "Internet", "MS Word", "Excel", "PowerPoint"]
    },
    {
      id: "english-grammar-british-council",
      title: "English Grammar Practice",
      subject: "English",
      topic: "Articles",
      type: "Article",
      sourceName: "British Council LearnEnglish",
      url: "https://learnenglish.britishcouncil.org/grammar",
      sourceBadge: "Free Web",
      lastChecked: LAST_CHECKED,
      description: "Free grammar explanations and practice activities.",
      keyPoints: [
        "Use for articles, prepositions, tenses, active/passive, and reported speech basics.",
        "Write one example sentence for every rule you miss.",
        "Practice error spotting after grammar revision."
      ],
      tags: ["English", "Articles", "Prepositions", "Active/passive", "Direct/indirect"]
    },
    {
      id: "english-grammar-purdue",
      title: "Purdue OWL Grammar Resources",
      subject: "English",
      topic: "Subject-verb agreement",
      type: "Article",
      sourceName: "Purdue OWL",
      url: "https://owl.purdue.edu/owl/general_writing/grammar/index.html",
      sourceBadge: "Free Web",
      lastChecked: LAST_CHECKED,
      description: "Free grammar reference for sentence-level English concepts.",
      keyPoints: [
        "Use for subject-verb agreement, pronouns, modifiers, and sentence correction.",
        "Focus on rule-based errors that appear in objective exams.",
        "Summarize rules into short answer-first cards."
      ],
      tags: ["English", "Subject-verb agreement", "Spelling correction"]
    },
    {
      id: "punjabi-learnpunjabi",
      title: "Punjabi Learning Portal",
      subject: "Punjabi",
      topic: "Punjabi basics",
      type: "Article",
      sourceName: "Learn Punjabi",
      url: "https://www.learnpunjabi.org/",
      sourceBadge: "Free Web",
      lastChecked: LAST_CHECKED,
      description: "Free Punjabi learning portal useful for language basics and practice.",
      keyPoints: [
        "Use for Punjabi language foundations and script confidence.",
        "Pair with grammar topics in CrackTrack.",
        "Keep exam grammar lists in your notes."
      ],
      tags: ["Punjabi", "Shudh-ashudh", "Ling/vachan", "Vishram chinh"]
    },
    {
      id: "sikh-gurus-britannica",
      title: "Sikhism Overview for Guru Timeline",
      subject: "Punjab History",
      topic: "Sikh Gurus",
      type: "Article",
      sourceName: "Encyclopaedia Britannica",
      url: "https://www.britannica.com/topic/Sikhism",
      sourceBadge: "Free Web",
      lastChecked: LAST_CHECKED,
      description: "General reference for Sikhism, Sikh Gurus, and historical context.",
      keyPoints: [
        "Use only as a secondary reference for timeline clarity.",
        "Make a Guru-wise table: name, period, major contribution.",
        "Verify detailed exam facts with state syllabus notes."
      ],
      tags: ["Punjab History", "Sikh Gurus", "Adi Granth"]
    },
    {
      id: "environment-moefcc",
      title: "Environment Ministry Updates",
      subject: "GK/Current Affairs",
      topic: "Environment",
      type: "Official",
      sourceName: "Ministry of Environment, Forest and Climate Change",
      url: "https://moef.gov.in/",
      sourceBadge: "Official",
      lastChecked: LAST_CHECKED,
      description: "Official environment ministry portal for environment-related current affairs.",
      keyPoints: [
        "Use for environment schemes, reports, and official updates.",
        "For MCQs, focus on recent national initiatives and environment days.",
        "Cross-link with PIB releases for current affairs."
      ],
      tags: ["Environment", "Current affairs", "Science and technology"]
    },
    {
      id: "sports-ministry",
      title: "Sports Ministry News",
      subject: "GK/Current Affairs",
      topic: "Sports",
      type: "Official",
      sourceName: "Ministry of Youth Affairs and Sports",
      url: "https://yas.gov.in/",
      sourceBadge: "Official",
      lastChecked: LAST_CHECKED,
      description: "Official source for sports policy, awards, and sports-related national updates.",
      keyPoints: [
        "Track awards, national games, schemes, and major sports achievements.",
        "Create one-line notes for recent awards and appointments.",
        "Use with PIB sports releases."
      ],
      tags: ["Sports", "Awards", "Current affairs"]
    },
    {
      id: "science-tech-pib",
      title: "PIB Science and Technology Releases",
      subject: "GK/Current Affairs",
      topic: "Science and technology",
      type: "Official",
      sourceName: "PIB",
      url: "https://pib.gov.in/Allrel.aspx",
      sourceBadge: "Official",
      lastChecked: LAST_CHECKED,
      description: "Use PIB filters for science, technology, space, and environment releases.",
      keyPoints: [
        "Focus on ISRO, science ministry, environment, and digital governance releases.",
        "Keep notes brief; exams reward clean factual recall.",
        "Use monthly revision quizzes for retention."
      ],
      tags: ["Science and technology", "Environment", "Current affairs"]
    },
    {
      id: "monthly-current-affairs-capsule-local",
      title: "CrackTrack Monthly Current Affairs Capsule",
      subject: "GK/Current Affairs",
      topic: "Current affairs",
      type: "Current Affairs",
      sourceName: "CrackTrack curated from official/public sources",
      url: "",
      sourceBadge: "Internal",
      lastChecked: LAST_CHECKED,
      description: "Internal reading card for monthly current affairs workflow using PIB, National Portal, RBI, PRS, and ministry pages.",
      keyPoints: [
        "Every month: scan PIB, National Portal, RBI, PRS, sports ministry, and environment ministry.",
        "Make sections: Awards, Appointments, Sports, Economy, Science, Environment, Punjab current affairs.",
        "After completing the capsule, generate a Current Affairs quiz from this material."
      ],
      tags: ["Current affairs", "Awards", "Appointments", "Sports", "Economy"]
    },
    {
      id: "punjab-history-handbook-local",
      title: "Punjab History Quick Handbook",
      subject: "Punjab History",
      topic: "Punjab History",
      type: "Notes",
      sourceName: "CrackTrack internal notes with official links",
      url: "",
      sourceBadge: "Internal",
      lastChecked: LAST_CHECKED,
      description: "Internal compact notes for physical features, ancient Punjab, Sikh Gurus, Adi Granth, Sikh rulers, and culture.",
      keyPoints: [
        "Build a one-page timeline from ancient Punjab to Sikh rulers and freedom movements.",
        "Make Guru-wise flashcards and culture keyword lists.",
        "Practice Punjab History MCQs after each reading session."
      ],
      tags: ["Punjab History", "Sikh Gurus", "Punjabi culture"]
    },
    {
      id: "punjabi-grammar-local",
      title: "Punjabi Grammar Exam Sheet",
      subject: "Punjabi",
      topic: "Punjabi Grammar",
      type: "Notes",
      sourceName: "CrackTrack internal notes",
      url: "",
      sourceBadge: "Internal",
      lastChecked: LAST_CHECKED,
      description: "Internal revision sheet for Punjabi grammar topics in the qualifying section.",
      keyPoints: [
        "Revise shudh-ashudh, synonyms/antonyms, muhavare, akhan, agetar/pichettar, ling/vachan, and punctuation.",
        "Use short daily drills instead of long passive reading.",
        "Mark hard words for night revision."
      ],
      tags: ["Punjabi", "Shudh-ashudh", "Muhavare", "Akhan"]
    },
    {
      id: "ict-basics-local",
      title: "ICT Basics Fast Revision",
      subject: "ICT",
      topic: "Computer basics",
      type: "Notes",
      sourceName: "CrackTrack internal notes with public sources",
      url: "",
      sourceBadge: "Internal",
      lastChecked: LAST_CHECKED,
      description: "Internal ICT revision for computer basics, input/output, internet, office tools, shortcuts, and file types.",
      keyPoints: [
        "Split ICT into: basics, hardware, software, internet, office tools, and files.",
        "Make a shortcut table for Word, Excel, and PowerPoint.",
        "Practice mixed ICT MCQs after each topic."
      ],
      tags: ["ICT", "Computer basics", "Shortcuts", "File types"]
    }
  ];

  const previousPapers = [
    {
      id: "paper-2023-public-listing",
      title: "PSSSB Excise Inspector Official Paper - 21 May 2023 public listing",
      year: "2023",
      sourceName: "Testbook public previous paper listing",
      sourceType: "Public Source",
      url: "https://testbook.com/psssb-excise-inspector/previous-year-papers",
      answerKeyUrl: "",
      official: false,
      description: "Public listing that references the 21 May 2023 official paper. Open the source to verify access and terms.",
      topics: ["GK/Current Affairs", "Reasoning", "Maths/Data Analysis", "English", "Punjabi", "ICT", "Punjab History"],
      practiceLabel: "Practice similar mixed quiz"
    },
    {
      id: "paper-2018-public-listing",
      title: "Punjab Excise Inspector 8 April 2018 paper public listing",
      year: "2018",
      sourceName: "Testbook public previous paper listing",
      sourceType: "Public Source",
      url: "https://testbook.com/psssb-excise-taxation-inspector/previous-year-papers",
      answerKeyUrl: "",
      official: false,
      description: "Public previous-paper page. This app does not claim to host the official paper PDF.",
      topics: ["Reasoning", "Maths/Data Analysis", "GK/Current Affairs", "Punjab History"],
      practiceLabel: "Practice similar older-pattern quiz"
    },
    {
      id: "practice-2026-part-b",
      title: "Practice Paper Based on Latest Pattern - Part B",
      year: "2026",
      sourceName: "CrackTrack local question bank",
      sourceType: "Practice Paper",
      url: "",
      answerKeyUrl: "",
      official: false,
      description: "Clearly labeled practice paper based on the latest syllabus areas. Not an official previous year paper.",
      topics: ["GK/Current Affairs", "Reasoning", "Maths/Data Analysis", "English", "Punjabi", "ICT", "Punjab History", "Punjab GK", "Excise Act"],
      practiceLabel: "Practice Part B mock"
    },
    {
      id: "practice-punjabi-qualifying",
      title: "Practice Paper Based on Latest Pattern - Punjabi Qualifying",
      year: "2026",
      sourceName: "CrackTrack local question bank",
      sourceType: "Practice Paper",
      url: "",
      answerKeyUrl: "",
      official: false,
      description: "Punjabi Part A practice set for grammar and Guru topics. Not an official paper.",
      topics: ["Punjabi", "Guru topics", "Synonyms/antonyms", "Muhavare", "Akhan", "Shudh-ashudh"],
      practiceLabel: "Practice Punjabi qualifying"
    }
  ];

  const topicStrategy = {
    "Series": "Look for arithmetic, geometric, alternating, square/cube, or position-based changes.",
    "Coding-decoding": "Find the letter/number shift or substitution rule before checking options.",
    "Blood relation": "Draw a mini family tree and mark gender only when the statement confirms it.",
    "Direction": "Draw the path with north fixed at the top, then calculate displacement.",
    "Analogy": "Name the relationship between the first pair before solving the second pair.",
    "Classification": "Find the common rule shared by three options and reject the odd one.",
    "Syllogism": "Use Venn diagrams and test only conclusions that must always follow.",
    "Statement/conclusion": "Do not use outside assumptions; judge only what follows from the statement.",
    "Percentage": "Convert percent to fraction or decimal quickly, then calculate.",
    "Ratio": "Convert total parts into one-part value before comparing quantities.",
    "Average": "Average equals total divided by number of observations.",
    "Profit/loss": "Profit percent and loss percent are usually calculated on cost price.",
    "Simple interest": "Use SI = P x R x T / 100.",
    "Time and work": "Use work rates; if A takes x days, A's one-day work is 1/x.",
    "Tables/charts": "Read units, totals, and headings before calculating.",
    "Awards": "Connect award name, field, recipient, and year.",
    "Appointments": "Connect post, person, institution, and date.",
    "Sports": "Track tournament, winner, runner-up, venue, and host country.",
    "Economy": "Prioritize official terms, banking, budget, inflation, and GDP basics.",
    "Science and technology": "Link mission, agency, technology, and purpose.",
    "Environment": "Link convention, species, protected area, and ministry update.",
    "Important days": "Learn date, theme, and organization.",
    "Punjab current affairs": "Track state schemes, appointments, districts, and official notices.",
    "Physical features of Punjab": "Revise rivers, plains, Shivalik foothills, districts, and boundaries.",
    "Ancient Punjab": "Connect Sapta Sindhu, Indus region, trade routes, and cultural phases.",
    "Sikh Gurus": "Make a Guru-wise contribution table.",
    "Adi Granth": "Remember compilation, contributors, language mix, and historical significance.",
    "Bhakti and Sufi movement": "Compare message, saints, equality, devotion, and social reform.",
    "Sikh rulers": "Focus on Maharaja Ranjit Singh, misl period, administration, and Lahore kingdom.",
    "Freedom movements": "Connect Punjab revolutionaries, Ghadar, Jallianwala Bagh, and non-cooperation.",
    "Punjabi culture": "Revise language, folk forms, festivals, literature, and heritage places.",
    "Guru topics": "Revise Guru biographies and major works from the Punjabi qualifying section.",
    "Synonyms/antonyms": "Learn pairs in context, not as isolated words.",
    "Muhavare": "Learn phrase meaning and one example usage.",
    "Akhan": "Learn proverb meaning and practical application.",
    "Shabad bhed": "Identify noun, pronoun, verb, adjective, and adverb roles.",
    "Agetar/pichettar": "Identify prefix/suffix and how it changes meaning.",
    "Ling/vachan": "Check gender and number agreement.",
    "Vishram chinh": "Match punctuation with pause, quotation, question, and exclamation.",
    "Shudh-ashudh": "Spot spelling and usage errors by sound and rule.",
    "Subject-verb agreement": "Match verb number with the true subject, not the nearest noun.",
    "Articles": "Use a/an for indefinite singular nouns and the for specific nouns.",
    "Prepositions": "Check fixed expressions and time/place usage.",
    "Active/passive": "Object becomes subject; keep tense and auxiliary consistent.",
    "Direct/indirect": "Change tense, pronoun, and time words according to reporting context.",
    "One-word substitution": "Memorize precise single-word replacements for common phrases.",
    "Idioms": "Learn figurative meaning, not literal meaning.",
    "Spelling correction": "Check silent letters, double consonants, and common suffixes.",
    "Computer basics": "Understand input, process, storage, output, hardware, and software.",
    "Input/output devices": "Classify devices by whether they send data to or receive output from a computer.",
    "Internet": "Revise browser, URL, ISP, email, WWW, HTTP/HTTPS, and cyber hygiene.",
    "MS Word": "Know document editing, formatting, tables, headers, and shortcuts.",
    "Excel": "Know spreadsheet cells, formulas, charts, sorting, and common functions.",
    "PowerPoint": "Know slides, layouts, transitions, animations, and presentation view.",
    "Shortcuts": "Group shortcuts by operating system, browser, Word, Excel, and PowerPoint.",
    "File types": "Connect extensions with file categories and software.",
    "Important sections": "Learn definitions, license powers, duties, offences, search, seizure, and penalties.",
    "Tax basics": "Separate direct tax, indirect tax, GST, excise, fee, duty, and compliance.",
    "Compliance concepts": "Focus on license, permit, record, return, inspection, and penalty logic.",
    "Districts": "Learn district names, headquarters, border districts, and new district changes.",
    "Rivers": "Revise Sutlej, Beas, Ravi and the five-river concept with map practice.",
    "Culture": "Revise folk dances, fairs, festivals, crafts, and food.",
    "Literature": "Learn major Punjabi writers, works, and literary forms.",
    "Important places": "Connect place, district, historical importance, and event."
  };

  const seedQuestions = [
    ["Reasoning", "Series", "What is the next number in the series: 3, 6, 12, 24, ?", ["30", "36", "48", "54"], 2, "Each term is doubled, so 24 x 2 = 48."],
    ["Reasoning", "Series", "Find the missing term: 5, 9, 17, 33, ?", ["49", "57", "65", "72"], 2, "The differences double: +4, +8, +16, so next is +32 = 65."],
    ["Reasoning", "Coding-decoding", "If CAT is coded as DBU, how is DOG coded?", ["EPH", "FQH", "ENH", "CNI"], 0, "Each letter is shifted forward by one: D->E, O->P, G->H."],
    ["Reasoning", "Coding-decoding", "If PUNJAB is written as QVOKBC, what is the code for TAX?", ["UBY", "SZW", "VCZ", "TYA"], 0, "Each letter moves one step forward."],
    ["Reasoning", "Blood relation", "A is the brother of B. B is the mother of C. How is A related to C?", ["Father", "Uncle", "Brother", "Grandfather"], 1, "Mother's brother is maternal uncle."],
    ["Reasoning", "Blood relation", "Pointing to a man, Aman says, 'He is the son of my mother's only son.' Who is the man?", ["Aman's brother", "Aman's son", "Aman's father", "Aman's uncle"], 1, "Aman's mother's only son is Aman, so the man is Aman's son."],
    ["Reasoning", "Direction", "Aman walks 4 km north, 3 km east, then 4 km south. How far is he from start?", ["3 km east", "4 km north", "5 km north-east", "7 km"], 0, "North and south movements cancel; he is 3 km east."],
    ["Reasoning", "Direction", "Facing north, you turn right, then right, then left. Which direction do you face?", ["North", "East", "South", "West"], 1, "North -> east -> south -> east."],
    ["Reasoning", "Analogy", "Book is to Reading as Pen is to:", ["Writing", "Drawing", "Paper", "Ink"], 0, "The relation is object and main use."],
    ["Reasoning", "Analogy", "Doctor is to Hospital as Teacher is to:", ["Office", "School", "Court", "Market"], 1, "The relation is profession and workplace."],
    ["Reasoning", "Classification", "Find the odd one out.", ["Sutlej", "Beas", "Ravi", "Yamuna"], 3, "Sutlej, Beas, and Ravi are strongly associated with Punjab river GK; Yamuna is the odd option here."],
    ["Reasoning", "Classification", "Find the odd one out.", ["Keyboard", "Mouse", "Scanner", "Monitor"], 3, "Keyboard, mouse, and scanner are input devices; monitor is output."],
    ["Reasoning", "Syllogism", "All books are pages. Some pages are notes. Which conclusion must follow?", ["All notes are books", "Some books are notes", "All books are pages", "No page is book"], 2, "The statement directly says all books are pages."],
    ["Reasoning", "Statement/conclusion", "Statement: All mock tests reveal weak areas. Conclusion: Mock analysis helps revision planning.", ["Definitely follows", "Definitely does not follow", "Cannot be determined", "Opposite follows"], 0, "If mocks reveal weak areas, they can help plan revision."],
    ["Maths/Data Analysis", "Percentage", "What is 20% of 250?", ["25", "40", "50", "75"], 2, "20% = 1/5; 250/5 = 50."],
    ["Maths/Data Analysis", "Percentage", "A score rises from 60 to 75. What is the percentage increase?", ["15%", "20%", "25%", "30%"], 2, "Increase is 15; 15/60 x 100 = 25%."],
    ["Maths/Data Analysis", "Ratio", "Divide 560 in the ratio 3:5. What is the larger part?", ["210", "280", "350", "420"], 2, "Total parts = 8; one part = 70; larger part = 5 x 70 = 350."],
    ["Maths/Data Analysis", "Ratio", "If A:B = 2:3 and B:C = 6:5, what is A:C?", ["2:5", "4:5", "6:5", "5:4"], 1, "Make B common: A:B = 4:6 and B:C = 6:5, so A:C = 4:5."],
    ["Maths/Data Analysis", "Average", "Average of 12, 18, 20, and 30 is:", ["18", "19", "20", "22"], 2, "Total is 80; 80/4 = 20."],
    ["Maths/Data Analysis", "Average", "Average of five numbers is 16. Their total is:", ["64", "72", "80", "96"], 2, "Total = average x count = 16 x 5 = 80."],
    ["Maths/Data Analysis", "Profit/loss", "Cost price is 500 and selling price is 600. Profit percent is:", ["10%", "15%", "20%", "25%"], 2, "Profit = 100; profit percent = 100/500 x 100 = 20%."],
    ["Maths/Data Analysis", "Profit/loss", "If an item bought for 800 is sold at 720, loss percent is:", ["5%", "8%", "10%", "12%"], 2, "Loss = 80; 80/800 x 100 = 10%."],
    ["Maths/Data Analysis", "Simple interest", "Simple interest on Rs. 1000 at 5% for 2 years is:", ["50", "75", "100", "125"], 2, "SI = 1000 x 5 x 2 / 100 = 100."],
    ["Maths/Data Analysis", "Time and work", "A can finish work in 10 days, B in 15 days. Together they finish in:", ["5 days", "6 days", "8 days", "12 days"], 1, "Combined work per day = 1/10 + 1/15 = 1/6."],
    ["Maths/Data Analysis", "Tables/charts", "A chart shows 40, 50, 60 units sold in three days. Average per day is:", ["45", "50", "55", "60"], 1, "Total = 150; average = 150/3 = 50."],
    ["GK/Current Affairs", "Important days", "World Environment Day is observed on:", ["5 June", "15 August", "2 October", "10 December"], 0, "World Environment Day is observed on 5 June."],
    ["GK/Current Affairs", "Important days", "National Sports Day in India is observed on:", ["26 January", "29 August", "31 October", "14 November"], 1, "It is observed on 29 August, linked with Major Dhyan Chand's birth anniversary."],
    ["GK/Current Affairs", "Economy", "GDP stands for:", ["Gross Domestic Product", "General Duty Payment", "Government Development Plan", "Gross District Population"], 0, "GDP means Gross Domestic Product."],
    ["GK/Current Affairs", "Economy", "Which institution is India's central bank?", ["SEBI", "RBI", "NABARD", "NITI Aayog"], 1, "The Reserve Bank of India is India's central bank."],
    ["GK/Current Affairs", "Science and technology", "ISRO is primarily associated with:", ["Space research", "Banking regulation", "Agriculture pricing", "Railway safety"], 0, "ISRO is India's space research organization."],
    ["GK/Current Affairs", "Environment", "The term biodiversity means:", ["Only forests", "Variety of life forms", "Only animals", "Only climate"], 1, "Biodiversity is the variety of life forms in an area or on Earth."],
    ["Punjab History", "Physical features of Punjab", "The name Punjab literally refers to:", ["Land of deserts", "Land of five waters", "Land of mountains", "Land of ports"], 1, "Punjab is commonly understood as the land of five waters/rivers."],
    ["Punjab History", "Ancient Punjab", "The ancient term Sapta Sindhu is linked with:", ["Seven rivers region", "Seven forts", "Seven hills", "Seven ports"], 0, "Sapta Sindhu means region of seven rivers in ancient references."],
    ["Punjab History", "Sikh Gurus", "Who was the first Sikh Guru?", ["Guru Angad Dev Ji", "Guru Nanak Dev Ji", "Guru Amar Das Ji", "Guru Arjan Dev Ji"], 1, "Guru Nanak Dev Ji was the first Sikh Guru."],
    ["Punjab History", "Sikh Gurus", "Who compiled the Adi Granth?", ["Guru Nanak Dev Ji", "Guru Arjan Dev Ji", "Guru Gobind Singh Ji", "Banda Singh Bahadur"], 1, "Guru Arjan Dev Ji compiled the Adi Granth."],
    ["Punjab History", "Adi Granth", "Adi Granth is primarily associated with:", ["Sikh scripture", "Revenue code", "Tax manual", "British law"], 0, "Adi Granth is the central Sikh scripture compiled by Guru Arjan Dev Ji."],
    ["Punjab History", "Bhakti and Sufi movement", "A common theme in Bhakti and Sufi movements was:", ["Strict caste superiority", "Devotion and spiritual equality", "Only court politics", "Maritime trade"], 1, "Both emphasized devotion, spiritual love, and social equality themes."],
    ["Punjab History", "Sikh rulers", "Maharaja Ranjit Singh is associated with:", ["Sikh Empire", "Mauryan Empire", "Gupta Empire", "Maratha Confederacy"], 0, "Maharaja Ranjit Singh founded and led the Sikh Empire."],
    ["Punjab History", "Freedom movements", "Jallianwala Bagh is located in:", ["Amritsar", "Patiala", "Ludhiana", "Bathinda"], 0, "Jallianwala Bagh is in Amritsar."],
    ["Punjab History", "Punjabi culture", "Bhangra is best known as a:", ["Folk dance", "Tax form", "River", "Court title"], 0, "Bhangra is a Punjabi folk dance."],
    ["Punjabi", "Guru topics", "In Punjabi Part A, Guru topics usually test:", ["Biographies and works", "Only arithmetic", "Only computer commands", "Only map reading"], 0, "The Punjabi qualifying section includes biographies and works of Sikh Gurus."],
    ["Punjabi", "Synonyms/antonyms", "Synonym means a word with:", ["Opposite meaning", "Similar meaning", "No meaning", "Plural form"], 1, "Synonyms have similar meanings."],
    ["Punjabi", "Synonyms/antonyms", "Antonym means a word with:", ["Opposite meaning", "Similar meaning", "Same spelling", "Same sound"], 0, "Antonyms have opposite meanings."],
    ["Punjabi", "Muhavare", "A muhavara is closest to:", ["Idiom", "Tax rate", "Device", "Chart"], 0, "Muhavara means idiom or idiomatic expression."],
    ["Punjabi", "Akhan", "Akhan are closest to:", ["Proverbs", "Equations", "Punctuation marks only", "Computer files"], 0, "Akhan are proverbs."],
    ["Punjabi", "Ling/vachan", "Ling/vachan questions test:", ["Gender and number", "Interest and profit", "Directions", "HTML tags"], 0, "Ling is gender and vachan is number."],
    ["English", "Subject-verb agreement", "Choose the correct sentence.", ["The boys runs fast.", "The boys run fast.", "The boys running fast.", "The boys has run fast."], 1, "Plural subject 'boys' takes plural verb 'run'."],
    ["English", "Articles", "Choose the correct article: He is ___ honest man.", ["a", "an", "the", "no article"], 1, "Honest begins with a vowel sound, so use 'an'."],
    ["English", "Prepositions", "Choose the correct preposition: She is good ___ mathematics.", ["in", "at", "on", "from"], 1, "The correct phrase is 'good at'."],
    ["English", "Active/passive", "Passive of 'He writes a letter' is:", ["A letter is written by him.", "A letter wrote him.", "He is written by a letter.", "A letter has wrote."], 0, "Object becomes subject; simple present passive uses is/am/are + past participle."],
    ["English", "Direct/indirect", "Indirect speech: He said, 'I am ready.'", ["He said that he was ready.", "He said that I am ready.", "He says he was ready.", "He said ready."], 0, "Pronoun and tense change in reported speech."],
    ["English", "One-word substitution", "One who studies the stars is called:", ["Geologist", "Astronomer", "Biologist", "Economist"], 1, "An astronomer studies stars and celestial bodies."],
    ["English", "Idioms", "The idiom 'break the ice' means:", ["Start a conversation", "Damage a freezer", "Stop working", "Win a race"], 0, "It means to initiate conversation or reduce awkwardness."],
    ["English", "Spelling correction", "Choose the correctly spelled word.", ["Accomodation", "Accommodation", "Acommodation", "Accommadation"], 1, "Accommodation has double c and double m."],
    ["ICT", "Computer basics", "CPU is commonly called the:", ["Brain of computer", "Printer unit", "Input screen", "External memory"], 0, "CPU processes instructions and is often called the brain."],
    ["ICT", "Input/output devices", "Which is an input device?", ["Monitor", "Printer", "Keyboard", "Speaker"], 2, "Keyboard sends data to the computer."],
    ["ICT", "Input/output devices", "Which device can be both input and output?", ["Touchscreen", "Printer", "Speaker", "Projector"], 0, "A touchscreen displays output and receives touch input."],
    ["ICT", "Internet", "URL stands for:", ["Uniform Resource Locator", "Universal Router Link", "User Registry Login", "Unified Result List"], 0, "URL means Uniform Resource Locator."],
    ["ICT", "MS Word", "Which shortcut commonly saves a document?", ["Ctrl+S", "Ctrl+P", "Ctrl+C", "Ctrl+Z"], 0, "Ctrl+S saves."],
    ["ICT", "Excel", "In Excel, a formula usually begins with:", ["#", "=", "@", "&"], 1, "Excel formulas begin with equal sign."],
    ["ICT", "PowerPoint", "PowerPoint is mainly used to create:", ["Presentations", "Spreadsheets", "Databases", "Operating systems"], 0, "PowerPoint is presentation software."],
    ["ICT", "File types", "A .xlsx file is usually associated with:", ["Excel workbook", "Image file", "Audio file", "Compressed archive"], 0, ".xlsx is an Excel workbook format."],
    ["Excise Act", "Important sections", "In an excise law context, a license generally means:", ["Permission under law", "A railway ticket", "A school certificate", "A weather report"], 0, "Excise administration often uses licenses/permits for regulated activities."],
    ["Excise Act", "Tax basics", "Excise duty is generally a type of:", ["Indirect tax/duty", "Personal income tax only", "School fee", "Bank deposit"], 0, "Excise duty is an indirect duty on specified goods/activities."],
    ["Excise Act", "Compliance concepts", "A compliance-focused officer should first verify:", ["Records and legal permission", "Only wall color", "Only office size", "Only weather"], 0, "Compliance depends on licenses, records, returns, and lawful activity."],
    ["Punjab GK", "Districts", "Which city is the capital shared by Punjab and Haryana?", ["Chandigarh", "Amritsar", "Ludhiana", "Jalandhar"], 0, "Chandigarh serves as the capital of both Punjab and Haryana."],
    ["Punjab GK", "Rivers", "Which river flows through Punjab and is a major tributary of the Indus system?", ["Sutlej", "Godavari", "Kaveri", "Mahanadi"], 0, "Sutlej is one of the major Punjab rivers."],
    ["Punjab GK", "Culture", "Giddha is associated with:", ["Punjabi folk dance", "Computer memory", "Tax return", "River basin"], 0, "Giddha is a Punjabi folk dance."],
    ["Punjab GK", "Literature", "Waris Shah is famous for:", ["Heer Ranjha", "Discovery of gravity", "Excel formulas", "GST return"], 0, "Waris Shah is famous for the poetic version of Heer Ranjha."],
    ["Punjab GK", "Important places", "The Golden Temple is located in:", ["Amritsar", "Fazilka", "Moga", "Rupnagar"], 0, "Sri Harmandir Sahib/Golden Temple is in Amritsar."]
  ];

  function buildQuestionBank() {
    const bank = [];
    let index = 1;
    function add(subject, topic, stem, options, answer, explanation, source) {
      bank.push({
        id: "q" + String(index++).padStart(4, "0"),
        subject,
        topic,
        stem,
        options,
        answer,
        explanation,
        source: source || "CrackTrack local bank"
      });
    }
    seedQuestions.forEach(function (q) {
      add(q[0], q[1], q[2], q[3], q[4], q[5]);
    });
    subjects.forEach(function (subject) {
      subject.topics.forEach(function (topic) {
        const strategy = topicStrategy[topic] || "Identify the rule, recall the core fact, then eliminate wrong options.";
        add(
          subject.name,
          topic,
          "For " + topic + " questions in " + subject.name + ", which method is most reliable?",
          [
            strategy,
            "Guess the longest option before reading the question.",
            "Skip the topic permanently after one wrong answer.",
            "Use only outside assumptions and ignore the question data."
          ],
          0,
          "A reliable method for " + topic + " is: " + strategy
        );
      });
    });
    const extras = [
      ["Maths/Data Analysis", "Percentage", "40 is what percent of 200?", ["10%", "20%", "25%", "40%"], 1, "40/200 x 100 = 20%."],
      ["Maths/Data Analysis", "Simple interest", "Principal 2000, rate 6%, time 3 years. SI is:", ["180", "240", "320", "360"], 3, "SI = 2000 x 6 x 3 / 100 = 360."],
      ["Reasoning", "Series", "Next term: 1, 4, 9, 16, ?", ["20", "24", "25", "30"], 2, "These are squares: 1, 2^2, 3^2, 4^2, so next is 5^2 = 25."],
      ["Reasoning", "Analogy", "Punjab : Chandigarh :: Haryana : ?", ["Chandigarh", "Shimla", "Jaipur", "Lucknow"], 0, "Chandigarh is capital for both Punjab and Haryana."],
      ["ICT", "Shortcuts", "Which shortcut is commonly used to copy selected text?", ["Ctrl+C", "Ctrl+V", "Ctrl+X", "Ctrl+A"], 0, "Ctrl+C copies selected text."],
      ["ICT", "Shortcuts", "Which shortcut is commonly used to paste?", ["Ctrl+P", "Ctrl+S", "Ctrl+V", "Ctrl+F"], 2, "Ctrl+V pastes copied/cut content."],
      ["English", "Prepositions", "Choose the correct phrase.", ["depend of", "depend on", "depend at", "depend for"], 1, "The correct phrase is 'depend on'."],
      ["English", "Synonyms/antonyms", "Choose the antonym of 'ancient'.", ["Old", "Modern", "Past", "Historic"], 1, "Modern is the opposite of ancient."],
      ["Punjab History", "Freedom movements", "The Jallianwala Bagh massacre took place in which year?", ["1905", "1919", "1930", "1942"], 1, "It took place in 1919."],
      ["Punjab GK", "Rivers", "Which pair contains two Punjab rivers?", ["Beas and Ravi", "Krishna and Kaveri", "Narmada and Tapi", "Godavari and Mahanadi"], 0, "Beas and Ravi are Punjab rivers."],
      ["GK/Current Affairs", "Awards", "The Bharat Ratna is:", ["India's highest civilian award", "A sports league", "A tax form", "A computer language"], 0, "Bharat Ratna is India's highest civilian award."],
      ["GK/Current Affairs", "Appointments", "Appointment questions usually ask for:", ["Person and post", "Only spelling", "Only weather", "Only punctuation"], 0, "They usually test who was appointed to which post."],
      ["GK/Current Affairs", "Sports", "The Olympic Games are held every:", ["2 years", "3 years", "4 years", "5 years"], 2, "Summer Olympics are held every four years."],
      ["Excise Act", "Important sections", "The safest way to study a bare Act for MCQs is to first master:", ["Definitions", "Page color", "Publisher logo only", "Font size"], 0, "Definitions control the meaning of later sections."],
      ["Punjabi", "Vishram chinh", "A question mark is used for:", ["Question", "Statement only", "Plural noun", "Calculation"], 0, "Question mark indicates a question."],
      ["Punjabi", "Shabad bhed", "In grammar, a noun names:", ["Person, place, thing, or idea", "Only action", "Only quality", "Only punctuation"], 0, "A noun names a person, place, thing, or idea."]
    ];
    extras.forEach(function (q) {
      add(q[0], q[1], q[2], q[3], q[4], q[5]);
    });
    return bank;
  }

  window.CRACKTRACK_DATA = {
    lastChecked: LAST_CHECKED,
    subjects,
    defaultSchedule,
    phaseTasks,
    materialResources,
    previousPapers,
    topicStrategy,
    questionBank: buildQuestionBank()
  };
})();
