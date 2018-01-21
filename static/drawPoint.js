
var errorDialogEx = function (ele) {
    var self = this;
    self.showDialog = function(){
        //ele.css({'display':'block'});
        ele.fadeIn(300);
    }
    self.hideDialog = function() {
        ele.css({'display':'none'});
    }
    ele.on('click',function(){
        ele.css({'display':'none'});
    })
}
var errorDialog = new errorDialogEx($('#dialog_ex'));
var exportDialog = new errorDialogEx($('#export_image_ex'));
//exportDialog.showDialog();

//600
var unit = 'cm';
var canvasGridWidth = 600;
var canvasWidth = 660;
var canvasHeight = 660;
var points_list = [];
var lines_list = [];
var map = {};
var line_map = {};
var drawing = false;
var start_mouse_left = 0;
var start_mouse_top = 0;
var end_mouse_left = 0;
var end_mouse_top = 0;
var start_point = null;
var end_point = null;
var pVal = 0;
var isEdit = true;
/*
$('#canvas_grid').css({
    'width':canvasWidth+'px',
    'height':canvasHeight+'px'
});
*/
function init(){
    points_list = [];
    lines_list = [];
    map = {};
    line_map = {};
    drawing = false;
    start_mouse_left = 0;
    start_mouse_top = 0;
    end_mouse_left = 0;
    end_mouse_top = 0;
    start_point = null;
    end_point = null;
    $('#canvas_background').find('.number').remove();
    $('#canvas_background').find('.line').remove();
    $('#canvas_background').find('.point').remove();
    $('#canvas_background').find('.grid_line').remove();
    $('#canvas_background').find('.y_line').remove();
    $('#canvas_background').find('.short_value').remove();
}
drawGrid(9,9); //初始化 9*9
function drawGrid(rows,cols){
    init();
    var grid_id = 0;
    var val = 0;
    if(rows > cols){
        val = canvasGridWidth*1.0/(rows-1);
    }else{
        val = canvasGridWidth*1.0/(cols-1);
    }
    pVal = val;
    var left = 30;
    var right = left+(cols-1)*val;
    var top = 50;
    var bottom = top+(rows-1)*val;
    for(var i=0;i<rows;i++){
        $('#canvas_background').append('<div class="grid_line" id="'+grid_id+'"></div>');
        drawLine($('#'+grid_id),left,top+i*val,right,top+i*val);
        grid_id++;
        if((rows-i)!=1){
            var sid = 'y_'+(i+1);
            $('#canvas_background').append('<div class="number" id="'+sid+'">'+(rows-i)+'</div>');
            drawNumberEx($('#'+sid),left-15,top+i*val-5);
        }
    }
    for(var j=0;j<cols;j++){
        $('#canvas_background').append('<div class="grid_line" id="'+grid_id+'"></div>');
        drawLine($('#'+grid_id),left+j*val,top,left+j*val,bottom);
        grid_id++;
        var sid = 'x_'+(j+1);
        $('#canvas_background').append('<div class="number" id="'+sid+'">'+(j+1)+'</div>');
        drawNumberEx($('#'+sid),left+j*val-4,bottom+5);
    }
    drawGridPoints(rows,cols,val);
}
function drawGridPoints(rows,cols,val){
    var left = 30;
    var top = 50;
    for(var i=0;i<rows;i++)
    {
        for(var j=0;j<cols;j++){
            var _left = left + j*val;
            var _top = top + i*val;
            points_list.push({
                'left':_left,
                'top':_top,
                'x':(j+1),
                'y':(rows-i)
            })
        }
    }
}
$('#selector').change(function(){
    unit = $(this).val();
})
$('#size_btn').on('click',function(){
    var rows = parseInt($('#grid_rows').val());
    var cols = parseInt($('#grid_cols').val());
    if(!checkNumber(rows) || !checkNumber(cols)){
        log('行数和列数必须为数字','error');
        return;
    }
    if(rows>30 || cols>30 || rows<3 || cols<3){
        log('行数和列数范围是 [3,30]','error');
        return;
    }

    isEdit = true;
    clearLog();
    drawGrid(rows,cols);
})
$('#reset_btn').on('click',function(){
    isEdit = true;
    clearLog();
    $('#size_btn').click();
})
$('#excute_btn').on('click',function (evt) {
    var m_points = [];
    var k = 0;
    for(var i in points_list){
        var _id = points_list[i].x + '_' + points_list[i].y;
        if( map[_id] == 1)
            m_points[k++] = [points_list[i].x,points_list[i].y];
    }
    var m_lines = [];
    k=0;
    for(var i in lines_list){

        var start = [lines_list[i].start.x,lines_list[i].start.y];
        var end = [lines_list[i].end.x,lines_list[i].end.y];
        var _id = lines_list[i].start.x + '_' + lines_list[i].start.y + '_' + lines_list[i].end.x + '_' + lines_list[i].end.y;
        if(line_map[_id] == 1 )
            m_lines[k++] = [start,end];
    }

    var postData={
        'points':JSON.stringify(m_points),
        'd':$('#d_size').val(),
        'unit':unit,
        'restriction':JSON.stringify(m_lines)
    }
    console.log(JSON.stringify(postData));
    $.window.http.post('/acquire_route_with_path',postData,function(data){
        console.log(data);

        var rout_id = 0;
        if(data.status == 0){
            var rows = parseInt($('#grid_rows').val());
            var cols = parseInt($('#grid_cols').val());
            drawGrid(rows,cols);
            $('#canvas_background').append('<div class="short_value">最短路径长度为：'+data.shortest_distance +'</div>');
            var restriction = data.restriction;
            for(var i in restriction){
                var line = restriction[i];
                var start = line[0];
                var end = line[1];
                var start_left;
                var start_top;
                var end_left;
                var end_top;
                for(var j in points_list){
                    var pos = points_list[j];
                    if(start[0] == pos.x && start[1] == pos.y){
                        start_left = pos.left;
                        start_top = pos.top;
                    }
                    if(end[0] == pos.x && end[1] == pos.y){
                        end_left = pos.left;
                        end_top = pos.top;
                    }
                }
                $('#canvas_background').append('<div class="line" id="fal_'+rout_id+'"></div>');
                drawLineEx($('#fal_'+rout_id),start_left,start_top,end_left,end_top);
                rout_id++;
            }
            var route = data.route;
            var final_routs = [];
            for(var i=0;i<route.length-1;i++){

                var dot = route[i];
                var pos_left;
                var pos_top;
                for(var j in points_list){
                    var pos = points_list[j];
                    if(dot[0] == pos.x && dot[1] == pos.y){
                        pos_left = pos.left;
                        pos_top = pos.top;
                    }
                }
                final_routs.push({'left':pos_left,'top':pos_top});
                $('#canvas_background').append('<div class="point" id="fal_'+rout_id+'"><div class="point_number">'+(parseInt(i)+1)+'</div></div>');
                drawPointEx($('#fal_'+rout_id),pos_left,pos_top);
                rout_id++;
            }
            final_routs.push(final_routs[0]);
            for(var i=1; i < final_routs.length ;i++){
                var start = final_routs[i-1];
                var end = final_routs[i];
                $('#canvas_background').append('<div class="y_line" id="fal_'+rout_id+'"></div>');
                drawLineEx($('#fal_'+rout_id),start.left,start.top,end.left,end.top);
                rout_id++;
            }
            //$('#canvas_background').attr('disabled','false');
            //$('#canvas_background').removeAttr("disabled"); //移除disabled属性
            isEdit = false;
        }
        else{
            log(data.msg,'error');
        }
    })
})


