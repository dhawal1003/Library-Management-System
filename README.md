# Library-Management-System

This Library Management System DBMS has 5 main Modules. Their functionalities and usage are as follows:

1.	Search: On the home page, you will be prompted to enter either Book Title or Author or ISBN and on hitting the Submit button, the results are displayed.

2.	Check Out: When the book results are displayed, the librarian can click the ISBN hyperlink which needs to be checked out. On clicking the hyperlink, you will be redirected to the Check Out page, where the information regarding the book will be displayed and the availability of the book will be displayed. If the book is available, you can enter the Borrower’s Card Id and click on Check Out and the book will be successfully checked out making the availability of the Book to 0 and an entry will be made in the book_loans table. A borrower will be able to check out 3 books maximum.

3.	Check In: On clicking the Check In hyperlink or its icon, you will be redirected to a form asking for either ISBN or Borrower Card Id or Borrower Name as input and it will display the borrowed books details for that borrower. You can select the book which you need to check in and click on Check-In which will check in the book by setting the date_in as today's date.

4.	Add User: On clicking the Add User hyperlink or its icon, you get a form in which you can enter the details of a New Borrower and on clicking the Add User button, the details will be entered in the database provided the SSN number is unique.

5.	Fines: On Clicking the Fines hyperlink or its icon, you will be redirected to the fines page which will display the total fine and payable fine for all the borrowers who returned the books after the due date as well the books which are still not returned. You can select a borrower’s card id and pay the fine by clicking on Pay Fine button. If you want to see the updated fines information, you can click on the Refresh button which will refresh the fines as well as create new fines for the books which are overdue. To see the details of the fines which are already paid, you can click the View History button, which will display the card id and fine paid information.

Execution Commands:

1) Install Node.js
2) Extract the above files
3) Open the command prompt from this folder or set the working directory of command prompt to this folder.
3) Following are the sequence of commands to be executed:
	a) npm install
	b) node server.js
4) Open the browser and go to the link: http://localhost:3000/.


