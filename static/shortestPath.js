$(function() {
    $(document).ready(function () {
        var currentX = 9,
            currentY = 9,
            currentWidth = 600,
            currentHeigh = 600;
        var chart;
        function iniChart(height,width,xMax,yMax,lineWidth,data,isClick,pathTitle,listEnabled) {
            chart =  Highcharts.chart('container', {
                chart: {
                    height:height,
                    width:width,
                    type: 'scatter',
                    margin: [50, 30, 40, 60], //没啥用
                    events: {
                        click: function(e) {
                            if(isClick){
                                // find the clicked values and the series
                                var x = e.xAxis[0].value,
                                    y = e.yAxis[0].value;
                               var series = this.series[0];
                                // series.addPoint([x, y]); //实际点
                                var _x = getInter(x.toFixed(0));
                                var _y = getInter(y.toFixed(0));
                                var xy = _x+'-'+_y;
                                var distance = Math.abs(Math.sqrt(Math.pow(x - _x, 2) + Math.pow(y - _y, 2)));
                                var html = '<li mark="'+_x+'-'+_y+'">（'+_x+'，'+_y+'）';
                                if(series.data){
                                    if(series.data.length){
                                        if(series.data.length<=19){
                                            if(distance<=2){
                                                series.addPoint([_x, _y]);
                                                var isExit = 0;
                                                $(".list-area ul li").each(function(index,item){
                                                    var mark = $(item).attr("mark");
                                                    if(mark==xy){
                                                        isExit = 1;
                                                        return false;
                                                    }
                                                });
                                                if(!isExit)  $(".list-area ul").append(html);

                                            }
                                        }else{
                                            alert('最多选中20个点');
                                        }
                                    }else{
                                        if(distance<=2){
                                            series.addPoint([_x, _y]);
                                            var isExit = 0;
                                            $(".list-area ul li").each(function(index,item){
                                                var mark = $(item).attr("mark");
                                                if(mark==xy){
                                                    isExit = 1;
                                                    return false;
                                                }
                                            });
                                            if(!isExit)  $(".list-area ul").append(html);
                                        }
                                        // console.log("x和y值分别为：" + _x + " y: " + _y);
                                    }

                                }
                            }


                        }
                    }
                },
                navigation: {
                    buttonOptions: {
                        enabled: false
                    }
                },
                credits:{
                    enabled: false,
                    href:''
                },
                title: {
                    text: ''
                },
                subtitle: {
                    text: pathTitle
                },
                xAxis: {
                    tickInterval: 1, //网格线宽度
                    labels: {
                        step: 1
                    },
                    gridLineWidth: 1,
                    minPadding: 0,
                    maxPadding: 0,
                    min: 1,
                    max: xMax
                },
                yAxis: {
                    title: {
                        text: ''
                    },
                    labels: {
                        step: 1
                    },
                    minPadding: 0,
                    gridLineWidth:1,
                    maxPadding: 0,
                    plotLines: [{
                        value: 0,
                        width: 1,
                        color: '#808080'
                    }],
                    tickInterval: 1,
                    min: 1,
                    max:yMax
                },
                legend: {
                    enabled: false
                },
                exporting: {
                    enabled: true,
                    // url: 'https://img.hcharts.cn/export.highcharts.com.cn'
                },
                plotOptions: {
                    series: {
                        dataLabels: {
                            align: 'right',
                            enabled: listEnabled,
                            y: -5,
                            color:'#FF0000',
                            style:{
                                color: 'red',
                                fontSize: '14px',
                                fontWeight:'400',
                                fill:'rgb(255, 0, 0)',
                                stroke: 'rgb(255, 0, 0)',
                            },
                            formatter: function(){
                                return this.point.index+1;
                            }
                        },
                        lineWidth: lineWidth,
                        point: {
                            events: {
                                'click': function() {
                                    if(isClick){
                                        var x= this.x,
                                            y= this.y,
                                            xy=x+'-'+y;

                                        $(".list-area ul li").each(function(index,item){
                                            var mark = $(item).attr("mark");
                                            if(mark==xy){
                                                $(item).remove();
                                            }
                                        });
                                        this.remove();
                                    }
                                }
                            }
                        }
                    }
                },
                series: [{
                    name: '坐标',
                    data: data //初始点
                }]
            });
        }
        iniChart(600,600,9,9,0,[],true,'',false);
        //设置网格大小
        $('#setUp').click(function () {
            var xVal = Number($(".x-axis").val()),
                yVal = Number($(".y-axis").val());
                currentX = xVal,
                currentY = yVal;
            currentWidth = 600;
            currentHeigh = 600;
            if(xVal == yVal ){
                iniChart(600,600,xVal,yVal,0,[],true,'',false);
            }else if(xVal>yVal){
                var hightVal = ((yVal/xVal)*510).toFixed(0);
                var hight = Number(hightVal)+90;
                currentWidth = 600;
                currentHeigh = hight;
                iniChart(hight,600,xVal,yVal,0,[],true,'',false);
            }else{
                var withVal = ((xVal/yVal)*510).toFixed(0);
                var width = Number(withVal)+90;
                currentWidth = width;
                currentHeigh = 600;
                iniChart(600,width,xVal,yVal,0,[],true,'',false);
            }
            $(".list-area ul").html('');
            $(".short-path").html('');

        });
        // activate the button
        $('#reset').click(function () {
            var chart = $('#container').highcharts();
            var dotArr = chart.series[0].data;
            while(dotArr.length){
                dotArr[0].remove();
            }
            $(".list-area ul").html('');
            $(".short-path").html('');
            iniChart(currentHeigh,currentWidth,currentX,currentY,0,[],true,'',false);
        });
        //计算
        $('#calculate').click(function () {
            var chart = $('#container').highcharts(),
                dotArr = chart.series[0].data,
                unit = $("select").val(),
                unitVal = Number($(".unit-val").val());
            var newArr = dealArr(dotArr);
            var arrJson = JSON.stringify(newArr);
            var obj = {
                unit:unit,
                d:unitVal,
                points:arrJson
            }
            // var pathTitle = '最短路径为24cm';
            // iniChart(currentHeigh,currentWidth,currentX,currentY,1,newArr,false,pathTitle,true);
            // $(".short-path").html('23cm');
            // fillListHtml(newArr);
            // $(this).addClass("done");

            if(dotArr.length){
                if(dotArr.length<3){
                    alert('请选中三个点以上');
                }else{
                    $.ajax({
                        type:'POST',
                        url: "acquire_route",
                        data: obj,
                        dataType:'json',
                        success: function(data){
                            if(data){
                                var distance = data.shortest_distance;
                                var newArr = data.route;
                                var pathTitle = '最短路径为'+distance;
                                iniChart(currentHeigh,currentWidth,currentX,currentY,1,newArr,false,pathTitle,true);
                                $(".short-path").html(distance);
                                fillListHtml(newArr);
                                $(this).addClass("done");
                            }

                        }});


                }
            }else{
                alert('请选中三个点以上');
            }
        });
        //导出
        $("#export").click(function () {
            chart.exportChart({
                type: 'image/png',
                filename: 'mychart_' + Date.parse(new Date())
            });
        });
        function dealArr(arr) {
            if(arr){
                var arrList= [];
                for(var i=0; i<arr.length; i++ ){
                    var newArr =[];
                    newArr.push(arr[i].x);
                    newArr.push(arr[i].y);
                    arrList.push(newArr);
                }
                return arrList;
            }
        }
        function fillListHtml(arr) {
            if(arr){
               var html = '';
                for(var i=0;i<arr.length;i++){
                    html += '<div><label class="fl">'+Number(i+1)+'、</label><li mark="'+arr[i][0]+'-'+arr[i][1]+'">（'+arr[i][0]+'，'+arr[i][1]+'）</div>';
                }
                $(".list-area ul").html(html);
            }
        }
        function getInter(val) {
            var valArr = val.split();
            var valInt = Number(valArr[0]);
            var valDecimal = Number(valArr[1]);
            if(valDecimal-5>0){
                valInt += 1;
            }
            return valInt;
        }
    });
});