$('#canvas_background').mousedown(function(event){
    if(!isEdit){
        log('请重置','error');
        return;
    }
    if(event.button != 0){  //不是鼠标左键
        return;
    }
    var _left = event.pageX - $('#canvas_background').offset().left;
    var _top = event.pageY - $('#canvas_background').offset().top;
    var result = judgePoint(_left,_top);
    var pos = result['pos'];
    start_point = pos;

    if(result.status == false){ //画点
        //超过20个点不让添加
        var point_num = 0;
        for(var i in points_list){
            var _id = points_list[i].x + '_' + points_list[i].y;
            if( map[_id] == 1)
                point_num++;
        }
        if(point_num>=20) {
            log('不能超过20个点','error');
        }
        else{
            console.log(pos.x,pos.y);
            var _id = pos.x+'_'+ pos.y;
            if(pos.left <=0 || pos.top <=0){
                return;
            }
            $(this).append('<div id="'+_id+'" class="point"></div>');
            drawPointEx($('#'+_id),pos.left,pos.top);
            map[_id] = 1;
            console.log('画点',pos.x,pos.y);
            log('创建点：( '+pos.x+' , '+pos.y+' )');
        }

    }else{ //画线
        drawing = true;
        start_mouse_left = pos.left;
        start_mouse_top = pos.top;
        $('#temp_line').css({'display':'block','width':'0px'});
        console.log('开始画线',pos.left,pos.top)

    }
    document.onselectstart = function () { return false; }
})

