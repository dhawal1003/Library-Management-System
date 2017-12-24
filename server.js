
var express = require('express');
var mysql = require('mysql');

var con = mysql.createConnection({
    user: 'root',
    password: 'amvisa123',
    database: 'library'
});

var query = "select b.isbn, b.title, group_concat(a.name SEPARATOR ' , ') as name, b.available from book b ,authors a, book_authors ba "+
  "where  b.isbn = ba.isbn and a.author_id = ba.author_id and (concat(b.title,a.name) like ? or concat(a.name,b.title) like ? or b.isbn like ?) group by b.isbn";

con.connect(function(err){
    if (err){
        throw err; return;
    }
    console.log('Connected to DB');
});

var app = express();
var router = express.Router();
var path = __dirname + '/';
app.set('view engine','pug');

router.use(function (req,res,next) {
  console.log("/" + req.method);
  next();
});

router.get("/",function(req,res){
  var search = req.query.search;
  
  if(typeof search == 'undefined'){
          res.render('index',{ title: 'Library Application'});
  }
  else if(search == ""){
          res.render('index',{ title: 'Library Application', message: [] });
  }
  else {
    if(isNaN(search)){
        search = search.split(' ').join('%');
    }
    con.query(query,['%'+search+'%','%'+search+'%','%'+search+'%'],function(err,rows){
      if(err)
        throw err;
      else{
        res.render('index',{ title: 'Library Application', message: rows });
      }
    })
  }
  
});


router.get("/check",function(req,res){
  var _f = req.query.flag;
  var isbnVal = req.query.isbn;
  var cardId = req.query.cardNum;
  var err_message = '';
  var loanId;
  var booksinfo ={};
  
  con.query("select b.isbn, b.title, group_concat(a.name SEPARATOR ' , ') as name, b.available, b.cover, b.publisher, b.pages from book b ,authors a, book_authors ba where  b.isbn = ba.isbn and a.author_id = ba.author_id and b.isbn=? group by b.isbn",[isbnVal],function(err,rows){
      if(err)
        throw err;
      else{
        if(typeof _f !== 'undefined')
          booksinfo = rows;
        else  
          res.render('check',{ title: 'Library Application', message: rows , test: err_message});
    }
  })//select ends

  if(typeof _f !== 'undefined') {
    
    con.query("select * from book where isbn = ?",[isbnVal],function(err,rows){
      if(err){
        err_message = err.code;
      }
      else if(rows[0].available == 0){ 
        res.render('check',{ title: 'Library Application', message: rows, test: 'Sorry, book is not available!!!' });
      }
      else{

        con.query("select count(*) as book_count from book_loans where card_id = ? and date_in is null",[cardId],function(err,rows){
      
                if(err){
                  err_message = err.code;
                }
                else if(rows[0].book_count == 3){
                  res.render('check',{ title: 'Library Application', message: booksinfo , test: 'Maximum books are already checked out!!' });
                }      
                else{

                  con.query("insert into book_loans(isbn,card_id,date_out,due_date) values(?,?,date(now()),date(date_add(now(),INTERVAL 14 DAY)))",[isbnVal,cardId],function(err,rows){
                        if(err){  
                            res.render('check',{ title: 'Library Application', message: booksinfo , test: 'Please enter valid Card id!!!'});                     
                        } else {      
                            //loanId= rows.insertId;
                            con.query("update book set available = (available - 1) where isbn = ?",[isbnVal],function(err,rows){

                              if(err){
                                err_message = err.code;
                              }
                              else{
                                res.render('index',{ title: 'Library Application', test: 'Successfully checked out!! '});  
                              }
                          }) //update query ends 

                      }//else ends

                  }) //insert ends        
                } // else ends
                  
           })//select ends 
          
        }
    }) // select for available ends

   }//  main if ends 
   
}); // router get ends


