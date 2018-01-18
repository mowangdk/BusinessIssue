$.extend({
    window:{
        http:{
            post:function(url,data,fn,complete,error) {
                //data['_xsrf'] = getCookie('_xsrf');
                $.ajax({
                    'type': 'post',
                    'url': url,
                    'data': data,
                    'datatype': 'json',
                    'async':true,
                    'success': function (result) {
                        if (typeof fn === 'function') {
                            fn(result);
                        }
                    },
                    'complete': function () {
                        if (typeof complete === 'function') {
                            complete();
                        }
                    },
                    'error': function () {

                        if (typeof error === 'function') {
                            error();
                        }
                    }
                });
            },
            post_file:function(url,data,fn,complete,error){
                $.ajax({
                    'url': url,
                    'type': 'post',
                    'data': data,
                    'async': true,
                    'cache': false,
                    'contentType': false,
                    'processData': false,
                    'success':function(result){
                        if (typeof fn === 'function') {
                            fn(result);
                        }
                    },
                    'complete': function () {
                        if (typeof complete === 'function') {
                            complete();
                        }
                    },
                    'error': function () {

                        if (typeof error === 'function') {
                            error();
                        }

                    }
                });
            }
        }
    }
})