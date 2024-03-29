/*jshint esversion: 6 */

console.log("Frontend script is working");

$(document).ready(function () {

    let url;

    // Get config.json and variable from it
    $.ajax({
        url: "config.json",
        type: "GET",
        dataType: "json",

        success: function (configData) {
            console.log(configData.SERVER_URL, configData.SERVER_PORT);
            url = `${configData.SERVER_URL}:${configData.SERVER_PORT}`;
            console.log(url);
            getAllProducts();
        },
        error: function (error) {
            console.log(error);
        }
    });


    function getAllProducts() {
        let userid = sessionStorage.getItem("userID");
        if (!userid) {
            alert("Please log in");
        } else {
            $.ajax({
                url: `http://${url}/allProductsFromDB`,
                type: "GET",
                dataType: "json",

                success: function (productsFromMongo) {
                    let results = document.getElementById("result");
                    results.innerHTML = "";
                    for (let i = 0; i < productsFromMongo.length; i++) {
                        let createdBy = productsFromMongo[i].user_id;
                        console.log(productsFromMongo[i]);
                        if (createdBy === userid) {
                            results.innerHTML += `
                            <div class="col-4 mt-3 mb-3">
                                <div class="card">
                                    <img class="card-img-top" src="${productsFromMongo[i].image_url}" alt="${productsFromMongo[i].name}">
                                    <div class="card-body">
                                        <h5 class="card-title">${productsFromMongo[i].name}</h5>
                                        <p class="card-text">${productsFromMongo[i].price}</p>
                                        <button value="${productsFromMongo[i]._id}" class="btn delete btn-primary" type="button" name="button">Delete</button>
                                        <button value="${productsFromMongo[i]._id}" data-bs-toggle="modal" data-bs-target="#editModal" class="btn edit btn-primary" type="button" name="button">Edit</button>
                                        <button value="${productsFromMongo[i]._id}" data-bs-toggle="modal" data-bs-target="#readmoreModal" class="btn btn-primary readmore" type="button" name="button">Read More</button>
                                    </div>
                                </div>
                            </div>
                            `;
                        } else {
                            results.innerHTML += `
                            <div class="col-4 mt-3 mb-3">
                                <div class="card">
                                    <img class="card-img-top" src="${productsFromMongo[i].image_url}" alt="${productsFromMongo[i].name}">
                                    <div class="card-body">
                                        <h5 class="card-title">${productsFromMongo[i].name}</h5>
                                        <p class="card-text">${productsFromMongo[i].price}</p>
                                        <button value="${productsFromMongo[i]._id}" data-bs-toggle="modal" data-bs-target="#readmoreModal" class="btn btn-primary readmore" type="button" name="button">Read More</button>
                                    </div>
                                </div>
                            </div>
                            `;
                        }
                        editProducts();
                        deleteButtons();
                        readmore();
                    }
                },
                error: function () {
                    alert("Unable to get products");
                }
            }); // End of AJAX
        } // End of if else
    }


    // View Products onclick of View Products Button
    $("#viewProducts").click(function () {
        getAllProducts();
    }); // End of View Products


    // Add Product on Form Submit
    $("#addProduct").click(function (event) {
        event.preventDefault();
        let name = $("#a-name").val(); // Same as getElementByID.value
        let price = $("#a-price").val();
        let image_url = $("#a-imageurl").val();
        let userid = sessionStorage.getItem("userID");
        console.log(userid);
        console.log(name, price, image_url);
        if (name == "" || price == "" || image_url == "" || !userid) {
            alert("Please enter all details for New Product");
        } else {
            $.ajax({
                url: `http://${url}/addProduct`,
                type: "POST",
                data: {
                    name: name,
                    price: price,
                    image_url: image_url,
                    user_id: userid,
                },

                success: function (product) {
                    console.log(product);
                    alert("Product Added");
                    getAllProducts();
                },
                error: function () {
                    console.log("Error: Cannot call API or Add Product");
                }

            });
        } // End of else statement

    }); // End of Add Product click


    // Giving our "Save Changes" button the product ID for each Product

    function editProducts() {
        let editButtons = document.querySelectorAll(".edit");
        let buttons = Array.from(editButtons);
        buttons.forEach(function (button) {
            button.addEventListener("click", function () {
                let saveChange = document.querySelector(".saveChange");
                saveChange.value = this.value;
            });
        });
    }

    // UPDATE PRODUCT FROM MODAL SAVE BTN
    $(".saveChange").click(function (event) {
        event.preventDefault();
        let productId = this.value;
        let productName = $('#productName').val();
        let productPrice = $('#productPrice').val();
        let productImageUrl = $('#imageurl').val();
        let userid = sessionStorage.getItem('userID');
        console.log(productId, productName, productPrice, productImageUrl);
        if (productId == '' || !userid) {
            alert('Please enter a product to update');
        } else {
            $.ajax({
                url: `http://${url}/updateProduct/${productId}`,
                type: 'PATCH',
                data: {
                    name: productName,
                    price: productPrice,
                    image_url: productImageUrl
                },
                success: function (data) {
                    console.log(data);
                    getAllProducts();
                },
                error: function () {
                    console.log('error: cannot update post');
                } // error
            }); // ajax
        } // if
    }); // update click


    function deleteButtons() {
        let deleteButtons = document.querySelectorAll(".delete");
        let buttons = Array.from(deleteButtons);
        buttons.forEach(function (button) {
            button.addEventListener("click", function (event) {
                event.preventDefault();
                let productId = this.value;
                let userid = sessionStorage.getItem('userID');
                console.log(productId);
                if (productId == '' || !userid) {
                    alert('Please enter product id to delete');
                } else {
                    $.ajax({
                        url: `http://${url}/deleteProduct/${productId}`,
                        type: 'DELETE',
                        success: function () {
                            console.log('deleted');
                            alert('Product Deleted');
                            getAllProducts();
                        },
                        error: function () {
                            console.log('error: cannot delete due to call on api');
                        } // error
                    }); // ajax
                } // if
            });
        });
    }


    // Get Single Product Data on Read More click and populate Read More Modal
    function readmore() {
        let readmoreButtons = document.querySelectorAll('.readmore');
        let buttons = Array.from(readmoreButtons);
        buttons.forEach(function (button) {
            button.addEventListener('click', function () {
                console.log(`readmore with an id of ${this.value}`);
                let productId = this.value;
                $.ajax({
                    url: `http://${url}/singleProduct/${productId}`,
                    type: 'GET',
                    dataType: 'json',
                    success: function (product) {
                        console.log(product);
                        let readmoreBody = document.getElementById("readMoreBody");
                        readmoreBody.innerHTML = `
                        <div class="row featurette">
                            <div class="col-md-7">
                                <h2 class="featurette-heading fw-normal lh-1">${product.name.toUpperCase()} <span
                                    class="text-muted">${product.price}</span></h2>
                                <p class="lead">Some great placeholder content for the first featurette here. Imagine some
                                exciting prose here.</p>
                            </div>
                            <div class="col-md-5">
                                <img id="modalImage" class="w-100" src="${product.image_url}" alt="${product.name}">
                            </div>
                            <div class="accordion" id="accordionExample">
                                <div class="accordion-item">
                                    <h2 class="accordion-header" id="headingOne">
                                    <button id="viewComments" value="${product._id}" class="accordion-button collapsed" type="button" data-bs-toggle="collapse"
                                    data-bs-target="#collapseOne" aria-expanded="true" aria-controls="collapseOne">
                                    View Comments
                                    </button>
                                     </h2>
                                    <div id="collapseOne" class="accordion-collapse collapse" aria-labelledby="headingOne"
                                    data-bs-parent="#accordionExample">
                                        <div class="accordion-body">
                                            <div id="comments">
                                                
                                            </div>
                                            <div class="add-comment">
                                                <label for="exampleFormControlTextarea1" class="form-label">New Comment</label>
                                                <textarea id="newCommentText" class="form-control" id="exampleFormControlTextarea1" rows="3"></textarea>
                                                <button id="saveComment" class="btn btn-primary mt-3">Save Comment</button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        `;
                        viewComments();
                        addComment();
                    },
                    error: function () {
                        alert('Unable to find product');
                    }
                }); // end of ajax
            }); // button onClick
        }); // end of forEach
    } // Readmore function



    // ------------ ADD USER API CALLS ------------ //
    // Register User
    $("#r-submit").click(function (event) {
        event.preventDefault();
        let username = $("#r-username").val();
        let email = $("#r-email").val();
        let password = $("#r-password").val();
        console.log(username, email, password);

        if (username == "" || email == "" || password == "") {
            alert("Please enter all details");
        } else {
            $.ajax({
                url: `http://${url}/registerUser`,
                type: "POST",
                data: {
                    username: username,
                    email: email,
                    password: password
                },
                success: function (user) {
                    console.log(user); // remove when dev is finished
                    if (user !== "username already taken") {
                        sessionStorage.setItem("userID", user["_id"]);
                        sessionStorage.setItem("username", user["username"]);
                        sessionStorage.setItem("userEmail", user["email"]);
                        console.log(sessionStorage);
                        alert("Thank you for registering. You have been logged in automatically!");
                    } else {
                        alert("Username already taken. Please try again");
                        $("#r-username").val("");
                        $("#r-email").val("");
                        $("#r-password").val("");
                    }
                },
                error: function () {
                    console.log("Error: cannot call add user API");
                } // End or error

            }); // End of AJAX

        } // End of else

    }); // End of Submit User click

    // Login User
    $("#login-submit").click(function (event) {
        event.preventDefault();
        let username = $("#login-username").val();
        let password = $("#login-password").val();
        console.log(username, password);

        if (username == "" || password == "") {
            alert("Please enter all details");
        } else {
            $.ajax({
                url: `http://${url}/loginUser`,
                type: "POST",
                data: {
                    username: username,
                    password: password
                },

                success: function (user) {
                    console.log(user);

                    if (user == "User not found. Please register.") {
                        alert("User not found. Please register.");
                    } else if (user == "Not authorised") {
                        alert("Not authorised");
                        $("#login-username").val("");
                        $("#login-password").val("");
                    } else {
                        sessionStorage.setItem("userID", user["_id"]);
                        sessionStorage.setItem("username", user["username"]);
                        sessionStorage.setItem("userEmail", user["email"]);
                        console.log(sessionStorage);
                        let loggedIn = document.querySelector('.logged-in');
                        loggedIn.innerHTML = `<p>Logged in as <span class="text-danger">${username.toUpperCase()}</span></p>`;
                        alert(`Welcome Back ${username.toUpperCase()}! :)`);
                    } // End of if

                }, // End of success
                error: function () {
                    console.log("Error: cannot call API");
                    alert("Unable to Login - unable to call API");
                } // Error

            }); // End of AJAX

        } // End of else

    }); // End of login click

    // Log out
    $("#logout").click(function () {
        sessionStorage.clear();
        alert("You are now logged out.");
        console.log(sessionStorage);
        // window.location.href = "./about.html"; //This line redirects the page to a different link upon log out
    });


    // COMMENTS
    // Get Comments
    function getComments() {
        let commentsContainer = document.getElementById('comments');
        let productId = $('#viewComments').val();
        $.ajax({
            url: `http://${url}/allComments`,
            type: 'GET',
            dataType: 'json',

            success: function (comments) {
                console.log(comments);
                commentsContainer.innerHTML = '';
                for (i = 0; i < comments.length; i++) {
                    if (productId === comments[i].product_id) {
                        console.log(comments[i]);
                        let date = comments[i].time;
                        let dateObject = new Date(date);
                        let hour = dateObject.getHours();
                        let m = 'AM'
                        if (hour === 0) {
                            m = 'PM'
                        } if (hour > 12) {
                                hour = hour - 12;
                                m = 'PM'
                            }
                        let minute = dateObject.getMinutes();
                        let day = dateObject.getDate();
                        let month = (dateObject.getMonth() + 1);
                        let year = dateObject.getFullYear();
                        let formattedDate = `${day}/${month}/${year} ${hour}:${minute}${m}`
                        commentsContainer.innerHTML += `
                            <div class='new-comment'>
                                <p>${comments[i].text}</p>
                                <h6 class='test-muted'>Posted by: <span>${comments[i].username}</span><br><span>${formattedDate}</span></h6>
                            </div>
                        `;
                    } // else {
                    //     commentsContainer.innerHTML = `
                    //         <div class='new-comment'>
                    //             <p class='test-muted'> This product has no comments yet. Please post a comment below. </p>
                    //         </div>
                    //     `;
                    // }
                }
            },
            error: function () {
                console.log('Error: cannot call comments API');
            } // End of error
        }); // End of AJAX
    } // End of Get Comments

    // View Comments
    function viewComments() {
        $('#viewComments').click(function () {
            getComments();
        });
    }

    function addComment() {
        $('#saveComment').click(function () {
            let comment = $('#newCommentText').val();
            let user = sessionStorage.getItem('userName');
            let productId = $('#viewComments').val();
            console.log(user);
            console.log(comment);
            console.log(productId);
            $.ajax({
                url: `http://${url}/createComment`,
                type: "POST",
                data: {
                    text: comment,
                    username: user,
                    product_id: productId
                },
                success: function (comment) {
                    console.log(comment);
                    getComments();
                },
                error: function () {
                    console.log('Error: cannot post comment');
                } // End of error
            }); // End of AJAX
        }); // End of click
    } // End of function

}); // Document ready function ends