router.get("/checkin",function(req,res){
  var selectedinput = req.query.selected;
  var selectedvalue =  req.query.cinput;
  var checkInSelected =  req.query.radios;
  var queryC;


  if(typeof selectedinput !== 'undefined') {

      console.log("Entered");
      if(selectedinput == 'isbn'){
        queryC = "select bl.card_id, bl.isbn, concat(b.fname,' ',b.lname) as name from book_loans bl, borrower b where bl.card_id = b.card_id and  bl.isbn = ? and bl.date_in is null";
        
        con.query(queryC,[selectedvalue],function(err,result){

        if(err){
          console.log(result);
          throw err;
        } else {
          console.log("rendered1");
          res.render('checkin',{ title: 'Library Application', res: result});  
        }

        })

      } else if(selectedinput == 'cardid'){
        queryC = "select bl.card_id, bl.isbn, concat(b.fname,' ',b.lname) as name from book_loans bl, borrower b where bl.card_id = b.card_id and  bl.card_id = ? and bl.date_in is null";
        con.query(queryC,[selectedvalue],function(err,result){

          if(err){
            console.log(result);
            throw err;
          } else {
            console.log("rendered2");
            res.render('checkin',{ title: 'Library Application', res: result});  
          }

          })
      
    } else if(selectedinput == 'name'){
        queryC = "select bl.card_id, bl.isbn, concat(b.fname,' ',b.lname) as name from book_loans bl, borrower b where bl.card_id = b.card_id and  concat(b.fname,' ',b.lname) like ? and bl.date_in is null";
    
        con.query(queryC,['%'+selectedvalue+'%'],function(err,result){

        if(err){
          console.log(result);
          throw err;
        } else {
          console.log("rendered3");
          res.render('checkin',{ title: 'Library Application', res: result});  
        }

        })
      }

      
  }
  else if(typeof checkInSelected !== 'undefined'){

    con.query('update book_loans set date_in = date(now()) where isbn = ?',[checkInSelected],function(err,resultBooks){
        if(err){
          throw err;
        }
        else{
            con.query('update book set available = (available + 1) where isbn = ?',[checkInSelected],function(err,resultBooks){
                if(err){
                  throw err;
                }
                else{

                  console.log("Successesfully checked in");
                  res.render('checkin',{ title: 'Library Application', messageCheckin: 'Success' });

                }
            }) // inner query ends
        }
    }) // first query ends

  }
  else {
      res.render('checkin',{ title: 'Library Application'});
  }        

}); // router ends



router.get("/borrower",function(req,res){
  var uSsn = req.query.ssn;
  var uFname = req.query.fname;
  var uLname = req.query.lname;
  var uAddr = req.query.addr;
  var uCity = req.query.city;
  var uState = req.query.state;
  var uPhone = req.query.phone;
  var userDetails = {
    ssn: uSsn,
    fname: uFname,
    lname: uLname,
    addr: uAddr,
    city: uCity,
    state: uState,
    phone: uPhone
  };

  if(typeof uSsn !== 'undefined'){

    con.query("insert into borrower select lpad(max(card_id)+1,6,'0'),?,?,?,?,?,?,? from borrower",[uSsn,uFname,uLname,uAddr,uCity,uState,uPhone],function(err,userInfo){
        if(err){
              res.render('borrower',{ title: 'Library Application', info: 'Please enter unique SSN!!', details: userDetails});
        }
        else{

              con.query('select max(card_id) as card_id from borrower',function(err,id){

                if(err){
                  throw err;
                }else{
                  console.log(id);
                  res.render('borrower',{ title: 'Library Application', info: 'Successfully created with Card Id: ' + id[0].card_id});
                }

              }) // select query ends
              
        }
    }) // query ends
    
  } else {
      res.render('borrower',{ title: 'Library Application'});
  }     

}); // borrower ends

