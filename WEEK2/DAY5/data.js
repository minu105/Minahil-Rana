const QUIZ_DATA = {
    html: {
        id: 'html',
        title: 'HTML Fundamentals',
        category: 'Web Development',
        image: './images/html.png',
        description: 'Test your knowledge of HTML basics and advanced concepts',
        questions: [
            {
                id: 1,
                question: 'What does HTML stand for?',
                options: ['Hyper Text Markup Language', 'High Tech Modern Language', 'Home Tool Markup Language', 'Hyperlink and Text Markup Language'],
                correct: 0
            },
            {
                id: 2,
                question: 'Which HTML element is used for the largest heading?',
                options: ['h6', 'h1', 'heading', 'header'],
                correct: 1
            },
            {
                id: 3,
                question: 'What is the correct HTML element for inserting a line break?',
                options: ['break', 'br', 'lb', 'newline'],
                correct: 1
            },
            {
                id: 4,
                question: 'Which attribute is used to specify a unique identifier for an HTML element?',
                options: ['class', 'name', 'id', 'key'],
                correct: 2
            },
            {
                id: 5,
                question: 'What is the correct HTML for creating a hyperlink?',
                options: ['a url="http://example.com">Example</a', 'a href="http://example.com">Example</a', 'link>http://example.com</link', 'hyperlink>http://example.com</hyperlink'],
                correct: 1
            },
            {
                id: 6,
                question: 'Which HTML element is used to define important text?',
                options: ['important', 'br', 'strong', 'i'],
                correct: 2
            },
            {
                id: 7,
                question: 'What is the correct HTML for making a checkbox?',
                options: ['input type="check"', 'input type="checkbox"', 'checkbox', 'check'],
                correct: 1
            },
            {
                id: 8,
                question: 'Which HTML element is used to specify a footer for a document?',
                options: ['bottom', 'section', 'footer', 'end'],
                correct: 2
            },
            {
                id: 9,
                question: 'What is the correct HTML for making a drop-down list?',
                options: ['input type="dropdown"', 'list', 'select', 'dropdown'],
                correct: 2
            },
            {
                id: 10,
                question: 'Which HTML attribute specifies an alternate text for an image?',
                options: ['title', 'alt', 'src', 'longdesc'],
                correct: 1
            }
        ]
    },
    css: {
        id: 'css',
        title: 'CSS Styling',
        category: 'Web Development',
        image: './images/css.png',
        description: 'Master CSS properties, selectors, and layout techniques',
        questions: [
            {
                id: 1,
                question: 'What does CSS stand for?',
                options: ['Creative Style Sheets', 'Cascading Style Sheets', 'Computer Style Sheets', 'Colorful Style Sheets'],
                correct: 1
            },
            {
                id: 2,
                question: 'Which property is used to change the background color?',
                options: ['color', 'bgcolor', 'background-color', 'background'],
                correct: 2
            },
            {
                id: 3,
                question: 'How do you select an element with id "demo"?',
                options: ['.demo', '#demo', 'demo', '*demo'],
                correct: 1
            },
            {
                id: 4,
                question: 'Which property is used to change the text color?',
                options: ['text-color', 'color', 'font-color', 'text-style'],
                correct: 1
            },
            {
                id: 5,
                question: 'How do you make text bold in CSS?',
                options: ['font-weight: bold', 'text-style: bold', 'font: bold', 'text-weight: bold'],
                correct: 0
            },
            {
                id: 6,
                question: 'Which property is used to change the font size?',
                options: ['text-size', 'font-style', 'font-size', 'text-style'],
                correct: 2
            },
            {
                id: 7,
                question: 'How do you center a block element horizontally?',
                options: ['text-align: center', 'margin: auto', 'align: center', 'center: true'],
                correct: 1
            },
            {
                id: 8,
                question: 'Which property is used to create space between elements?',
                options: ['spacing', 'margin', 'padding', 'border'],
                correct: 1
            },
            {
                id: 9,
                question: 'What is the default value of the position property?',
                options: ['relative', 'absolute', 'static', 'fixed'],
                correct: 2
            },
            {
                id: 10,
                question: 'Which property is used to make text italic?',
                options: ['font-style: italic', 'text-style: italic', 'font-weight: italic', 'text-decoration: italic'],
                correct: 0
            }
        ]
    },
    javascript: {
        id: 'javascript',
        title: 'JavaScript Essentials',
        image: './images/js.png',
        category: 'Programming',
        description: 'Test your JavaScript programming skills and concepts',
        questions: [
            {
                id: 1,
                question: 'Which method is used to add an element to the end of an array?',
                options: ['push()', 'add()', 'append()', 'insert()'],
                correct: 0
            },
            {
                id: 2,
                question: 'What is the correct way to declare a variable in JavaScript?',
                options: ['variable x = 5', 'var x = 5', 'v x = 5', 'declare x = 5'],
                correct: 1
            },
            {
                id: 3,
                question: 'Which operator is used to compare both value and type?',
                options: ['==', '===', '=', '!='],
                correct: 1
            },
            {
                id: 4,
                question: 'What will typeof null return?',
                options: ['null', 'undefined', 'object', 'boolean'],
                correct: 2
            },
            {
                id: 5,
                question: 'Which method is used to remove the last element from an array?',
                options: ['pop()', 'remove()', 'delete()', 'splice()'],
                correct: 0
            },
            {
                id: 6,
                question: 'What is the correct way to write a JavaScript function?',
                options: ['function = myFunction() {}', 'function myFunction() {}', 'create myFunction() {}', 'def myFunction() {}'],
                correct: 1
            },
            {
                id: 7,
                question: 'Which event occurs when the user clicks on an HTML element?',
                options: ['onchange', 'onclick', 'onmouseclick', 'onmouseover'],
                correct: 1
            },
            {
                id: 8,
                question: 'How do you create an object in JavaScript?',
                options: ['var obj = {}', 'var obj = []', 'var obj = ()', 'var obj = <>'],
                correct: 0
            },
            {
                id: 9,
                question: 'Which method converts a string to lowercase?',
                options: ['toLowerCase()', 'lower()', 'lowerCase()', 'toLower()'],
                correct: 0
            },
            {
                id: 10,
                question: 'What does the "this" keyword refer to?',
                options: ['The current function', 'The current object', 'The global object', 'The parent object'],
                correct: 1
            }
        ]
    },
    python: {
        id: 'python',
        title: 'Python Programming',
        image: './images/python.png',
        category: 'Programming',
        description: 'Explore Python syntax, data structures, and programming concepts',
        questions: [
            {
                id: 1,
                question: 'Which of the following is the correct way to create a list in Python?',
                options: ['list = []', 'list = ()', 'list = {}', 'list = <>'],
                correct: 0
            },
            {
                id: 2,
                question: 'What is the output of print(2 ** 3)?',
                options: ['6', '8', '9', '23'],
                correct: 1
            },
            {
                id: 3,
                question: 'Which keyword is used to define a function in Python?',
                options: ['function', 'def', 'func', 'define'],
                correct: 1
            },
            {
                id: 4,
                question: 'What is the correct way to import a module in Python?',
                options: ['include module', 'import module', 'using module', 'require module'],
                correct: 1
            },
            {
                id: 5,
                question: 'Which method is used to add an item to a list?',
                options: ['add()', 'append()', 'insert()', 'push()'],
                correct: 1
            },
            {
                id: 6,
                question: 'What is the correct way to create a dictionary in Python?',
                options: ['dict = []', 'dict = ()', 'dict = {}', 'dict = <>'],
                correct: 2
            },
            {
                id: 7,
                question: 'Which operator is used for floor division in Python?',
                options: ['/', '//', '%', '**'],
                correct: 1
            },
            {
                id: 8,
                question: 'What is the output of len("Hello")?',
                options: ['4', '5', '6', 'Hello'],
                correct: 1
            },
            {
                id: 9,
                question: 'Which statement is used to exit a loop in Python?',
                options: ['exit', 'break', 'stop', 'end'],
                correct: 1
            },
            {
                id: 10,
                question: 'What is the correct way to handle exceptions in Python?',
                options: ['try/catch', 'try/except', 'catch/finally', 'handle/error'],
                correct: 1
            }
        ]
    },
    cpp: {
        id: 'cpp',
        title: 'C++ Programming',
        image: './images/cpp.png',
        category: 'Programming',
        description: 'Test your knowledge of C++ syntax and object-oriented programming',
        questions: [
            {
                id: 1,
                question: 'Which header file is required for input/output operations in C++?',
                options: ['stdio.h', 'iostream', 'conio.h', 'fstream'],
                correct: 1
            },
            {
                id: 2,
                question: 'What is the correct way to declare a variable in C++?',
                options: ['int x;', 'variable int x;', 'declare int x;', 'var int x;'],
                correct: 0
            },
            {
                id: 3,
                question: 'Which operator is used to access members of a class through a pointer?',
                options: ['.', '->', '::', '&'],
                correct: 1
            },
            {
                id: 4,
                question: 'What is the size of int data type in C++ (typically)?',
                options: ['2 bytes', '4 bytes', '8 bytes', '1 byte'],
                correct: 1
            },
            {
                id: 5,
                question: 'Which keyword is used to define a class in C++?',
                options: ['class', 'struct', 'object', 'define'],
                correct: 0
            },
            {
                id: 6,
                question: 'What is the correct way to allocate memory dynamically in C++?',
                options: ['malloc()', 'new', 'alloc()', 'create()'],
                correct: 1
            },
            {
                id: 7,
                question: 'Which access specifier makes class members accessible only within the class?',
                options: ['public', 'private', 'protected', 'internal'],
                correct: 1
            },
            {
                id: 8,
                question: 'What is the correct syntax for a for loop in C++?',
                options: ['for(int i=0; i<10; i++)', 'for i in range(10)', 'for(i=0 to 10)', 'for i=0; i<10; i++'],
                correct: 0
            },
            {
                id: 9,
                question: 'Which function is called when an object is destroyed in C++?',
                options: ['constructor', 'destructor', 'finalizer', 'dispose'],
                correct: 1
            },
            {
                id: 10,
                question: 'What does the scope resolution operator (::) do?',
                options: ['Accesses global variables', 'Defines namespaces', 'Accesses class members', 'All of the above'],
                correct: 3
            }
        ]
    }
};

const FEATURED_QUIZZES = ['html', 'javascript', 'python'];
const CATEGORIES = [
    { id: 'all', name: 'All', count: 5 },
    { id: 'web-development', name: 'Web Development', count: 2 },
    { id: 'programming', name: 'Programming', count: 3 }
];
