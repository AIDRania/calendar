## Calendar

Thank you for using Calendar!

this application aims to facilitate the organization of your meals in several calendars and control your schedule by month or by week or by day. 

environnement:
- NodeJS : https://nodejs.org/en/download/
- npm (with nodeJS by default)

Features:
- base64-img  
- body-parser
- express
- express-session
- moment
- mongoose
- socket.io

instalation:
- nmp install 

execution: 
- node server.js 

note: 
	to éxécute the server in localhost you need to change variable localhost in server.js to true



If you choose localhost : Go in the web browser and tape localhost:3001 then start your navigation 

You can see the calendars without create an account but cant create or update events

If you sign up then you can create or update or delete the events if you are the owner or administrator.

Files structure:

- server files "src": 
	- server.js : the index of the application
	- user.js the : file of all user requests
	- calendar.js : the file of all calendar requests 

- public (client) files "public":
	- images: directory of images and icons ...
	- src: the javascript & angularjs directory
		- src/lib: all the external librarys 
		- src/fullcalendar: the files of fullcalendar functions
		- controller.js: the file of SPA(Single Page Application) => angularjs controllers
		- index.js : the file of all ajax functions
		- services.js: files of services used by the cotroller to controle states
	- views: all files HTML components (templates)
	-style: CSS files
	-index.js: the principle HTML file when you start the application  

Note: 

- the data (mongoDB) is saved in https://mlab.com/ 

sources: 
	https://getbootstrap.com/
	https://bootstrapious.com/p/bootstrap-sidebar 



Copyright © 2018-2019 by AID rania & Sarahaouimeur Leila 