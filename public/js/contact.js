var sb = document.getElementById("contactbutton");
function idval (id) {
    return document.getElementById(id).value;
}
function errid (id) {
    $("#" + id).addClass("errorinput");
}
function errmsg (msg) {
    var errorp = $("#error");
    errorp.toggleClass("hidden error");
    errorp.text(msg);
}
sb.addEventListener("click", function () {
    $(".errorinput").removeClass("errorinput");
    $("#error").removeClass("error");
    $("#error").addClass("hidden");
    if (idval("first").length == 0) {
        errid("first");
        errmsg("Error: First name is a required field");
        return;
    }
    if (idval("first").length > 50) {
        errid("first");
        errmsg("Error: First name is too long");
        return;
    }
    if (idval("last").length == 0) {
        errid("last");
        errmsg("Error: Last name is a required field");
        return;
    }
    if (idval("last").length > 50) {
        errid("last");
        errmsg("Error: Last name is too long");
        return;
    }
    if (idval("email").length == 0) {
        errid("email");
        errmsg("Error: Email address or Discord tag is a required field");
        return;
    }
    if (idval("email").length > 50) {
        errid("email");
        errmsg("Error: Email or Discord tag is too long");
        return;
    }
    if (! idval("email").match(/^(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\.){3}(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])$/gi) && ! idval("email").match(/^.{1,32}?#\d{4}$/gi)) {
        errid("email");
        errmsg("Error: Malformed email address or Discord tag. If it is a Discord tag, it must be of the form Username#discriminator, e.g. ShineyDev#3116");
        return;
    }
    if (idval("message").length < 30) {
        errid("message");
        errmsg("Error: Contact message must be at least 30 characters");
        return;
    }
    if (idval("message").length > 1000) {
        errid("message");
        errmsg("Error: Contact message must be at most 1000 characters");
        return;
    }
    $.ajax({
        type: "POST",
        url: "/contact",
        data: {
            first: idval("first"),
            last: idval("last"),
            email: idval("email"),
            message: idval("message")
        },
        dataType: "json",
        statusCode: {
            400: function () {
                errid("contactbutton");
                errmsg("Error: Bad request");
            },
            500: function () {
                errid("contactbutton");
                errmsg("Error: Internal server error")
            },
            200: function () {
                document.body.innerHTML = "<p>Contact received!</p>";
            }
        }
    });
});
document.body.addEventListener("keydown", function (e) {
    if (! sb.parentElement) {
        return;
    }
    if (e.code == "Enter") {
        sb.click();
    }
});
document.getElementById("message").addEventListener("input", function () {
    if (! sb.parentElement) {
        return;
    }
    document.getElementById("charcount").innerHTML = this.value.length + "/1000 chars";
    if (Number(this.value.length) < 30 || Number(this.value.length) > 1000) {
        $("#charcount").addClass("redtext");
    } else {
        $("#charcount").removeClass("redtext");
    }
});