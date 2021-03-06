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
                let name = data.results.user.name;

                email = data.results.user.email;

                plan = data.results.user.plan;
                let getPlan;
                if (plan) {
                    getPlan = plan.charAt(0).toUpperCase() + plan.substr(1);
                }
                let daysLeft = parseInt((new Date(data.results.user.expires) - new Date()) / (3600 * 24 * 1000));
                $("#pro").attr("href", "/payment");

                if (getPlan) {
                    $("#pro").empty();
                    if (data.results.user.subscription && data.results.user.subscription.stripeSubsId) {
                        $("#pro").append(getPlan);
                        $("#pro").attr("href", "/subscription");
                    } else {
                        $("#pro").append(getPlan + " ( " + daysLeft + " Days Left )");
                    }
                }

                if (data.results.user.isAdmin) {
                    $('#admin').show();
                    $('#pro').hide();
                }
                showBody();
            }).fail(function (xhr, status, error) {
            if (xhr.status === 0) {
                $('.alert').hide(500);
                $('#pass-msg').append(
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
    }

    $.get("../user/transaction", {},
        function (data, status, xhr) {
            console.log(data);

            if ((!data.results.transactions || data.results.transactions.length === 0) &&
                (!data.results.previousSubscriptions || data.results.previousSubscriptions.length === 0)) {
                $('.alert').hide(500);
                $('#err-msg').append(
                    '<div class="alert alert-danger alert-dismissible fade show">' +
                    '<button type="button" class="close" data-dismiss="alert">&times;</button>' +
                    '<strong>Oops! </strong>No record found.</div>'
                );
                return;
            }

            for (let i = 0; i < data.results.transactions.length; i++) {
                $('.transactions tbody').append(
                    '<tr>' +
                    '<td>' + i + '</td>' +
                    '<td class="break">' + data.results.transactions[i].txnID + '</td>' +
                    '<td class=""><b>$ ' + (parseInt(data.results.transactions[i].amount) / 100) + '</b></td>' +
                    '<td>' + (String)(new Date(data.results.transactions[i].generation_timestamp)).split(' GMT')[0] + '</td>' +
                    '</tr>'
                );
            }

            for (let i = 0; i < data.results.previousSubscriptions.length; i++) {
                let subsPlan = data.results.previousSubscriptions[i].plan;
                $('.subscriptions tbody').append(
                    '<tr>' +
                    '<td>' + i + '</td>' +
                    '<td class="break">' + data.results.previousSubscriptions[i].stripeSubsId + '</td>' +
                    '<td class=""><b>' + subsPlan + ' $ ' + ((subsPlan === "lite") ? 9.99 :
                        (subsPlan === "professional") ? 19.99 : 29.99) + '</b></td>' +
                    '<td>' + (String)(new Date(data.results.previousSubscriptions[i].start)).split(' GMT')[0] + '</td>' +
                    '<td>' + (String)(new Date(data.results.previousSubscriptions[i].end)).split(' GMT')[0] + '</td>' +
                    '</tr>'
                );
            }

        }).fail(function (xhr, status, error) {
        if (xhr.status === 0) {
            $('.alert').hide(500);
            $('#err-msg').append(
                '<div class="alert alert-danger alert-dismissible fade show">' +
                '<button type="button" class="close" data-dismiss="alert">&times;</button>' +
                '<strong>Oops! </strong>Network error.</div>'
            );
            return;
        }
    });
});