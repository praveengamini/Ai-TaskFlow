# templates.py

def get_enhanced_personalized_prompt(goal: str, duration: str, total_days: int, total_weeks: int, total_months: int, 
                                    subject_category: str, user_context: dict, attempt_number: int = 1) -> str:
    """Generate highly personalized and dynamic learning plan prompt"""
    
    # Base personalized prompt
    base_prompt = f"""
You are an expert learning coach creating a HIGHLY PERSONALIZED learning plan.

LEARNING GOAL: {goal}
DURATION: {duration} ({total_days} days, {total_weeks} weeks, {total_months} months)
SUBJECT CATEGORY: {subject_category}

USER PROFILE:
- Current Skill Level: {user_context.get('skill_level', 'beginner')}
- Learning Style: {user_context.get('learning_style', 'practical')}
- Available Time: {user_context.get('daily_time', '1-2 hours')} per day
- Specific Interests: {', '.join(user_context.get('specific_interests', ['general application']))}
- Practical Goals: {', '.join(user_context.get('practical_goals', ['skill development']))}

CRITICAL REQUIREMENTS:
1. Create EXACTLY {total_days} daily tasks, {total_weeks} weekly tasks, and {total_months} monthly tasks
2. Each task must be HYPER-SPECIFIC and actionable for {user_context.get('skill_level', 'beginner')} level
3. NO generic phrases like "learn basics", "study fundamentals", "practice concepts"
4. Every task must include specific deliverables, metrics, or outcomes
5. Tasks should build progressively based on {user_context.get('learning_style', 'practical')} learning style
6. Consider {user_context.get('daily_time', '1-2 hours')} daily time constraint
7. Each task must include 1-3 relevant learning resources (videos, articles, tools, websites)
8. Resources must be specific, high-quality, and appropriate for {user_context.get('skill_level', 'beginner')} level
9. Resources should include exact titles, URLs when possible, and brief descriptions

SPECIFICITY EXAMPLES FOR {subject_category.upper()}:
{get_subject_specific_examples(subject_category, user_context)}

PERSONALIZATION REQUIREMENTS:
- Adapt difficulty to {user_context.get('skill_level', 'beginner')} level
- Focus on {user_context.get('learning_style', 'practical')} learning approach
- Include tasks that align with: {', '.join(user_context.get('specific_interests', []))}
- Design tasks achievable in {user_context.get('daily_time', '1-2 hours')} daily time slots
- Connect learning to practical goals: {', '.join(user_context.get('practical_goals', []))}

RESOURCE REQUIREMENTS:
- Each task must have 1-3 high-quality resources
- Resource types: video, article, book, tool, course, website, tutorial, documentation
- Include specific titles and URLs when available
- Match resource difficulty to user's skill level
- Prioritize free resources when possible
- Include brief description of how resource helps with the task

TASK STRUCTURE REQUIREMENTS:
Daily Tasks: Each must be a single, specific action with clear completion criteria
Weekly Tasks: Each should have 2-3 specific sub-tasks that group daily activities
Monthly Tasks: Each should have 2-4 major milestone tasks representing significant progress

JSON FORMAT (EXACT STRUCTURE REQUIRED):
{{
    "goalTitle": "{goal}",
    "totalDays": {total_days},
    "monthlyTasks": [
        {{"label": "Month 1", "tasks": ["Specific milestone task 1", "Specific milestone task 2"], "resources": [{{"title": "Resource Name", "type": "video", "url": "https://example.com", "description": "Brief description of how this helps"}}], "status": false}}
    ],
    "weeklyTasks": [
        {{"label": "Week 1", "tasks": ["Specific weekly task 1", "Specific weekly task 2"], "resources": [{{"title": "Resource Name", "type": "article", "url": "https://example.com", "description": "Brief description of how this helps"}}], "status": false}}
    ],
    "dailyTasks": [
        {{"label": "Day 1", "tasks": ["One specific daily task with clear completion criteria"], "resources": [{{"title": "Resource Name", "type": "tutorial", "url": "https://example.com", "description": "Brief description of how this helps"}}], "status": false}}
    ]
}}

AVOID AT ALL COSTS:
- "Learn the basics of..."
- "Study fundamentals..."
- "Practice concepts..."
- "Understand principles..."
- "Get familiar with..."
- "Review materials..."
- Any generic or vague language
- Generic resource names like "YouTube videos" or "online articles"

MAKE IT ULTRA-SPECIFIC:
- Include exact numbers, tools, resources
- Specify what will be built, created, or accomplished
- Define measurable outcomes
- Reference specific techniques, methods, or approaches
- Connect to real-world applications
- Provide exact resource titles and URLs
"""

    # Add retry-specific adjustments
    if attempt_number > 1:
        base_prompt += f"""

RETRY ATTEMPT #{attempt_number}:
The previous attempt failed. Make this response even MORE SPECIFIC and DETAILED.
- Add specific tool names, version numbers, exact quantities
- Include precise time estimates for each task
- Specify exact deliverables and success metrics
- Use domain-specific terminology appropriately
- Make every task immediately actionable without additional research
- Include more specific and high-quality resources with exact URLs
"""

    return base_prompt


