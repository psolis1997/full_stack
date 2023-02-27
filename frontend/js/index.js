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
        },
        error: function (error) {
            console.log(error);
        }
    });

    // View Products onclick of View Products Button
    $("#viewProducts").click(function () {
        $.ajax({
            url: `http://${url}/allProductsFromDB`,
            type: "GET",
            dataType: "json",

            success: function (productsFromMongo) {
                document.getElementById("result").innerHTML = "";
                for (let i = 0; i < productsFromMongo.length; i++) {
                    console.log(productsFromMongo[i]);
                    document.getElementById("result").innerHTML +=
                        `
                    <div class="col-4 mt-3 mb-3">
                        <div class="card">
                            <img class="card-img-top" src="${productsFromMongo[i].image_url}" alt="Card image cap">
                            <div class="card-body">
                                <h5 class="card-title">${productsFromMongo[i].name}</h5>
                                <p class="card-text">${productsFromMongo[i].price}</p>
                                <button id="deleteProduct" value="${productsFromMongo[i]._id}" class="btn delete btn-primary" type="button" name="button">Delete</button>
                                </div>
                            </div>
                        </div>
                        `;
                    deleteButtons();
                }
            },
            error: function (error) {
                alert("Unable to get products");
            }
        });
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
                },
                error: function () {
                    console.log("Error: Cannot call API or Add Product");
                }

            });
        } // End of else statement

    }); // End of Add Product click

    $("#updateProduct").click(function (event) {
        event.preventDefault();
        let productId = $("#productId").val();
        let productName = $("#productName").val();
        let productPrice = $("#productPrice").val();
        let productImageUrl = $("#imageurl").val();
        let userid = sessionStorage.getItem("userID");
        console.log(productId, productName, productPrice, productImageUrl);
        if (productId == "" || !userid) {
            alert("Please enter a product to update");
        } else {
            $.ajax({
                url: `http://${url}/updateProduct/${productId}`,
                type: "PATCH",
                data: {
                    name: productName,
                    price: productPrice,
                    image_url: productImageUrl
                },

                success: function (data) {
                    console.log(data);
                },
                error: function () {
                    console.log("Error: Cannot update post");
                } // End of Error

            }); //End of AJAX

        } // End of if

    }); // End of update click

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
                        success: function() {
                            console.log('deleted');
                            alert('Product Deleted');
                        },
                        error: function() {
                            console.log('error: cannot delete due to call on api');
                        }// error
                    }); // ajax
                }// if
            });
        });
    }


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
                        alert("Welcome Back! :)");
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
    });

}); // Document ready function ends