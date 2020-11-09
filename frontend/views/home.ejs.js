<!DOCTYPE html>
<html>
<head>
    <title> FASCIA Login</title>
    
<link rel="stylesheet"
href=
"https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css"
integrity=
"sha384-BVYiiSIFeK1dGmJRAkycuHAHRg32OmUcww7on3RYdg4Va+PmSTsz/K68vbdEjh4u"
crossorigin="anonymous">

<link rel="stylesheet" type="text/css" href="stylesheet.css">

</head>
<body>

    <br>
    <br>
    <br>
    <div class="container" >
        <div class="row">
        <div class="col-md-3">

        </div>

        <div class="col-md-6 main">

            <form action="/login" method="post">

            <h1> FASCIA </h1>


            <input class="button button4" type="button"
            onclick="location.href='/register';"
            value="Register" />

            <input class="button button4" type="button"
            onclick="location.href='/login';"
            value="Login" />


            <input class="button button4" type="button"
            onclick="location.href='/logout';"
            value="Logout" />



            </form>

        </div>


        <div class="col-md-3">
        </div>

    </div>
    </div>
</body>
</html>