$('#canvas_background').mousemove(function(event){
    if(!isEdit)return;
    if(drawing == true){
        end_mouse_left = event.pageX - $('#canvas_background').offset().left;
        end_mouse_top = event.pageY - $('#canvas_background').offset().top;
        drawLineEx($('#temp_line'),start_mouse_left,start_mouse_top,end_mouse_left,end_mouse_top);
    }
})
$('#canvas_background').mouseup(function(event){
    if(!isEdit)return;
    var end_mouse_left = event.pageX - $('#canvas_background').offset().left;
    var end_mouse_top = event.pageY - $('#canvas_background').offset().top;
    var result = judgePoint(end_mouse_left,end_mouse_top);
    var pos = result['pos'];
    end_point = pos;

    if(drawing){
        if(result.status == true){
            var _id = start_point.x+'_'+start_point.y + '_' + end_point.x + '_' +end_point.y;
            var _ids = end_point.x + '_' +end_point.y + '_' + start_point.x+'_'+start_point.y; //反向路径
            if(start_point.x == end_point.x && start_point.y == end_point.y) //同一个点则为无效线段
            {

            }else{
                if(line_map[_id] == 1 || line_map[_ids] == 1){
                    console.log('直线已经存在');
                    log('直线已经存在','error');
                }
                else{
                    $('#canvas_background').append('<div id="'+_id+'" class="line"></div>');
                    drawLineEx($('#'+_id),start_point.left,start_point.top ,end_point.left,end_point.top);
                    line_map[_id] = 1;
                    lines_list.push({
                        'start':{
                            'x':start_point.x,
                            'y':start_point.y
                        },
                        'end':{
                            'x':end_point.x,
                            'y':end_point.y
                        }
                    })
                    console.log('线段：','('+start_point.x+','+start_point.y + ')(' + end_point.x + ',' +end_point.y+')');
                    log('创建线段：'+'( '+start_point.x+' , '+start_point.y + ' )<->( ' + end_point.x + ' , ' +end_point.y+' )');
                }
            }
        }
        $('#temp_line').css({'display':'none','width':'0px'});
    }
    drawing = false;
    document.onselectstart=null;
})
$('#canvas_background').on('mousedown','.point',function (event) {
    if(!isEdit){
        log('请重置','error');
        event.stopPropagation();
        return;
    }
    if(event.button == 2){   //mouse right
        for(var i in lines_list){
            var start_pos = lines_list[i].start;
            var end_pos = lines_list[i].end;
            var _id1 = start_pos.x + '_' + start_pos.y;
            var _id2 = end_pos.x + '_' + end_pos.y;
            var _id = _id1+'_'+_id2;
            console.log(_id1,_id2,_id);
            if($(this).attr('id') == _id1 || $(this).attr('id') == _id2){
                line_map[_id] = 0;
                $('#'+_id).remove();
            }
        }
        map[$(this).attr('id')] = 0;
        $(this).remove();
        var m_id = $(this).attr('id');
        var ps = m_id.split('_');
        log('删除点:( '+ ps[0] + ' , '+ps[1]+' )');
    }
})
$('#canvas_background').on('mousedown','.line',function (event) {
    if(!isEdit){
        log('请重置','error');
        event.stopPropagation();
        return;
    }
    console.log(event.button);
    if(event.button == 2){   //mouse right
        line_map[$(this).attr('id')] = 0;
        $(this).remove();
        var m_id = $(this).attr('id');
        var ps = m_id.split('_');
        log('删除线段:('+ps[0] + ' , '+ps[1]+' )<->( '+ps[2]+' , '+ps[3]+' )');
    }
})
function judgePoint(mouse_left,mouse_top){
    var _left = mouse_left;
    var _top = mouse_top;
    var esp = pVal/2.0;
    var result = {'status':false,'pos':{'left':0,'top':0,'x':0,'y':0},'id':'null'};
    for(var i=0;i<points_list.length;i++){
        var pos = points_list[i];
        var _id = pos.x+'_'+pos.y;
        if(_left > pos.left-esp && _left < pos.left+esp && _top > pos.top-esp && _top < pos.top + esp){
            if(map[_id] == 1){
                result['status'] = true;
                result['id'] = _id;
            }else{
                result['id'] = null;
            }
            result['pos'] = pos;
        }
    }
    return result;
}

