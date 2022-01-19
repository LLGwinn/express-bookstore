process.env.NODE_ENV = 'test';

const request = require('supertest');
const Book = require('./models/book');
const db = require('./db');
const app = require('./app');

let isbn = "0691161518"
let amazon_url = "http://a.co/eobPtX2"
let author = "Matthew Lane"
let language = "english"
let pages = 264
let publisher = "Princeton University Press"
let title = "Power-Up: Unlocking the Hidden Mathematics in Video Games"
let year = 2017


describe("Test books GET routes", function () {
  beforeEach(async function () {
    await db.query("DELETE FROM books");
    await Book.create(
        {
        "isbn": isbn,
        "amazon_url": amazon_url,
        "author": author,
        "language": language,
        "pages": pages,
        "publisher": publisher,
        "title": title,
        "year": year
        }
    );
  });

  test("GET /books gets all books", async function () {
    const res = await request(app).get('/books');
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual(
      {books:
        [
          {
            "isbn": `${isbn}`,
            "amazon_url": `${amazon_url}`,
            "author": `${author}`,
            "language": `${language}`,
            "pages": pages,
            "publisher": `${publisher}`,
            "title": `${title}`,
            "year": year
          }
        ]
      }
    )
  });

  test("GET /books/:id gets single book with given ISBN", async function () {
    const res = await request(app).get(`/books/${isbn}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual(
      {book:
        {
        "isbn": `${isbn}`,
        "amazon_url": `${amazon_url}`,
        "author": `${author}`,
        "language": `${language}`,
        "pages": pages,
        "publisher": `${publisher}`,
        "title": `${title}`,
        "year": year 
        }
      }
    )
  });

  test("GET /books/:id returns error if ISBN not found", async function () {
    const res = await request(app).get(`/books/'badISBN'`);
    expect(res.statusCode).toBe(404);
  });
});

describe("Test books POST route", function () {
  test("POST /books creates new book (given valid info)", async function () {
    const testBook = {
                      "isbn": 'TESTISBN',
                      "amazon_url": 'http:/testamazonurl',
                      "author": 'testauthor',
                      "language": 'testlanguage',
                      "pages": 999,
                      "publisher": 'testpublisher',
                      "title": 'testtitle',
                      "year": 1999
                      }  
    const res = await request(app).post(`/books`)
                                  .send( testBook );
    expect(res.statusCode).toBe(201);
    expect(res.body).toEqual( {book:testBook} );
  });

  test("POST /books returns error if given invalid data type (pages)", async function () {
    const testBook = {
                      "isbn": 'TESTISBN',
                      "amazon_url": 'http:/testamazonurl',
                      "author": 'testauthor',
                      "language": 'testlanguage',
                      "pages": 'BADPAGES',
                      "publisher": 'testpublisher',
                      "title": 'testtitle',
                      "year": 1999
                      }  
    const res = await request(app).post(`/books`).send( testBook );

    expect(res.statusCode).toBe(400);
  });

  test("POST /books returns error if missing data (language)", async function () {
    const testBook = {
                      "isbn": 'TESTISBN',
                      "amazon_url": 'http:/testamazonurl',
                      "author": 'testauthor',
                      "pages": 999,
                      "publisher": 'testpublisher',
                      "title": 'testtitle',
                      "year": 1999
                      }  
    const res = await request(app).post(`/books`).send( testBook );

    expect(res.statusCode).toBe(400);
  });
});

describe("Test books PUT route", function () {
  beforeEach(async function () {
    await db.query("DELETE FROM books");
    await Book.create(
                      {
                      "isbn": isbn,
                      "amazon_url": amazon_url,
                      "author": author,
                      "language": language,
                      "pages": pages,
                      "publisher": publisher,
                      "title": title,
                      "year": year
                      }
    );
  });

  test("PUT /books/:isbn returns updated book data (valid info)", async function () {
    const res = await request(app).put(`/books/${isbn}`)
                                  .send(
                                    {
                                      "isbn": isbn,
                                      "amazon_url": amazon_url,
                                      "author": author,
                                      "language": 'german',
                                      "pages": pages,
                                      "publisher": publisher,
                                      "title": title,
                                      "year": year
                                    });

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ book:
                                    {
                                      "isbn": isbn,
                                      "amazon_url": amazon_url,
                                      "author": author,
                                      "language": 'german',
                                      "pages": pages,
                                      "publisher": publisher,
                                      "title": title,
                                      "year": year
                                    }
                              });
    });                      

    test("PUT /books/:isbn returns error when given invalid info type (pages)", async function () {
      const res = await request(app).put(`/books/${isbn}`)
                                    .send(
                                      {
                                        "isbn": isbn,
                                        "amazon_url": amazon_url,
                                        "author": author,
                                        "language": 'german',
                                        "pages": 'BADPAGES',
                                        "publisher": publisher,
                                        "title": title,
                                        "year": year
                                      });
  
      expect(res.statusCode).toBe(400);
    });

    test("PUT /books/:isbn returns error if missing data (language)", async function () {
      const res = await request(app).put(`/books/${isbn}`)
                                    .send(
                                      {
                                        "isbn": isbn,
                                        "amazon_url": amazon_url,
                                        "author": 'changedAuthor',
                                        "pages": 999,
                                        "publisher": publisher,
                                        "title": title,
                                        "year": year
                                      });
  
      expect(res.statusCode).toBe(400);
    });
});

describe("Test books DELETE route", function () {
  beforeEach(async function () {
    await db.query("DELETE FROM books");
    await Book.create(
                      {
                      "isbn": isbn,
                      "amazon_url": amazon_url,
                      "author": author,
                      "language": language,
                      "pages": pages,
                      "publisher": publisher,
                      "title": title,
                      "year": year
                      }
    );
  });

  test("DELETE /books/:isbn removes book from database", async function () {
    const res = await request(app).delete(`/books/${isbn}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('message', "Book deleted");
    });
    
  test("DELETE /books/:isbn returns error if ISBN not found", async function () {
    const res = await request(app).delete(`/books/'badISBN'`);
    expect(res.statusCode).toBe(404);
  });

});

  afterAll(async function() {
    await db.end();
  });