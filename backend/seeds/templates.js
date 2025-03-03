const templates = [
  // Node.js Stack Templates
  {
    name: "MEVN Full Stack Application",
    description: "Complete full-stack application template using MongoDB, Express, Vue 3, and Node.js",
    languages: ["JavaScript", "HTML", "CSS"],
    frameworks: ["Vue 3", "Express.js", "Node.js"],
    databases: ["MongoDB"],
    principles: ["MVC", "RESTful", "Component-Based"],
    designPatterns: ["Repository", "Singleton", "Observer"],
    libraries: ["Mongoose", "Axios", "Pinia", "Vue Router"],
    structure: `Create a full-stack application with:

Backend:
- Express.js RESTful API
- MongoDB with Mongoose for {databases}
- Authentication and authorization
- File upload handling
- Error handling middleware
- Environment configuration
- API documentation

Frontend:
- Vue 3 with Composition API
- State management using Pinia
- Component structure
- Routing setup
- API integration
- Form handling
- User interface

Technical Requirements:
- Languages: {languages}
- Frameworks: {frameworks}
- Design Patterns: {designPatterns}
- Architecture: {principles}
- Libraries: {libraries}

Include Docker configuration and deployment instructions.`,
    isCodeGenerator: true
  },
  {
    name: "Socket.io Real-Time Application",
    description: "Real-time application template with Socket.io, Vue 3, and Express",
    languages: ["JavaScript", "HTML", "CSS"],
    frameworks: ["Vue 3", "Express.js", "Socket.io"],
    databases: ["MongoDB"],
    principles: ["Event-Driven", "Real-Time Communication"],
    designPatterns: ["Observer", "Pub/Sub"],
    libraries: ["Socket.io-client", "Mongoose", "Pinia"],
    structure: `Create a real-time application using:

Backend:
- Socket.io server setup
- Express.js integration
- Event handling structure
- Room management
- Authentication
- MongoDB integration for {databases}

Frontend:
- Vue 3 Socket.io client
- Real-time updates
- Event handling
- User presence tracking
- Message broadcasting

Technical Requirements:
- Languages: {languages}
- Frameworks: {frameworks}
- Patterns: {designPatterns}
- Architecture: {principles}
- Libraries: {libraries}

Include error handling and reconnection logic.`,
    isCodeGenerator: true
  },

  // C# and .NET Templates
  {
    name: "C# .NET Vue Full Stack",
    description: "Full stack application using C#, .NET, SQL Server, and Vue",
    languages: ["C#", "JavaScript", "SQL", "HTML", "CSS"],
    frameworks: [".NET Core", "Vue 3", "Entity Framework"],
    databases: ["SQL Server"],
    principles: ["Clean Architecture", "SOLID", "DDD"],
    designPatterns: ["Repository", "CQRS", "Mediator"],
    libraries: ["AutoMapper", "MediatR", "FluentValidation"],
    structure: `Create a full-stack enterprise application:

Backend (.NET):
- Clean Architecture structure
- CQRS implementation
- Entity Framework Core
- SQL Server integration
- Authentication/Authorization
- API documentation
- Unit testing

Frontend (Vue):
- Vue 3 setup
- TypeScript integration
- Component architecture
- State management
- API integration
- Form validation

Technical Requirements:
- Languages: {languages}
- Frameworks: {frameworks}
- Patterns: {designPatterns}
- Architecture: {principles}
- Libraries: {libraries}

Include deployment and CI/CD configuration.`,
    isCodeGenerator: true
  },

  // Python AI/ML Templates
  {
    name: "Python AI Model Training",
    description: "AI model training template with Python and popular ML frameworks",
    languages: ["Python"],
    frameworks: ["TensorFlow", "PyTorch", "Scikit-learn"],
    databases: ["PostgreSQL"],
    principles: ["Machine Learning", "Data Processing"],
    designPatterns: ["Factory", "Strategy"],
    libraries: ["NumPy", "Pandas", "Matplotlib"],
    structure: `Create an AI model training pipeline:

Components:
- Data preprocessing
- Model architecture
- Training pipeline
- Validation methods
- Metrics tracking
- Result visualization
- Model export

Technical Requirements:
- Languages: {languages}
- Frameworks: {frameworks}
- Libraries: {libraries}
- Data handling for {databases}

Include documentation for:
- Dataset requirements
- Training parameters
- Model evaluation
- Performance metrics`,
    isCodeGenerator: true
  },
  {
    name: "Python Data Analysis",
    description: "Data analysis template using Python and data science tools",
    languages: ["Python"],
    frameworks: ["Pandas", "NumPy"],
    databases: ["PostgreSQL", "MongoDB"],
    principles: ["Data Analysis", "Statistical Analysis"],
    designPatterns: ["Observer", "Strategy"],
    libraries: ["Matplotlib", "Seaborn", "Plotly"],
    structure: `Create a data analysis project:

Components:
- Data loading and cleaning
- Exploratory analysis
- Statistical processing
- Visualization
- Report generation
- Export capabilities

Technical Requirements:
- Languages: {languages}
- Frameworks: {frameworks}
- Libraries: {libraries}
- Database integration: {databases}

Include documentation for:
- Data requirements
- Analysis methods
- Visualization types`,
    isCodeGenerator: true
  },

  // PowerShell Templates
  {
    name: "PowerShell System Management",
    description: "System management and maintenance scripts using PowerShell",
    languages: ["PowerShell"],
    frameworks: ["Windows PowerShell"],
    databases: [],
    principles: ["Automation", "System Administration"],
    designPatterns: ["Script Modules"],
    libraries: ["PSWindowsUpdate", "ActiveDirectory"],
    structure: `Create PowerShell system management scripts:

Components:
- Service management
- System updates
- Log monitoring
- Backup procedures
- Security checks
- Report generation

Technical Requirements:
- PowerShell version requirements
- Module dependencies
- Permission requirements
- Logging implementation

Include documentation for:
- Script usage
- Parameter descriptions
- Error handling
- Scheduling setup`,
    isCodeGenerator: true
  },

  // Web Application Templates
  {
    name: "MEVN E-Commerce Platform",
    description: "E-commerce platform using MEVN stack",
    languages: ["JavaScript", "HTML", "CSS"],
    frameworks: ["Vue 3", "Express.js", "Node.js"],
    databases: ["MongoDB"],
    principles: ["MVC", "RESTful"],
    designPatterns: ["Repository", "Observer"],
    libraries: ["Mongoose", "Stripe", "Vue Router", "Pinia"],
    structure: `Create an e-commerce platform with:

Features:
- Product catalog
- Shopping cart
- User accounts
- Payment integration
- Order management
- Inventory tracking
- Analytics

Technical Stack:
- Frontend: Vue 3
- Backend: Express.js
- Database: {databases}
- Authentication: JWT
- Payment: Stripe

Requirements:
- Languages: {languages}
- Frameworks: {frameworks}
- Libraries: {libraries}
- Patterns: {designPatterns}`,
    isCodeGenerator: true
  },
  {
    name: "MEVN Lead Generation Site",
    description: "Lead generation website using MEVN stack",
    languages: ["JavaScript", "HTML", "CSS"],
    frameworks: ["Vue 3", "Express.js", "Node.js"],
    databases: ["MongoDB"],
    principles: ["MVC", "RESTful"],
    designPatterns: ["Repository", "Strategy"],
    libraries: ["Mongoose", "Nodemailer", "Pinia"],
    structure: `Create a lead generation website with:

Features:
- Landing pages
- Contact forms
- Lead tracking
- Email integration
- Analytics
- CRM integration
- A/B testing

Technical Stack:
- Frontend: Vue 3
- Backend: Express.js
- Database: {databases}
- Email: Nodemailer
- Analytics: Custom tracking

Requirements:
- Languages: {languages}
- Frameworks: {frameworks}
- Libraries: {libraries}
- Patterns: {designPatterns}`,
    isCodeGenerator: true
  }
  // ...Add more templates as needed
];

module.exports = templates;
