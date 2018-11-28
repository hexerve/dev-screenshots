$(function () {
    $('#admin').hide();

    if (getCookie("token") === "") {
        window.location.href = "/login?action=login_required";
    } else {
        $.ajaxSetup({
            headers: {
                'authorization': getCookie("token")
            }
        });
        $.get("../user", {},
            function (data, status, xhr) {
                console.log(data);

                if (!data.results.user.isAdmin) {
                    window.location.href = "./";
                }
                let name = data.results.user.name;

                email = data.results.user.email;
                plan = data.results.user.plan;
                if (plan) {
                    plan = plan.charAt(0).toUpperCase() + plan.substr(1);
                    let daysLeft = parseInt((new Date(data.results.user.expires) - new Date()) / (3600 * 24 * 1000));
                }
                $("#pro").hide();

                // name = name.charAt(0).toUpperCase() + name.substr(1);
                showBody();
            }).fail(function (xhr, status, error) {
                if (xhr.status === 0) {
                    $('.alert').hide(500);
                    $('#search-msg').append(
                        '<div class="alert alert-danger alert-dismissible fade show">' +
                        '<button type="button" class="close" data-dismiss="alert">&times;</button>' +
                        '<strong>Oops! </strong>Network error.</div>'
                    );
                    showBody();
                    return;
                }

                setCookie("token", "", -1);
                window.location.href = "/login?action=login_required";
            });


        $.get("../adminAcesss/stats", {},
            function (data, status, xhr) {
                console.log(data);
                data.results.forEach(group => {
                    console.log(group)
                    $('#stats').append(
                        '<tr>' +
                        '<td>' + ((group._id.active !== undefined && group._id.active !== null) ? group._id.active : '') + '</td>' +
                        '<td>' + ((group._id.admin !== undefined && group._id.admin !== null) ? group._id.admin : '') + '</td>' +
                        '<td>' + ((group._id.plan !== undefined && group._id.plan !== null) ? group._id.plan : '') + '</td>' +
                        '<td>' + group.count + '</td>' +
                        '</tr>'
                    );
                });
            }).fail(function (xhr, status, error) {
                if (xhr.status === 0) {
                    $('.alert').hide(500);
                    $('#search-msg').append(
                        '<div class="alert alert-danger alert-dismissible fade show">' +
                        '<button type="button" class="close" data-dismiss="alert">&times;</button>' +
                        '<strong>Oops! </strong>Network error.</div>'
                    );
                    return;
                }
            });
    }

    $(document).on('click', '#create', function () {
        $('.update-users').css('display', 'none');
        $('.create-users').css('display', 'block');
    });

    $(document).on('click', '#update', function () {
        $('.update-users').css('display', 'block');
        $('.create-users').css('display', 'none');
    });

    $(document).on('click', '#search-btn', function () {
        let email = $('#email').val();
        $.get("../adminAcesss/user/" + email, {},
            function (data, status, xhr) {
                console.log(data);

                $('.create-users').css('display', 'none');
                $('.update-users').css('display', 'block');

                $('#email1').val(data.results.user.email);
                $('#name').val(data.results.user.name);
                $('#plan').val(data.results.user.plan);
                $('#isadmin').val("" + data.results.user.isAdmin);
                $('#days').val(data.results.user.expires);
                $('#timestamp').attr('title', "" + new Date(data.results.user.expiresOn));
                $('[data-toggle="tooltip"]').tooltip();

            }).fail(function (xhr, status, error) {
                if (xhr.status === 0) {
                    $('.alert').hide(500);
                    $('#search-msg').append(
                        '<div class="alert alert-danger alert-dismissible fade show">' +
                        '<button type="button" class="close" data-dismiss="alert">&times;</button>' +
                        '<strong>Oops! </strong>Network error.</div>'
                    );
                    return;
                } else {
                    errMsg = JSON.parse(xhr.responseText).message;
                    errMsg = errMsg.charAt(0).toUpperCase() + errMsg.substr(1);

                    $('.alert').hide(500);
                    $('#search-msg').append(
                        '<div class="alert alert-danger alert-dismissible fade show">' +
                        '<button type="button" class="close" data-dismiss="alert">&times;</button>' +
                        '<strong>Oops! </strong>' + errMsg + '</div>'
                    );
                }

                console.log(xhr);
            });
    });

    $(document).on('click', '#update-btn', function () {
        let data = {};
        data.email = $('#email1').val();
        data.plan = $('#plan').val();
        data.isAdmin = $('#isadmin').val();
        data.days = $('#days').val();

        $.ajax({
            url: "../adminAcesss/user",
            type: 'PUT',
            data: JSON.stringify(data),
            contentType: 'application/json',
            success: function (result) {
                $('.alert').hide(500);
                $('#list-msg').append(
                    '<div class="alert alert-success alert-dismissible fade show">' +
                    '<button type="button" class="close" data-dismiss="alert">&times;</button>' +
                    '<strong>Congratulations! </strong> User has been succesfully updated.' +
                    '</div>'
                );
            },
            error: function (xhr, textStatus, errorThrown) {
                var errMsg;
                if (xhr.status === 0) {
                    errMsg = "Network error.";
                } else {
                    errMsg = JSON.parse(xhr.responseText).message;
                    errMsg = errMsg.charAt(0).toUpperCase() + errMsg.substr(1);

                    if (errMsg === 'Validation failed.') {
                        errMsg += '<br/>Incorrect ' + JSON.parse(xhr.responseText).errors.index.join(", ");
                    }
                }

                $('.alert').hide(500);
                $('#list-msg').append(
                    '<div class="alert alert-danger alert-dismissible fade show">' +
                    '<button type="button" class="close" data-dismiss="alert">&times;</button>' +
                    '<strong>Oops! </strong> ' + errMsg +
                    '</div>'
                );
            }
        });
    });

    $(document).on('click', '#create-btn', function () {
        let data = {};
        data.email = $('#email2').val();
        data.name = $('#name2').val();
        data.mobile = $('#mobile2').val();
        data.password = $('#pass2').val();
        data.plan = $('#plan2').val();
        data.isAdmin = $('#isadmin2').val();
        data.days = $('#days2').val();

        if (data.days <= 0) {
            $('.alert').hide(500);
            $('#register-msg').append(
                '<div class="alert alert-danger alert-dismissible fade show">' +
                '<button type="button" class="close" data-dismiss="alert">&times;</button>' +
                '<strong>Oops! </strong> Plan end must be atleast of 1 day' +
                '</div>'
            );
            return;
        }

        if (!isText(data.name)) {
            $('.alert').hide(500);
            $('#register-msg').append(
                '<div class="alert alert-danger alert-dismissible fade show">' +
                '<button type="button" class="close" data-dismiss="alert">&times;</button>' +
                '<strong>Oops! </strong> Invalid name(must be greater than 3 characters)' +
                '</div>'
            );
            return;
        }

        if (!isEmail(data.email)) {
            $('.alert').hide(500);
            $('#register-msg').append(
                '<div class="alert alert-danger alert-dismissible fade show">' +
                '<button type="button" class="close" data-dismiss="alert">&times;</button>' +
                '<strong>Oops! </strong> Invalid email.' +
                '</div>'
            );
            return;
        }

        if (!isMobile(data.mobile)) {
            $('.alert').hide(500);
            $('#register-msg').append(
                '<div class="alert alert-danger alert-dismissible fade show">' +
                '<button type="button" class="close" data-dismiss="alert">&times;</button>' +
                '<strong>Oops! </strong> Invalid mobile.' +
                '</div>'
            );
            return;
        }

        if (!isPass(data.password)) {
            $('.alert').hide(500);
            $('#register-msg').append(
                '<div class="alert alert-danger alert-dismissible fade show">' +
                '<button type="button" class="close" data-dismiss="alert">&times;</button>' +
                '<strong>Oops! </strong> Invalid password(password must be greater than 8 characters)' +
                '</div>'
            );
            return;
        }


        $.ajax({
            url: "../adminAcesss/register",
            type: 'POST',
            data: JSON.stringify(data),
            contentType: 'application/json',
            success: function (result) {
                $('.alert').hide(500);
                $('#register-msg').append(
                    '<div class="alert alert-success alert-dismissible fade show">' +
                    '<button type="button" class="close" data-dismiss="alert">&times;</button>' +
                    '<strong>Congratulations! </strong> User has been succesfully created.' +
                    '</div>'
                );
            },
            error: function (xhr, textStatus, errorThrown) {
                var errMsg;
                if (xhr.status === 0) {
                    errMsg = "Network error.";
                } else {
                    errMsg = JSON.parse(xhr.responseText).message;
                    errMsg = errMsg.charAt(0).toUpperCase() + errMsg.substr(1);

                    if (errMsg === 'Validation failed.') {
                        errMsg += '<br/>Incorrect ' + JSON.parse(xhr.responseText).errors.index.join(", ");
                    }
                }

                $('.alert').hide(500);
                $('#register-msg').append(
                    '<div class="alert alert-danger alert-dismissible fade show">' +
                    '<button type="button" class="close" data-dismiss="alert">&times;</button>' +
                    '<strong>Oops! </strong> ' + errMsg +
                    '</div>'
                );
            }
        });
    });

});