def get_subject_specific_examples(subject_category: str, user_context: dict) -> str:
    """Get tailored examples based on subject and user context"""
    
    skill_level = user_context.get('skill_level', 'beginner')
    learning_style = user_context.get('learning_style', 'practical')
    
    examples = {
        "dsa": {
            "beginner": {
                "practical": """
- "Solve Array Problem #1: Two Sum using hash map approach, implement in Python, test with 5 different inputs"
  Resources: [{"title": "Two Sum Problem Explained", "type": "video", "url": "https://youtube.com/watch?v=KLlXCFG5TnA", "description": "Visual explanation of hash map solution"}]
- "Build a simple linked list class with insert(), delete(), display() methods and create test cases for edge conditions"
  Resources: [{"title": "Linked List Implementation Guide", "type": "article", "url": "https://realpython.com/linked-lists-python/", "description": "Step-by-step Python implementation"}]
- "Implement binary search algorithm from scratch, compare performance with linear search using 1000+ element arrays"
  Resources: [{"title": "VisuAlgo Binary Search", "type": "tool", "url": "https://visualgo.net/en/binarysearch", "description": "Interactive binary search visualization"}]
- "Create a stack using Python lists, then use it to solve the Valid Parentheses problem with 10 test cases"
  Resources: [{"title": "Stack Data Structure", "type": "tutorial", "url": "https://www.programiz.com/dsa/stack", "description": "Complete stack implementation tutorial"}]
- "Design and implement a basic hash table with collision handling using separate chaining method"
  Resources: [{"title": "Hash Tables Explained", "type": "video", "url": "https://youtube.com/watch?v=shs0KM3wKv8", "description": "Collision handling techniques explained"}]
""",
                "theoretical": """
- "Study and document time complexity of 5 sorting algorithms with mathematical proofs and comparison charts"
  Resources: [{"title": "Big O Cheat Sheet", "type": "website", "url": "https://www.bigocheatsheet.com/", "description": "Comprehensive complexity reference"}]
- "Analyze space complexity of recursive vs iterative solutions for factorial, Fibonacci, and tree traversal"
  Resources: [{"title": "Space Complexity Analysis", "type": "article", "url": "https://www.geeksforgeeks.org/g-fact-86/", "description": "Detailed space complexity examples"}]
- "Create visual diagrams explaining how bubble sort works step-by-step with 10-element array example"
  Resources: [{"title": "Sorting Algorithm Animations", "type": "website", "url": "https://www.sortvisualizer.com/", "description": "Interactive sorting visualizations"}]
- "Research and compare different collision resolution techniques in hash tables with pros/cons analysis"
  Resources: [{"title": "Hash Table Collision Resolution", "type": "documentation", "url": "https://en.wikipedia.org/wiki/Hash_table#Collision_resolution", "description": "Comprehensive collision handling methods"}]
- "Write detailed explanation of why quicksort average case is O(n log n) with mathematical derivation"
  Resources: [{"title": "Quicksort Analysis", "type": "article", "url": "https://www.khanacademy.org/computing/computer-science/algorithms/quick-sort/a/analysis-of-quicksort", "description": "Mathematical analysis of quicksort complexity"}]
"""
            },
            "intermediate": {
                "practical": """
- "Solve 5 medium-difficulty tree problems: validate BST, lowest common ancestor, serialize/deserialize, path sum variations"
  Resources: [{"title": "LeetCode Tree Problems", "type": "website", "url": "https://leetcode.com/tag/tree/", "description": "Curated tree problem collection"}]
- "Implement advanced graph algorithms: Dijkstra's shortest path and A* search for pathfinding applications"
  Resources: [{"title": "Graph Algorithms Visualized", "type": "tool", "url": "https://visualgo.net/en/graphds", "description": "Interactive graph algorithm visualization"}]
- "Build a complete trie data structure and use it to solve word search, auto-complete, and spell checker problems"
  Resources: [{"title": "Trie Implementation Tutorial", "type": "tutorial", "url": "https://www.topcoder.com/thrive/articles/Using%20Tries", "description": "Complete trie data structure guide"}]
- "Create dynamic programming solutions for 0/1 knapsack, longest common subsequence, and edit distance problems"
  Resources: [{"title": "Dynamic Programming Patterns", "type": "article", "url": "https://leetcode.com/discuss/general-discussion/458695/dynamic-programming-patterns", "description": "Common DP problem patterns and solutions"}]
- "Design and implement a LRU cache using doubly linked list and hash map with O(1) operations"
  Resources: [{"title": "LRU Cache Design", "type": "video", "url": "https://youtube.com/watch?v=7ABFKPK2hD4", "description": "Step-by-step LRU cache implementation"}]
"""
            }
        },
        "react": {
            "beginner": {
                "practical": """
- "Create a counter app with increment/decrement buttons using useState hook, style with CSS modules"
  Resources: [{"title": "React useState Hook Tutorial", "type": "tutorial", "url": "https://react.dev/reference/react/useState", "description": "Official useState documentation and examples"}]
- "Build a todo list with add/delete functionality, local storage persistence, and input validation"
  Resources: [{"title": "React Todo App Tutorial", "type": "video", "url": "https://youtube.com/watch?v=hQAHSlTtcmY", "description": "Complete todo app with localStorage"}]
- "Develop a weather dashboard fetching OpenWeatherMap API data with loading states and error handling"
  Resources: [{"title": "OpenWeatherMap API", "type": "documentation", "url": "https://openweathermap.org/api", "description": "Weather API documentation and examples"}]
- "Create a multi-step registration form with validation, progress indicator, and form state management"
  Resources: [{"title": "React Hook Form", "type": "tool", "url": "https://react-hook-form.com/", "description": "Performant forms library with validation"}]
- "Build a simple e-commerce product catalog with filtering, search, and cart functionality using useContext"
  Resources: [{"title": "React Context API Guide", "type": "article", "url": "https://kentcdodds.com/blog/how-to-use-react-context-effectively", "description": "Best practices for Context API usage"}]
""",
                "project-based": """
- "Build a complete personal portfolio website with React Router, responsive design, and contact form integration"
  Resources: [{"title": "React Router Tutorial", "type": "tutorial", "url": "https://reactrouter.com/en/main/start/tutorial", "description": "Complete routing setup guide"}]
- "Create a social media dashboard aggregating Twitter and Instagram APIs with real-time updates"
  Resources: [{"title": "React Query for API Management", "type": "documentation", "url": "https://tanstack.com/query/latest", "description": "Powerful data fetching and caching library"}]
- "Develop a task management app with drag-and-drop functionality using react-beautiful-dnd library"
  Resources: [{"title": "React Beautiful DnD", "type": "tool", "url": "https://github.com/atlassian/react-beautiful-dnd", "description": "Beautiful drag and drop for React"}]
- "Build a real-time chat application using Socket.io with rooms, typing indicators, and message persistence"
  Resources: [{"title": "Socket.io with React Tutorial", "type": "video", "url": "https://youtube.com/watch?v=djMy4QsPWiI", "description": "Real-time chat app development"}]
- "Create a data visualization dashboard using D3.js integration showing COVID-19 statistics with interactive charts"
  Resources: [{"title": "React + D3.js Integration", "type": "article", "url": "https://www.smashingmagazine.com/2018/02/react-d3-ecosystem/", "description": "Best practices for combining React and D3"}]
"""
            }
        },
        "python": {
            "beginner": {
                "practical": """
- "Build a expense tracker CLI that reads CSV files, categorizes expenses, and generates monthly reports with charts"
  Resources: [{"title": "Python CSV Module Tutorial", "type": "tutorial", "url": "https://docs.python.org/3/library/csv.html", "description": "Official CSV handling documentation"}]
- "Create a web scraper for job listings using BeautifulSoup, handle pagination, save to JSON with error handling"
  Resources: [{"title": "Beautiful Soup Documentation", "type": "documentation", "url": "https://www.crummy.com/software/BeautifulSoup/bs4/doc/", "description": "Complete web scraping guide"}]
- "Develop a password manager with encryption using cryptography library, secure file storage, and CLI interface"
  Resources: [{"title": "Python Cryptography Tutorial", "type": "article", "url": "https://cryptography.io/en/latest/", "description": "Secure encryption implementation guide"}]
- "Build a weather API wrapper class with caching, rate limiting, and data validation using requests library"
  Resources: [{"title": "Requests Library Guide", "type": "tutorial", "url": "https://docs.python-requests.org/en/latest/", "description": "HTTP library for Python"}]
- "Create a file organizer script that sorts downloads folder by file type, date, and size with progress bars"
  Resources: [{"title": "Python pathlib Tutorial", "type": "article", "url": "https://realpython.com/python-pathlib/", "description": "Modern file system path handling"}]
"""
            }
        },
        "hindi": {
            "beginner": {
                "practical": """
- "Practice writing 30 Devanagari characters daily with stroke order, pronunciation, and 2 example words each"
  Resources: [{"title": "Devanagari Writing Practice", "type": "tool", "url": "https://www.learnsanskrit.cc/index.php?mode=0", "description": "Interactive Devanagari character practice"}]
- "Learn 15 essential greetings and introductions, practice with native speaker via HelloTalk app for 20 minutes"
  Resources: [{"title": "HelloTalk Language Exchange", "type": "tool", "url": "https://hellotalk.com/", "description": "Connect with native Hindi speakers"}]
- "Master 25 family relationship terms, create family tree with Hindi labels, practice with audio recordings"
  Resources: [{"title": "Hindi Family Vocabulary", "type": "video", "url": "https://youtube.com/watch?v=XYZ123", "description": "Family terms with pronunciation"}]
- "Watch 10-minute Bollywood movie clip, identify 20 new words, create flashcards with context sentences"
  Resources: [{"title": "Anki Flashcard App", "type": "tool", "url": "https://apps.ankiweb.net/", "description": "Spaced repetition flashcard system"}]
- "Practice daily routine vocabulary: write 100-word paragraph about your morning routine in Hindi with proper verb forms"
  Resources: [{"title": "Hindi Verb Conjugation Guide", "type": "article", "url": "https://www.hindigrammar.com/verbs/", "description": "Complete verb conjugation reference"}]
"""
            }
        },
        "fitness": {
            "beginner": {
                "practical": """
- "Complete 20-minute full-body workout: 3 sets of 10 push-ups, 15 squats, 30-second plank, track form and progress"
  Resources: [{"title": "Fitness Blender Beginner Workouts", "type": "website", "url": "https://fitnessblender.com/", "description": "Free workout videos with proper form demos"}]
- "Walk 5000 steps daily, track with fitness app, note energy levels and mood changes in workout journal"
  Resources: [{"title": "Google Fit Step Counter", "type": "tool", "url": "https://www.google.com/fit/", "description": "Free fitness tracking app"}]
- "Learn proper form for 5 basic exercises using YouTube tutorials, practice with bodyweight, film yourself for form check"
  Resources: [{"title": "Athlean-X Exercise Form", "type": "video", "url": "https://youtube.com/user/JDCav24", "description": "Professional exercise form demonstrations"}]
- "Create meal prep plan with 1500 calories, 30% protein, log everything in MyFitnessPal for accuracy tracking"
  Resources: [{"title": "MyFitnessPal Calorie Counter", "type": "tool", "url": "https://myfitnesspal.com/", "description": "Comprehensive nutrition tracking app"}]
- "Do 15-minute morning stretching routine targeting hip flexors, hamstrings, and shoulders with mobility assessment"
  Resources: [{"title": "Yoga with Adriene Morning Stretch", "type": "video", "url": "https://youtube.com/user/yogawithadriene", "description": "Guided morning stretching routines"}]
"""
            }
        },
        "cooking": {
            "beginner": {
                "practical": """
- "Master knife skills: practice julienne cuts with 2 carrots, dice 1 onion perfectly, chiffonade 5 basil leaves"
  Resources: [{"title": "Gordon Ramsay Knife Skills", "type": "video", "url": "https://youtube.com/watch?v=Ch8mi5urbXs", "description": "Professional knife techniques tutorial"}]
- "Cook perfect scrambled eggs using 3 different techniques: French, American, and Gordon Ramsay's method"
  Resources: [{"title": "Jacques Pépin Scrambled Eggs", "type": "video", "url": "https://youtube.com/watch?v=s10etP1p2bU", "description": "Classic French scrambled egg technique"}]
- "Bake basic white bread from scratch understanding gluten development, proper kneading, and fermentation timing"
  Resources: [{"title": "King Arthur Baking Bread Guide", "type": "article", "url": "https://www.kingarthurbaking.com/learn/guides/bread", "description": "Complete bread baking science and techniques"}]
- "Prepare homemade pasta dough, roll by hand, create 3 shapes: fettuccine, ravioli, and gnocchi"
  Resources: [{"title": "Bon Appétit Pasta Making", "type": "video", "url": "https://youtube.com/watch?v=1-SJGQ2HLp8", "description": "Step-by-step fresh pasta tutorial"}]
- "Learn mother sauces: make béchamel, velouté, and hollandaise from scratch with proper consistency and seasoning"
  Resources: [{"title": "The Food Lab Mother Sauces", "type": "article", "url": "https://www.seriouseats.com/sauce-guide", "description": "Science-based sauce making techniques"}]
"""
            }
        }
    }
    
    # Get specific examples based on subject, skill level, and learning style
    if subject_category in examples:
        subject_examples = examples[subject_category]
        if skill_level in subject_examples:
            level_examples = subject_examples[skill_level]
            if learning_style in level_examples:
                return level_examples[learning_style]
            else:
                # Return first available style for the skill level
                return list(level_examples.values())[0]
        else:
            # Return beginner examples if skill level not found
            beginner_examples = subject_examples.get('beginner', {})
            if learning_style in beginner_examples:
                return beginner_examples[learning_style]
            else:
                return list(beginner_examples.values())[0] if beginner_examples else ""
    
    # Generic examples for unknown subjects
    return f"""
- "Research and identify 5 specific tools/resources used by professionals in {subject_category}"
  Resources: [{{"title": "Industry Tools Guide", "type": "article", "url": "", "description": "Comprehensive tool comparison for {subject_category}"}}]
- "Complete hands-on tutorial creating tangible deliverable relevant to {subject_category}"
  Resources: [{{"title": "Beginner Tutorial", "type": "tutorial", "url": "", "description": "Step-by-step {subject_category} tutorial"}}]
- "Practice core skill for 45 minutes with specific technique, document progress and challenges"
  Resources: [{{"title": "Practice Exercises", "type": "website", "url": "", "description": "Structured practice materials for {subject_category}"}}]
- "Build mini-project applying 3 key concepts learned, share with community for feedback"
  Resources: [{{"title": "Community Forum", "type": "website", "url": "", "description": "Get feedback on your {subject_category} projects"}}]
- "Connect with 2 professionals in {subject_category} field via LinkedIn, ask specific questions about daily work"
  Resources: [{{"title": "LinkedIn Professional Network", "type": "tool", "url": "https://linkedin.com", "description": "Connect with {subject_category} professionals"}}]
"""