function drawLine(ele,x1,y1,x2,y2){
    if(Math.abs(x1-x2)<2.5){ //竖线
        ele.css({
            'left':x1,
            'top':y1,
            'height':Math.abs(y1-y2)+'px'
        })
    }else if(Math.abs(y1-y2)<2.5){
        ele.css({
            'left':x1,
            'top':y1,
            'width':(Math.abs(x1-x2)+1)+'px'
        })
    }

}
function drawNumberEx(ele,x1,y1){
    ele.css({
        'left':x1+'px',
        'top':y1+'px'
    })
}
function drawPointEx(ele,x1,y1){
    ele.css({
        'left':(x1-6)+'px',
        'top':(y1-6)+'px'
    })
}
function drawLineEx(ele,x1,y1,x2,y2){
    var radius = Math.sqrt((x1-x2)*(x1-x2)+(y1-y2)*(y1-y2));
    var angle = 0;
    var x0 = x2 - x1;
    var y0 = y2 - y1;
    if(x0 >= 0 && y0 >= 0){
        angle = Math.asin(y0/radius)*180.0/Math.PI;  //第四象限
    }
    else if(x0 <= 0 && y0 >=0){
        angle = Math.asin(y0/radius)*180.0/Math.PI;  //第3象限
        angle = 180 - angle;
    }else if(x0 >= 0 && y0 < 0){
        angle = Math.asin(y0/radius)*180.0/Math.PI;  //第1象限
    }else if(x0 <= 0 && y0 < 0){
        angle = Math.asin(y0/radius)*180.0/Math.PI;  //第2象限
        angle = -angle + 180;
    }
    ele.css({
        'left':(x1+1)+'px',
        'top':(y1)+'px',
        'width':radius+'px',
        'transform':'rotate('+angle+'deg)'
    })
}
//导出图片
$('#export_btn').click(function(){
    html2canvas(document.getElementById("canvas_background")).then(function(canvas){
        document.getElementById('export_content').innerHTML = '';
        var dom = document.getElementById('export_content').appendChild(canvas);
        dom.setAttribute('id','image');
        exportDialog.showDialog();
    });
})
$('#download_btn').click(function () {
    downloadCanvas(this,'image','旅行商问题图片.png');
    exportDialog.hideDialog();
})
function downloadCanvas(link,canvasId,filename){
    link.href=document.getElementById(canvasId).toDataURL("image/png");
    link.download = filename;
}
function doNothing(){
    window.event.returnValue=false;
    return false;
}
function log(msg,flag){
    if(flag && flag == 'error')
        $('#console').append('<div><span style="color:#ff0000;font-size: 13px;">warning: </span>'+msg+'</div>');
    else
        $('#console').append('<div><span style="color:#00DB00;font-size: 13px;">success: </span>'+msg+'</div>');
    $('#console').scrollTop( $('#console')[0].scrollHeight );
}
function clearLog(){
    $('#console').html('');
}
function checkNumber(str){
    var reg=/^[0-9]*$/;
    return(reg.test(str.toString()));
}