router.get("/fines",function(req,res){
 
  var paymentCardId =  req.query.paymentid;
  
  var query = "select  T.card_id as card_id, convert(T.total_fine,char) as total_fine, convert(ifnull(T.payable_fine,0),char) as payable_fine, convert(ifnull(R.fine_paid,0),char) as fine_paid from"+
              "(select A.card_id as card_id, A.total_fine as total_fine, ifnull(B.payable_fine,0) as payable_fine from "+
              "(select b.card_id as card_id, sum(f.fine_amt) as total_fine from book_loans b, fines f where b.loan_id= f.loan_id and f.paid = 0 group by b.card_id) A left join "+
              "(select b.card_id as card_id, sum(f.fine_amt) as payable_fine from book_loans b, fines f where b.loan_id= f.loan_id and f.paid = 0 and b.date_in is not null group by b.card_id) B "+
              "on A.card_id = B.card_id) T left join (select b.card_id as card_id, sum(f.fine_amt) as fine_paid from book_loans b, fines f where b.loan_id= f.loan_id and f.paid = 1 group by b.card_id) R "+
              "on T.card_id=R.card_id "
  var query1 = "select b.card_id as card_id, convert(sum(f.fine_amt),char) as fine_paid from book_loans b, fines f where b.loan_id= f.loan_id and f.paid = 1 group by b.card_id"  
  
    con.query(query,function(err,result){
        if(err)
          throw err;
        con.query(query1,function(err,paidfineResult){
          if(err)
            throw err;
          else if(typeof paymentCardId == 'undefined'){
            console.log(result);
            res.render('fines',{ title: 'Library Application', message: result , paidfineinfo: paidfineResult});
          }
          else {
            con.query('update fines f, book_loans b set f.paid = 1 where b.loan_id = f.loan_id and b.date_in is not null and b.card_id = ?',[paymentCardId], function(err,result1){
                if(err)
                  throw err; 
                else{
                    con.query(query,function(err,result2){
                        if(err)
                          throw err;
                        else{
                          con.query(query1,function(err,paidfineResult){
                            if(err)
                              throw err;
                            else 
                              res.render('fines',{ title: 'Library Application', message: result2 , paidfineinfo: paidfineResult,flag: 'Payment Successfull!!!'});
                          })                   
                        }
                    
                    })
                }
            
            })
          }
        })
    })
});

router.get("/refreshfines",function(req,res){

  var query = "select  T.card_id as card_id, convert(T.total_fine,char) as total_fine, convert(ifnull(T.payable_fine,0),char) as payable_fine, convert(ifnull(R.fine_paid,0),char) as fine_paid from"+
              "(select A.card_id as card_id, A.total_fine as total_fine, ifnull(B.payable_fine,0) as payable_fine from "+
              "(select b.card_id as card_id, sum(f.fine_amt) as total_fine from book_loans b, fines f where b.loan_id= f.loan_id and f.paid = 0 group by b.card_id) A left join "+
              "(select b.card_id as card_id, sum(f.fine_amt) as payable_fine from book_loans b, fines f where b.loan_id= f.loan_id and f.paid = 0 and b.date_in is not null group by b.card_id) B "+
              "on A.card_id = B.card_id) T left join (select b.card_id as card_id, sum(f.fine_amt) as fine_paid from book_loans b, fines f where b.loan_id= f.loan_id and f.paid = 1 group by b.card_id) R "+
              "on T.card_id=R.card_id "
  
  var query1 = "insert into fines select b.loan_id,datediff(ifnull(b.date_in, date(now())),b.due_date) * 0.25,0 from book_loans b where b.due_date < date(now()) and "+
               "datediff(ifnull(date_in, date(now())),due_date) > 0 and b.loan_id not in(select loan_id from fines)"

  var query2 = "update fines f, book_loans b set f.fine_amt = datediff(ifnull(b.date_in,date(now())), b.due_date)*0.25 where b.loan_id = f.loan_id and f.paid = 0" 

  var query3 = "select b.card_id as card_id, convert(sum(f.fine_amt),char) as fine_paid from book_loans b, fines f where b.loan_id= f.loan_id and f.paid = 1 group by b.card_id"                           
  
  con.query(query1,function(err,rows1){

      if(err){
        throw err;
      } else{

          con.query(query2,function(err,rows2){

              if(err){
                throw err;
              } else{

                  con.query(query,function(err,result){
                      if(err)
                        throw err;
                      else{

                          con.query(query3,function(err,paidfineResult){
                              if(err)
                                throw err;
                              else{
                                console.log(paidfineResult);
                                res.render('fines',{ title: 'Library Application', message: result, paidfineinfo: paidfineResult, flag: 'Refreshed Successfully' });
                              }
                          })
                      }
                  })
              }
          })
      }
  })
});

app.use("/",router);

app.use("*",function(req,res){
  res.sendFile(path + "404.html");
});

app.listen(3000,function(){
  console.log("Live at Port 3000");
});