# Legacy support - keeping the old function for backward compatibility
LEARNING_PLAN_PROMPT = """
You are an expert learning plan generator. Create a detailed, progressive, and practical learning plan for the given goal and duration.

Goal: {goal}
Duration: {duration}
Total Days: {total_days}
Total Weeks: {total_weeks}
Total Months: {total_months}

IMPORTANT REQUIREMENTS:
1. Create EXACTLY {total_days} daily tasks, {total_weeks} weekly tasks, and {total_months} monthly tasks
2. Make each task specific, actionable, and progressive
3. Avoid generic phrases like "learn fundamentals" or "study basics"
4. Include specific projects, exercises, and practical applications
5. Each task should build upon previous tasks
6. Use concrete examples and real-world applications
7. Include relevant resources for each task

Return the response in this exact JSON format:
{{
    "goalTitle": "{goal}",
    "totalDays": {total_days},
    "monthlyTasks": [
        {{
            "label": "Month 1",
            "tasks": ["Specific task 1", "Specific task 2"],
            "resources": [{{"title": "Resource Name", "type": "video", "url": "https://example.com", "description": "Brief description"}}],
            "status": false
        }}
    ],
    "weeklyTasks": [
        {{
            "label": "Week 1", 
            "tasks": ["Specific weekly task 1", "Specific weekly task 2"],
            "resources": [{{"title": "Resource Name", "type": "article", "url": "https://example.com", "description": "Brief description"}}],
            "status": false
        }}
    ],
    "dailyTasks": [
        {{
            "label": "Day 1",
            "tasks": ["One specific, actionable daily task"],
            "resources": [{{"title": "Resource Name", "type": "tutorial", "url": "https://example.com", "description": "Brief description"}}],
            "status": false
        }}
    ]
}}
"""

def get_enhanced_prompt(goal: str, duration: str, total_days: int, total_weeks: int, total_months: int) -> str:
    """Legacy function - redirects to new personalized prompt"""
    return get_enhanced_personalized_prompt(
        goal, duration, total_days, total_weeks, total_months,
        "general", {"skill_level": "beginner", "learning_style": "practical"}, 1
    )